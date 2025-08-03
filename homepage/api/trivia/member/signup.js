// API endpoint for member signup
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        await handleSignup(req, res);
        break;
      case 'GET':
        await handleGetStats(req, res);
        break;
      default:
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Member API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// POST - Handle signup
async function handleSignup(req, res) {

  try {
    const { name, email, password, icon } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Name, email, and password are required'
      });
    }

    // Check if email already exists
    const existingMember = await pool.query(
      'SELECT id FROM members WHERE email = $1',
      [email]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({
        error: 'Email already registered',
        details: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create member
    const result = await pool.query(
      `INSERT INTO members (name, email, password_hash, icon, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id, name, email, icon, created_at`,
      [name, email, hashedPassword, icon || '']
    );

    const member = result.rows[0];

    // Generate simple token (in production, use JWT)
    const token = Buffer.from(`${member.id}:${Date.now()}`).toString('base64');

    res.status(200).json({
      success: true,
      message: 'Member account created successfully!',
      token: token,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        icon: member.icon
      }
    });

  } catch (error) {
    console.error('Member signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create member account',
      details: error.message
    });
  }
}

// GET - Get member statistics
async function handleGetStats(req, res) {
  try {
    const { memberToken } = req.query;
    
    if (!memberToken) {
      return res.status(400).json({ error: 'Member token required' });
    }

    // Decode member token to get member ID
    const decoded = Buffer.from(memberToken, 'base64').toString('utf-8');
    const memberId = decoded.split(':')[0];

    // First, check if the member exists
    const memberCheck = await pool.query('SELECT id FROM members WHERE id = $1', [memberId]);
    if (memberCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Check if tracking tables exist before querying them
    try {
      // Get member's game statistics with safe fallbacks
      const statsQuery = `
        SELECT 
          COALESCE(SUM(gs.final_score), 0) as total_score,
          COUNT(DISTINCT gs.id) as games_played,
          COALESCE(COUNT(qr.id), 0) as questions_answered,
          COALESCE(COUNT(CASE WHEN qr.is_correct = true THEN 1 END), 0) as correct_answers,
          COALESCE(AVG(gs.final_score), 0) as avg_score
        FROM members m
        LEFT JOIN game_sessions gs ON m.id = gs.member_id
        LEFT JOIN question_responses qr ON gs.id = qr.session_id
        WHERE m.id = $1
      `;

      const statsResult = await pool.query(statsQuery, [memberId]);
      const stats = statsResult.rows[0];

      res.status(200).json({
        totalScore: parseInt(stats.total_score) || 0,
        gamesPlayed: parseInt(stats.games_played) || 0,
        questionsAnswered: parseInt(stats.questions_answered) || 0,
        correctAnswers: parseInt(stats.correct_answers) || 0,
        avgScore: parseFloat(stats.avg_score) || 0
      });

    } catch (tableError) {
      // If tracking tables don't exist yet, return zero stats
      console.log('Tracking tables not found, returning zero stats:', tableError.message);
      res.status(200).json({
        totalScore: 0,
        gamesPlayed: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        avgScore: 0
      });
    }

  } catch (error) {
    console.error('Error fetching member stats:', error);
    res.status(500).json({ error: 'Failed to fetch member statistics' });
  }
} 
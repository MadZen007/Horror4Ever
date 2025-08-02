// API endpoint to get member statistics
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { memberToken } = req.body;
    
    if (!memberToken) {
      return res.status(400).json({ error: 'Member token required' });
    }

    // Decode member token to get member ID
    const decoded = Buffer.from(memberToken, 'base64').toString('utf-8');
    const memberId = decoded.split(':')[0];

    // Get member's game statistics
    const statsQuery = `
      SELECT 
        COALESCE(SUM(gs.final_score), 0) as total_score,
        COUNT(DISTINCT gs.id) as games_played,
        COUNT(qr.id) as questions_answered,
        COUNT(CASE WHEN qr.is_correct = true THEN 1 END) as correct_answers,
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

  } catch (error) {
    console.error('Error fetching member stats:', error);
    res.status(500).json({ error: 'Failed to fetch member statistics' });
  }
} 
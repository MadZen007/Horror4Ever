// API endpoint to handle user suggestions for new trivia questions
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      question,
      correctAnswer,
      wrongAnswer1,
      wrongAnswer2,
      wrongAnswer3,
      imageUrl,
      explanation,
      memberToken
    } = req.body;

    // Validate required fields
    if (!question || !correctAnswer || !wrongAnswer1 || !wrongAnswer2 || !wrongAnswer3) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Question, correct answer, and all wrong answers are required'
      });
    }

    // Validate member token
    if (!memberToken) {
      return res.status(401).json({
        error: 'Authentication required',
        details: 'Member login required to submit suggestions'
      });
    }

    // Decode token to get member ID
    let memberId;
    try {
      const decoded = Buffer.from(memberToken, 'base64').toString();
      memberId = decoded.split(':')[0];
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid token',
        details: 'Please log in again'
      });
    }

    // Get member info from database
    const memberResult = await pool.query(
      'SELECT id, name, icon FROM members WHERE id = $1',
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Member not found',
        details: 'Please log in again'
      });
    }

    const member = memberResult.rows[0];

    // Create options array with correct answer in random position
    const options = [correctAnswer, wrongAnswer1, wrongAnswer2, wrongAnswer3];
    // Shuffle the options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    // Insert the suggestion into the database as pending
    const sql = `
      INSERT INTO trivia_questions 
      (question, image_url, options, correct_answer, explanation, category, difficulty, is_approved, member_credits)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    const params = [
      question,
      imageUrl || '../images/skeletonquestion.png',
      JSON.stringify(options),
      correctAnswer,
      explanation || '',
      'horror',
      1, // Default difficulty
      false, // Not approved yet
      JSON.stringify({
        name: member.name,
        icon: member.icon || '',
        memberId: member.id,
        submittedAt: new Date().toISOString()
      })
    ];

    await pool.query(sql, params);

    res.status(200).json({
      success: true,
      message: 'Suggestion submitted successfully! Your question will be reviewed and added to the game once approved.',
      memberName: member.name
    });

  } catch (error) {
    console.error('Suggestion submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit suggestion',
      details: error.message
    });
  }
} 
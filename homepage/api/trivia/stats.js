// API endpoint for trivia statistics
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get basic question statistics
    const questionStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_approved = true THEN 1 END) as approved,
        COUNT(CASE WHEN is_approved = false THEN 1 END) as pending,
        COUNT(CASE WHEN category = 'horror' THEN 1 END) as horror_questions,
        COUNT(CASE WHEN difficulty = 1 THEN 1 END) as easy_questions,
        COUNT(CASE WHEN difficulty = 2 THEN 1 END) as medium_questions,
        COUNT(CASE WHEN difficulty = 3 THEN 1 END) as hard_questions
      FROM trivia_questions
    `);

    // For now, we'll use placeholder data for game statistics
    // In the future, you can create additional tables to track these
    const stats = {
      total: parseInt(questionStats.rows[0].total) || 0,
      approved: parseInt(questionStats.rows[0].approved) || 0,
      pending: parseInt(questionStats.rows[0].pending) || 0,
      horrorQuestions: parseInt(questionStats.rows[0].horror_questions) || 0,
      easyQuestions: parseInt(questionStats.rows[0].easy_questions) || 0,
      mediumQuestions: parseInt(questionStats.rows[0].medium_questions) || 0,
      hardQuestions: parseInt(questionStats.rows[0].hard_questions) || 0,
      
      // Placeholder data - you can implement real tracking later
      gamesPlayed: 0,
      siteVisits: 0,
      averageScore: 0,
      totalPlayers: 0,
      
      // Additional stats
      categories: {
        horror: parseInt(questionStats.rows[0].horror_questions) || 0
      },
      difficulties: {
        easy: parseInt(questionStats.rows[0].easy_questions) || 0,
        medium: parseInt(questionStats.rows[0].medium_questions) || 0,
        hard: parseInt(questionStats.rows[0].hard_questions) || 0
      }
    };

    res.status(200).json(stats);

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Failed to load statistics',
      details: error.message
    });
  }
} 
// API endpoint for trivia statistics
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = async function handler(req, res) {
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

    // Get real game statistics from tracking tables
    const gameStats = await pool.query(`
      SELECT 
        COUNT(*) as total_games,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed_games,
        AVG(CASE WHEN completed = true THEN total_score END) as avg_score,
        SUM(CASE WHEN completed = true THEN total_score END) as total_score,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM game_sessions
    `);

    const visitStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT ip_address) as unique_visits,
        COUNT(*) as total_visits
      FROM site_visits
      WHERE created_at > NOW() - INTERVAL '7 days'
    `).catch(() => ({ rows: [{ unique_visits: 0, total_visits: 0 }] }));

    const responseStats = await pool.query(`
      SELECT 
        COUNT(*) as total_responses,
        COUNT(CASE WHEN is_correct = true THEN 1 END) as correct_responses,
        AVG(time_taken) as avg_time_taken
      FROM question_responses
    `);

    const stats = {
      total: parseInt(questionStats.rows[0].total) || 0,
      approved: parseInt(questionStats.rows[0].approved) || 0,
      pending: parseInt(questionStats.rows[0].pending) || 0,
      horrorQuestions: parseInt(questionStats.rows[0].horror_questions) || 0,
      easyQuestions: parseInt(questionStats.rows[0].easy_questions) || 0,
      mediumQuestions: parseInt(questionStats.rows[0].medium_questions) || 0,
      hardQuestions: parseInt(questionStats.rows[0].hard_questions) || 0,
      
      // Real tracking data
      gamesPlayed: parseInt(gameStats.rows[0].completed_games) || 0,
      siteVisits: parseInt(visitStats.rows[0].unique_visits) || 0,
      totalPageLoads: parseInt(visitStats.rows[0].total_visits) || 0,
      averageScore: Math.round(parseFloat(gameStats.rows[0].avg_score) || 0),
      totalPlayers: parseInt(gameStats.rows[0].unique_sessions) || 0,
      totalScore: parseInt(gameStats.rows[0].total_score) || 0,
      
      // Additional stats
      categories: {
        horror: parseInt(questionStats.rows[0].horror_questions) || 0
      },
      difficulties: {
        easy: parseInt(questionStats.rows[0].easy_questions) || 0,
        medium: parseInt(questionStats.rows[0].medium_questions) || 0,
        hard: parseInt(questionStats.rows[0].hard_questions) || 0
      },
      
      // Response statistics
      totalResponses: parseInt(responseStats.rows[0].total_responses) || 0,
      correctResponses: parseInt(responseStats.rows[0].correct_responses) || 0,
      averageResponseTime: Math.round(parseFloat(responseStats.rows[0].avg_time_taken) || 0)
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
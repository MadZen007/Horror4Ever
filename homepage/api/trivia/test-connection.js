// Test endpoint to verify CockroachDB connection
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  try {
    // Test the connection
    const result = await pool.query('SELECT NOW() as current_time, COUNT(*) as table_count FROM trivia_questions');
    
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      currentTime: result.rows[0].current_time,
      questionCount: result.rows[0].table_count
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Database connection failed'
    });
  }
} 
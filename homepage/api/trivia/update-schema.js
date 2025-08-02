// Script to update database schema for member credits
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
    // Add member_credits column if it doesn't exist
    const addColumnSQL = `
      ALTER TABLE trivia_questions 
      ADD COLUMN IF NOT EXISTS member_credits JSONB DEFAULT NULL
    `;

    await pool.query(addColumnSQL);

    res.status(200).json({
      success: true,
      message: 'Database schema updated successfully! Added member_credits column.'
    });

  } catch (error) {
    console.error('Schema update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update schema',
      details: error.message
    });
  }
} 
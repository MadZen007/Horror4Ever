// API endpoint to fetch individual question by ID
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
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    const sql = 'SELECT * FROM trivia_questions WHERE id = $1';
    const result = await pool.query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.status(200).json(result.rows[0]);
    
  } catch (error) {
    console.error('GET Question Error:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
} 
// API endpoint to setup movies table
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
    // Create movies table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS movies (
        id BIGSERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        year INTEGER NOT NULL,
        youtube_id VARCHAR(20) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(createTableQuery);
    
    // Create indexes
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year DESC);
      CREATE INDEX IF NOT EXISTS idx_movies_created_at ON movies(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
    `;
    
    await pool.query(createIndexesQuery);
    
    res.status(200).json({ 
      success: true, 
      message: 'Movies table created successfully!' 
    });
    
  } catch (error) {
    console.error('Error setting up movies table:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to setup movies table',
      details: error.message 
    });
  }
} 
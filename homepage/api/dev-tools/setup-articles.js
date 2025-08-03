// API endpoint to setup articles table
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
    // Create articles table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        author VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        summary TEXT,
        content TEXT NOT NULL,
        thumbnail TEXT,
        tags TEXT[] DEFAULT '{}',
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await pool.query(createTableQuery);

    // Create indexes for better performance
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
      CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published);
      CREATE INDEX IF NOT EXISTS idx_articles_date ON articles(date DESC);
      CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
    `;

    await pool.query(createIndexesQuery);

    res.status(200).json({
      success: true,
      message: 'Articles table created successfully!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error setting up articles table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to setup articles table',
      details: error.message
    });
  }
} 
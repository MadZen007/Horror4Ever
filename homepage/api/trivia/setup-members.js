// Script to set up members table
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
    // Create members table
    const createMembersTable = `
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        icon TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await pool.query(createMembersTable);

    // Create index on email for faster lookups
    const createEmailIndex = `
      CREATE INDEX IF NOT EXISTS idx_members_email ON members(email)
    `;

    await pool.query(createEmailIndex);

    res.status(200).json({
      success: true,
      message: 'Members table created successfully!'
    });

  } catch (error) {
    console.error('Members table setup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create members table',
      details: error.message
    });
  }
} 
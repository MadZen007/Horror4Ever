// Script to add profile_data column to members table
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
    // Add profile_data column to members table
    const addColumnSQL = `
      ALTER TABLE members 
      ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT NULL
    `;
    
    await pool.query(addColumnSQL);
    
    res.status(200).json({ 
      success: true, 
      message: 'Database schema updated successfully! Added profile_data column to members table.' 
    });
  } catch (error) {
    console.error('Schema update error:', error);
    res.status(500).json({ error: 'Failed to update database schema' });
  }
} 
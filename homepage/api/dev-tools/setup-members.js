// Script to set up members table
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        await handleSetupMembers(req, res);
        break;
      case 'PUT':
        await handleUpdateSchema(req, res);
        break;
      default:
        res.setHeader('Allow', ['POST', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Setup API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// POST - Setup members table
async function handleSetupMembers(req, res) {
  try {
    // Create members table
    const createMembersTable = `
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        icon TEXT DEFAULT '',
        profile_data JSONB DEFAULT NULL,
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

// PUT - Update schema
async function handleUpdateSchema(req, res) {
  try {
    // Add profile_data column to members table
    const addColumnSQL = `
      ALTER TABLE members 
      ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT NULL
    `;
    
    await pool.query(addColumnSQL);
    
    res.status(200).json({ 
      success: true, 
      message: 'Database schema updated successfully! Added profile_data column.' 
    });
  } catch (error) {
    console.error('Schema update error:', error);
    res.status(500).json({ error: 'Failed to update database schema' });
  }
} 
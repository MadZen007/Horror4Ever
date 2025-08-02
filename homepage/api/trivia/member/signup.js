// API endpoint for member signup
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

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
    const { name, email, password, icon } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Name, email, and password are required'
      });
    }

    // Check if email already exists
    const existingMember = await pool.query(
      'SELECT id FROM members WHERE email = $1',
      [email]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({
        error: 'Email already registered',
        details: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create member
    const result = await pool.query(
      `INSERT INTO members (name, email, password_hash, icon, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id, name, email, icon, created_at`,
      [name, email, hashedPassword, icon || '']
    );

    const member = result.rows[0];

    // Generate simple token (in production, use JWT)
    const token = Buffer.from(`${member.id}:${Date.now()}`).toString('base64');

    res.status(200).json({
      success: true,
      message: 'Member account created successfully!',
      token: token,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        icon: member.icon
      }
    });

  } catch (error) {
    console.error('Member signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create member account',
      details: error.message
    });
  }
} 
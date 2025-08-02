// API endpoint for member login
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
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Email and password are required'
      });
    }

    // Find member by email
    const result = await pool.query(
      'SELECT id, name, email, password_hash, icon FROM members WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    const member = result.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, member.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    // Generate simple token (in production, use JWT)
    const token = Buffer.from(`${member.id}:${Date.now()}`).toString('base64');

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token: token,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        icon: member.icon
      }
    });

  } catch (error) {
    console.error('Member login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to authenticate',
      details: error.message
    });
  }
} 
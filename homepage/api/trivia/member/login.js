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
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        await handleLogin(req, res);
        break;
      case 'GET':
        await handleGetProfile(req, res);
        break;
      case 'PUT':
        await handleUpdateProfile(req, res);
        break;
      default:
        res.setHeader('Allow', ['POST', 'GET', 'PUT']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Member API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// POST - Handle login
async function handleLogin(req, res) {

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

// GET - Fetch member profile
async function handleGetProfile(req, res) {
  try {
    const { memberToken } = req.query;
    
    if (!memberToken) {
      return res.status(400).json({ error: 'Member token required' });
    }

    // Decode member token to get member ID
    const decoded = Buffer.from(memberToken, 'base64').toString('utf-8');
    const memberId = decoded.split(':')[0];

    // Get member profile
    const profileQuery = `
      SELECT 
        name,
        icon,
        profile_data
      FROM members 
      WHERE id = $1
    `;

    const result = await pool.query(profileQuery, [memberId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const member = result.rows[0];
    let profileData = {};
    
    if (member.profile_data) {
      try {
        profileData = typeof member.profile_data === 'string' ? 
          JSON.parse(member.profile_data) : member.profile_data;
      } catch (e) {
        profileData = {};
      }
    }

    res.status(200).json({
      username: profileData.username || member.name,
      description: profileData.description || '',
      profilePic: profileData.profilePic || member.icon || '',
      favoriteMovies: profileData.favoriteMovies || []
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

// PUT - Update member profile
async function handleUpdateProfile(req, res) {
  try {
    const { memberToken, username, description, profilePic, favoriteMovies } = req.body;
    
    if (!memberToken) {
      return res.status(400).json({ error: 'Member token required' });
    }

    // Decode member token to get member ID
    const decoded = Buffer.from(memberToken, 'base64').toString('utf-8');
    const memberId = decoded.split(':')[0];

    // Prepare profile data
    const profileData = {
      username: username || '',
      description: description || '',
      profilePic: profilePic || '',
      favoriteMovies: favoriteMovies || [],
      updatedAt: new Date().toISOString()
    };

    // Update member profile
    const updateQuery = `
      UPDATE members 
      SET 
        name = $1,
        icon = $2,
        profile_data = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `;

    await pool.query(updateQuery, [
      profileData.username,
      profileData.profilePic,
      JSON.stringify(profileData),
      memberId
    ]);

    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully',
      profile: profileData
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
} 
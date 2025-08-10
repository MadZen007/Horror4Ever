// Dev Tools Setup API
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { action } = req.body;
    
    switch (action) {
      case 'setup-articles':
        await setupArticlesTable(req, res);
        break;
      case 'setup-movies':
        await setupMoviesTable(req, res);
        break;
      case 'setup-site-visits':
        await setupSiteVisitsTable(req, res);
        break;
      case 'add-video-support':
        await addVideoSupport(req, res);
        break;
      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Setup API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Setup articles table
async function setupArticlesTable(req, res) {
  try {
    // Create articles table
    await pool.query(`
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
        youtube_id VARCHAR(20),
        is_published BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_articles_date ON articles(date)');
    
    res.status(200).json({
      success: true,
      message: 'Articles table created successfully with all necessary columns and indexes',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error setting up articles table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create articles table',
      details: error.message
    });
  }
}

// Add video support to existing articles table
async function addVideoSupport(req, res) {
  try {
    // Add youtube_id column if it doesn't exist
    await pool.query(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS youtube_id VARCHAR(20)
    `);
    
    res.status(200).json({
      success: true,
      message: 'Video support added successfully to articles table',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error adding video support:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add video support',
      details: error.message
    });
  }
} 

// Setup movies table
async function setupMoviesTable(req, res) {
  try {
    // Create movies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        year INTEGER,
        youtube_id VARCHAR(20) UNIQUE NOT NULL,
        description TEXT,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_movies_youtube_id ON movies(youtube_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_movies_views ON movies(views)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year)');
    
    res.status(200).json({
      success: true,
      message: 'Movies table created successfully with all necessary columns and indexes',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error setting up movies table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create movies table',
      details: error.message
    });
  }
} 

// Setup site visits table
async function setupSiteVisitsTable(req, res) {
  try {
    // Create site_visits table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_visits (
        id SERIAL PRIMARY KEY,
        page_url TEXT NOT NULL,
        user_agent TEXT,
        ip_address INET,
        referrer TEXT,
        session_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_site_visits_ip ON site_visits(ip_address)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_site_visits_session ON site_visits(session_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_site_visits_created ON site_visits(created_at)');
    
    res.status(200).json({
      success: true,
      message: 'Site visits table created successfully with all necessary columns and indexes',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error setting up site visits table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create site visits table',
      details: error.message
    });
  }
} 
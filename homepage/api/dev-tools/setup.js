// Consolidated API endpoint for all database setup operations
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
    const { action } = req.body;
    
    if (!action) {
      return res.status(400).json({ 
        error: 'Action required',
        details: 'Please specify which setup action to perform'
      });
    }

    switch (action) {
      case 'setup-movies':
        await setupMovies(res);
        break;
      case 'setup-articles':
        await setupArticles(res);
        break;
      case 'setup-members':
        await setupMembers(res);
        break;
      case 'update-schema':
        await updateSchema(res);
        break;
      case 'import-questions':
        await importQuestions(req, res);
        break;
      case 'add-views-column':
        await addViewsColumn(res);
        break;
      default:
        res.status(400).json({ 
          error: 'Invalid action',
          details: 'Valid actions: setup-movies, setup-articles, setup-members, update-schema, import-questions, add-views-column'
        });
    }
    
  } catch (error) {
    console.error('Setup API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error',
      details: error.message 
    });
  }
}

// Setup movies table
async function setupMovies(res) {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS movies (
        id BIGSERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        year INTEGER NOT NULL,
        youtube_id VARCHAR(20) NOT NULL,
        description TEXT,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(createTableQuery);
    
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

// Setup articles table
async function setupArticles(res) {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS articles (
        id BIGSERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        author VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        summary TEXT,
        content TEXT NOT NULL,
        thumbnail TEXT,
        tags TEXT[],
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(createTableQuery);
    
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
      CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published);
      CREATE INDEX IF NOT EXISTS idx_articles_date ON articles(date DESC);
      CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
    `;
    
    await pool.query(createIndexesQuery);
    
    res.status(200).json({ 
      success: true, 
      message: 'Articles table created successfully!' 
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

// Setup members table
async function setupMembers(res) {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS members (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(255),
        profile_data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(createTableQuery);
    
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
    `;
    
    await pool.query(createIndexesQuery);
    
    res.status(200).json({ 
      success: true, 
      message: 'Members table created successfully!' 
    });
    
  } catch (error) {
    console.error('Error setting up members table:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to setup members table',
      details: error.message 
    });
  }
}

// Update schema (add profile_data column)
async function updateSchema(res) {
  try {
    // Add profile_data column if it doesn't exist
    await pool.query(`
      ALTER TABLE members 
      ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT '{}'
    `);
    
    res.status(200).json({ 
      success: true, 
      message: 'Schema updated successfully!' 
    });
    
  } catch (error) {
    console.error('Error updating schema:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update schema',
      details: error.message 
    });
  }
}

// Import questions
async function importQuestions(req, res) {
  try {
    const { questions } = req.body;
    
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        error: 'Invalid questions data',
        details: 'Questions must be an array'
      });
    }
    
    let importedCount = 0;
    
    for (const question of questions) {
      try {
        await pool.query(
          `INSERT INTO trivia_questions (question, options, correct_answer, explanation, image_url, is_approved, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            question.question,
            JSON.stringify(question.options),
            question.correctAnswer,
            question.explanation || '',
            question.image || '',
            true // Set as approved
          ]
        );
        importedCount++;
      } catch (error) {
        console.error('Error importing question:', error);
        // Continue with next question
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Successfully imported ${importedCount} questions!`,
      importedCount
    });
    
  } catch (error) {
    console.error('Error importing questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import questions',
      details: error.message
    });
  }
}

// Add views column to movies table
async function addViewsColumn(res) {
  try {
    // Add views column if it doesn't exist
    await pool.query(`
      ALTER TABLE movies 
      ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0
    `);
    
    res.status(200).json({ 
      success: true, 
      message: 'Views column added successfully!' 
    });
    
  } catch (error) {
    console.error('Error adding views column:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add views column',
      details: error.message 
    });
  }
} 
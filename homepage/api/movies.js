// API endpoint for movies CRUD operations
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
      case 'GET':
        await handleGet(req, res);
        break;
      case 'POST':
        await handleCreate(req, res);
        break;
      case 'PUT':
        await handleUpdate(req, res);
        break;
      case 'DELETE':
        await handleDelete(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Movies API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// GET - Fetch movies
async function handleGet(req, res) {
  try {
    const { id } = req.query;
    
    if (id) {
      // Get specific movie by ID
      const result = await pool.query(
        'SELECT * FROM movies WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      
      res.status(200).json(result.rows[0]);
    } else {
      // Get all movies
      const result = await pool.query(
        'SELECT * FROM movies ORDER BY year DESC, created_at DESC'
      );
      res.status(200).json(result.rows);
    }
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
}

// POST - Create new movie
async function handleCreate(req, res) {
  try {
    const { title, year, youtube_url, description } = req.body;
    
    // Validate required fields
    if (!title || !year || !youtube_url) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Title, year, and YouTube URL are required'
      });
    }
    
    // Extract YouTube video ID from URL
    const youtubeId = extractYouTubeId(youtube_url);
    if (!youtubeId) {
      return res.status(400).json({
        error: 'Invalid YouTube URL',
        details: 'Please provide a valid YouTube video URL'
      });
    }
    
    // Check if movie already exists
    const existingMovie = await pool.query(
      'SELECT id FROM movies WHERE title = $1 AND year = $2',
      [title, year]
    );
    
    if (existingMovie.rows.length > 0) {
      return res.status(400).json({
        error: 'Movie already exists',
        details: 'A movie with this title and year already exists'
      });
    }
    
    // Create movie
    const result = await pool.query(
      `INSERT INTO movies (title, year, youtube_id, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [title, year, youtubeId, description || '']
    );
    
    res.status(201).json({
      success: true,
      message: 'Movie created successfully!',
      movie: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create movie',
      details: error.message
    });
  }
}

// PUT - Update movie
async function handleUpdate(req, res) {
  try {
    const { id } = req.query;
    const { title, year, youtube_url, description } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Movie ID required' });
    }
    
    // Check if movie exists
    const existingMovie = await pool.query('SELECT id FROM movies WHERE id = $1', [id]);
    if (existingMovie.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    // Extract YouTube video ID if URL provided
    let youtubeId = null;
    if (youtube_url) {
      youtubeId = extractYouTubeId(youtube_url);
      if (!youtubeId) {
        return res.status(400).json({
          error: 'Invalid YouTube URL',
          details: 'Please provide a valid YouTube video URL'
        });
      }
    }
    
    // Update movie
    const result = await pool.query(
      `UPDATE movies 
       SET title = COALESCE($1, title),
           year = COALESCE($2, year),
           youtube_id = COALESCE($3, youtube_id),
           description = COALESCE($4, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [title, year, youtubeId, description, id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Movie updated successfully!',
      movie: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update movie',
      details: error.message
    });
  }
}

// DELETE - Delete movie
async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Movie ID required' });
    }
    
    // Check if movie exists
    const existingMovie = await pool.query('SELECT id FROM movies WHERE id = $1', [id]);
    if (existingMovie.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    // Delete movie
    await pool.query('DELETE FROM movies WHERE id = $1', [id]);
    
    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully!'
    });
    
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete movie',
      details: error.message
    });
  }
}

// Helper function to extract YouTube video ID from URL
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
} 
// API endpoint to track movie views
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
    const { movieId } = req.body;
    
    if (!movieId) {
      return res.status(400).json({
        error: 'Movie ID required',
        details: 'Please provide a movie ID to track the view'
      });
    }

    // Increment the view count for the movie
    const result = await pool.query(
      `UPDATE movies 
       SET views = views + 1, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING views`,
      [movieId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Movie not found',
        details: 'The specified movie ID does not exist'
      });
    }

    res.status(200).json({
      success: true,
      message: 'View tracked successfully!',
      views: result.rows[0].views
    });

  } catch (error) {
    console.error('Error tracking movie view:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track view',
      details: error.message
    });
  }
} 
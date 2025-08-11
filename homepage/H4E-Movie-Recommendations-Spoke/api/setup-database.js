const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
});

async function setupMovieRecommendationTables() {
  try {
    // Table for tracking user actions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS movie_recommendation_tracking (
        id SERIAL PRIMARY KEY,
        member_token VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL,
        data JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table for user movie history (watched movies)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_movie_history (
        id SERIAL PRIMARY KEY,
        member_token VARCHAR(255) NOT NULL,
        movie_id INTEGER NOT NULL,
        movie_title VARCHAR(255) NOT NULL,
        watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        rating INTEGER CHECK (rating >= 1 AND rating <= 10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(member_token, movie_id)
      )
    `);

    // Table for rating email queue
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rating_email_queue (
        id SERIAL PRIMARY KEY,
        member_token VARCHAR(255) NOT NULL,
        movie_id INTEGER NOT NULL,
        movie_title VARCHAR(255) NOT NULL,
        scheduled_for TIMESTAMP NOT NULL,
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table for user preferences
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_movie_preferences (
        id SERIAL PRIMARY KEY,
        member_token VARCHAR(255) NOT NULL,
        subgenre VARCHAR(50),
        mood VARCHAR(50),
        region VARCHAR(50),
        timeframe VARCHAR(50),
        exclude_seen BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_movie_tracking_member_token 
      ON movie_recommendation_tracking(member_token)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_movie_tracking_action 
      ON movie_recommendation_tracking(action)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_movie_tracking_timestamp 
      ON movie_recommendation_tracking(timestamp)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_movie_history_member_token 
      ON user_movie_history(member_token)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_movie_history_movie_id 
      ON user_movie_history(movie_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_rating_email_queue_scheduled_for 
      ON rating_email_queue(scheduled_for)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_rating_email_queue_member_token 
      ON rating_email_queue(member_token)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_preferences_member_token 
      ON user_movie_preferences(member_token)
    `);

    console.log('✅ Movie recommendation database tables created successfully');

  } catch (error) {
    console.error('❌ Error setting up movie recommendation tables:', error);
    throw error;
  }
}

// Function to add movie to user's watched history
async function addWatchedMovie(memberToken, movieId, movieTitle) {
  try {
    await pool.query(`
      INSERT INTO user_movie_history (member_token, movie_id, movie_title)
      VALUES ($1, $2, $3)
      ON CONFLICT (member_token, movie_id) 
      DO UPDATE SET watched_at = CURRENT_TIMESTAMP
    `, [memberToken, movieId, movieTitle]);
  } catch (error) {
    console.error('Error adding watched movie:', error);
  }
}

// Function to save user preferences
async function saveUserPreferences(memberToken, preferences) {
  try {
    await pool.query(`
      INSERT INTO user_movie_preferences 
        (member_token, subgenre, mood, region, timeframe, exclude_seen)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (member_token) 
      DO UPDATE SET 
        subgenre = EXCLUDED.subgenre,
        mood = EXCLUDED.mood,
        region = EXCLUDED.region,
        timeframe = EXCLUDED.timeframe,
        exclude_seen = EXCLUDED.exclude_seen,
        updated_at = CURRENT_TIMESTAMP
    `, [
      memberToken,
      preferences.subgenre,
      preferences.mood,
      preferences.region,
      preferences.timeframe,
      preferences.excludeSeen
    ]);
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
}

// Function to get user preferences
async function getUserPreferences(memberToken) {
  try {
    const result = await pool.query(`
      SELECT subgenre, mood, region, timeframe, exclude_seen
      FROM user_movie_preferences
      WHERE member_token = $1
    `, [memberToken]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
}

// Function to get pending rating emails
async function getPendingRatingEmails() {
  try {
    const result = await pool.query(`
      SELECT id, member_token, movie_id, movie_title, scheduled_for
      FROM rating_email_queue
      WHERE sent_at IS NULL AND scheduled_for <= CURRENT_TIMESTAMP
      ORDER BY scheduled_for ASC
    `);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting pending rating emails:', error);
    return [];
  }
}

// Function to mark email as sent
async function markEmailAsSent(emailId) {
  try {
    await pool.query(`
      UPDATE rating_email_queue
      SET sent_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [emailId]);
  } catch (error) {
    console.error('Error marking email as sent:', error);
  }
}

// Function to get user tracking analytics
async function getUserAnalytics(memberToken) {
  try {
    const result = await pool.query(`
      SELECT 
        action,
        COUNT(*) as count,
        DATE(timestamp) as date
      FROM movie_recommendation_tracking
      WHERE member_token = $1
      GROUP BY action, DATE(timestamp)
      ORDER BY date DESC, count DESC
    `, [memberToken]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting user analytics:', error);
    return [];
  }
}

module.exports = {
  setupMovieRecommendationTables,
  addWatchedMovie,
  saveUserPreferences,
  getUserPreferences,
  getPendingRatingEmails,
  markEmailAsSent,
  getUserAnalytics
};

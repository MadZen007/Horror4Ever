/**
 * Horror Movie Research & Analysis Database Setup
 * Creates research database tables and indexes for academic research purposes
 * Designed for non-commercial research use only
 */

const { Pool } = require('pg');

// Database connection for research data
const pool = new Pool({
    connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

/**
 * Create research database tables
 */
async function setupResearchDatabase() {
    try {
        console.log('Setting up Horror Movie Research & Analysis database...');
        
        // Create research tracking table
        await createResearchTrackingTable();
        
        // Create user movie history table for research accuracy
        await createUserMovieHistoryTable();
        
        // Create rating email queue for research follow-up
        await createRatingEmailQueueTable();
        
        // Create user preferences table for research analysis
        await createUserPreferencesTable();
        
        // Create research analytics table
        await createResearchAnalyticsTable();
        
        console.log('Research database setup completed successfully');
        
    } catch (error) {
        console.error('Error setting up research database:', error);
        throw error;
    }
}

/**
 * Create research tracking table
 */
async function createResearchTrackingTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS movie_recommendation_tracking (
            id SERIAL PRIMARY KEY,
            session_id VARCHAR(255) NOT NULL,
            action VARCHAR(100) NOT NULL,
            data JSONB NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            research_metadata JSONB DEFAULT '{}'::jsonb
        );
        
        CREATE INDEX IF NOT EXISTS idx_research_tracking_session_id ON movie_recommendation_tracking(session_id);
        CREATE INDEX IF NOT EXISTS idx_research_tracking_action ON movie_recommendation_tracking(action);
        CREATE INDEX IF NOT EXISTS idx_research_tracking_timestamp ON movie_recommendation_tracking(timestamp);
    `;
    
    await pool.query(query);
    console.log('Research tracking table created');
}

/**
 * Create user movie history table
 */
async function createUserMovieHistoryTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS user_movie_history (
            id SERIAL PRIMARY KEY,
            session_id VARCHAR(255) NOT NULL,
            movie_id INTEGER NOT NULL,
            movie_title VARCHAR(255) NOT NULL,
            rating INTEGER CHECK (rating >= 1 AND rating <= 10),
            watched_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            research_notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_history_session_id ON user_movie_history(session_id);
        CREATE INDEX IF NOT EXISTS idx_user_history_movie_id ON user_movie_history(movie_id);
        CREATE INDEX IF NOT EXISTS idx_user_history_watched_date ON user_movie_history(watched_date);
    `;
    
    await pool.query(query);
    console.log('User movie history table created');
}

/**
 * Create rating email queue table
 */
async function createRatingEmailQueueTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS rating_email_queue (
            id SERIAL PRIMARY KEY,
            session_id VARCHAR(255) NOT NULL,
            movie_id INTEGER NOT NULL,
            movie_title VARCHAR(255) NOT NULL,
            scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
            sent_date TIMESTAMP WITH TIME ZONE,
            status VARCHAR(50) DEFAULT 'pending',
            email_content TEXT,
            research_follow_up BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_email_queue_session_id ON rating_email_queue(session_id);
        CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_date ON rating_email_queue(scheduled_date);
        CREATE INDEX IF NOT EXISTS idx_email_queue_status ON rating_email_queue(status);
    `;
    
    await pool.query(query);
    console.log('Rating email queue table created');
}

/**
 * Create user preferences table
 */
async function createUserPreferencesTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS user_movie_preferences (
            id SERIAL PRIMARY KEY,
            session_id VARCHAR(255) NOT NULL,
            subgenre VARCHAR(100),
            mood VARCHAR(100),
            region VARCHAR(50),
            timeframe VARCHAR(50),
            exclude_seen BOOLEAN DEFAULT false,
            research_consent VARCHAR(50) NOT NULL,
            preferences_data JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_preferences_session_id ON user_movie_preferences(session_id);
        CREATE INDEX IF NOT EXISTS idx_preferences_subgenre ON user_movie_preferences(subgenre);
        CREATE INDEX IF NOT EXISTS idx_preferences_mood ON user_movie_preferences(mood);
        CREATE INDEX IF NOT EXISTS idx_preferences_consent ON user_movie_preferences(research_consent);
    `;
    
    await pool.query(query);
    console.log('User preferences table created');
}

/**
 * Create research analytics table
 */
async function createResearchAnalyticsTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS research_analytics (
            id SERIAL PRIMARY KEY,
            metric_name VARCHAR(100) NOT NULL,
            metric_value JSONB NOT NULL,
            sample_size INTEGER DEFAULT 0,
            confidence_interval DECIMAL(5,4),
            analysis_date DATE NOT NULL,
            research_period VARCHAR(50),
            data_source VARCHAR(100) DEFAULT 'TMDb API',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_analytics_metric_name ON research_analytics(metric_name);
        CREATE INDEX IF NOT EXISTS idx_analytics_analysis_date ON research_analytics(analysis_date);
        CREATE INDEX IF NOT EXISTS idx_analytics_research_period ON research_analytics(research_period);
    `;
    
    await pool.query(query);
    console.log('Research analytics table created');
}

/**
 * Add watched movie to research history
 */
async function addWatchedMovie(sessionId, movieId, movieTitle, rating = null, notes = null) {
    const query = `
        INSERT INTO user_movie_history 
        (session_id, movie_id, movie_title, rating, research_notes) 
        VALUES ($1, $2, $3, $4, $5)
    `;
    
    await pool.query(query, [sessionId, movieId, movieTitle, rating, notes]);
}

/**
 * Save user preferences for research analysis
 */
async function saveUserPreferences(sessionId, preferences, consent) {
    const query = `
        INSERT INTO user_movie_preferences 
        (session_id, subgenre, mood, region, timeframe, exclude_seen, research_consent, preferences_data) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (session_id) 
        DO UPDATE SET 
            subgenre = EXCLUDED.subgenre,
            mood = EXCLUDED.mood,
            region = EXCLUDED.region,
            timeframe = EXCLUDED.timeframe,
            exclude_seen = EXCLUDED.exclude_seen,
            research_consent = EXCLUDED.research_consent,
            preferences_data = EXCLUDED.preferences_data,
            updated_at = NOW()
    `;
    
    await pool.query(query, [
        sessionId,
        preferences.subgenre,
        preferences.mood,
        preferences.region,
        preferences.timeframe,
        preferences.excludeSeen,
        consent,
        JSON.stringify(preferences)
    ]);
}

/**
 * Get user preferences for research analysis
 */
async function getUserPreferences(sessionId) {
    const query = 'SELECT * FROM user_movie_preferences WHERE session_id = $1';
    const result = await pool.query(query, [sessionId]);
    return result.rows[0] || null;
}

/**
 * Get pending rating emails for research follow-up
 */
async function getPendingRatingEmails() {
    const query = `
        SELECT * FROM rating_email_queue 
        WHERE status = 'pending' 
        AND scheduled_date <= NOW()
        ORDER BY scheduled_date ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
}

/**
 * Mark email as sent for research tracking
 */
async function markEmailAsSent(emailId) {
    const query = `
        UPDATE rating_email_queue 
        SET status = 'sent', sent_date = NOW() 
        WHERE id = $1
    `;
    
    await pool.query(query, [emailId]);
}

/**
 * Get research analytics data
 */
async function getUserAnalytics(sessionId) {
    const query = `
        SELECT 
            COUNT(*) as total_interactions,
            COUNT(DISTINCT action) as unique_actions,
            MIN(timestamp) as first_interaction,
            MAX(timestamp) as last_interaction
        FROM movie_recommendation_tracking 
        WHERE session_id = $1
    `;
    
    const result = await pool.query(query, [sessionId]);
    return result.rows[0] || null;
}

/**
 * Get research participation statistics
 */
async function getResearchStats() {
    const stats = {};
    
    // Total research sessions
    const sessionsResult = await pool.query(`
        SELECT COUNT(DISTINCT session_id) as total_sessions 
        FROM movie_recommendation_tracking
    `);
    stats.totalSessions = sessionsResult.rows[0]?.total_sessions || 0;
    
    // Total movies analyzed
    const moviesResult = await pool.query(`
        SELECT COUNT(DISTINCT movie_id) as total_movies 
        FROM user_movie_history
    `);
    stats.totalMovies = moviesResult.rows[0]?.total_movies || 0;
    
    // Preference distribution
    const preferencesResult = await pool.query(`
        SELECT 
            subgenre,
            mood,
            COUNT(*) as count
        FROM user_movie_preferences 
        GROUP BY subgenre, mood
        ORDER BY count DESC
    `);
    stats.preferenceDistribution = preferencesResult.rows;
    
    return stats;
}

// Export functions for use in other modules
module.exports = {
    setupResearchDatabase,
    addWatchedMovie,
    saveUserPreferences,
    getUserPreferences,
    getPendingRatingEmails,
    markEmailAsSent,
    getUserAnalytics,
    getResearchStats
};

// Run setup if this file is executed directly
if (require.main === module) {
    setupResearchDatabase()
        .then(() => {
            console.log('Research database setup completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Research database setup failed:', error);
            process.exit(1);
        });
}

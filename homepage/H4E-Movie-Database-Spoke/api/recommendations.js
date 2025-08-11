/**
 * Horror Movie Research & Analysis API
 * Backend logic for research data collection and analysis
 * Designed for academic research purposes only
 */

const { Pool } = require('pg');

// Database connection for research data
const pool = new Pool({
    connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

// TMDb API configuration for research use
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Research configuration
const RESEARCH_CONFIG = {
    MAX_RECOMMENDATIONS: 3,
    MIN_VOTE_COUNT: 10,
    RESEARCH_MODE: process.env.RESEARCH_MODE === 'true',
    DATA_COLLECTION_LIMIT: parseInt(process.env.DATA_COLLECTION_LIMIT) || 1000
};

// Horror subgenre keywords for research analysis
const SUBGENRE_KEYWORDS = {
    'slasher': ['slasher', 'serial killer', 'masked killer', 'final girl'],
    'supernatural': ['ghost', 'supernatural', 'paranormal', 'haunted', 'demon'],
    'psychological': ['psychological', 'mind', 'mental', 'psycho', 'thriller'],
    'found-footage': ['found footage', 'mockumentary', 'documentary style'],
    'body-horror': ['body horror', 'transformation', 'mutation', 'cronenberg'],
    'folk-horror': ['folk horror', 'rural', 'pagan', 'ritual', 'cult'],
    'cosmic-horror': ['cosmic horror', 'lovecraft', 'eldritch', 'unknown'],
    'zombie': ['zombie', 'undead', 'apocalypse', 'survival'],
    'vampire': ['vampire', 'blood', 'undead', 'gothic'],
    'any': []
};

// Mood filters for research preference analysis
const MOOD_FILTERS = {
    'terrifying': { minRating: 6.0, keywords: ['terrifying', 'scary', 'frightening'] },
    'atmospheric': { minRating: 6.5, keywords: ['atmospheric', 'moody', 'creepy'] },
    'gory': { minRating: 5.5, keywords: ['gory', 'bloody', 'violent', 'splatter'] },
    'psychological': { minRating: 6.5, keywords: ['psychological', 'mind-bending', 'disturbing'] },
    'campy': { minRating: 5.0, keywords: ['campy', 'fun', 'entertaining', 'cheesy'] },
    'artistic': { minRating: 7.0, keywords: ['artistic', 'cinematic', 'beautiful', 'stylized'] },
    'any': { minRating: 5.0, keywords: [] }
};

// Timeframe mappings for research temporal analysis
const TIMEFRAME_MAPPINGS = {
    'classic': { startYear: 1900, endYear: 1979 },
    '80s-90s': { startYear: 1980, endYear: 1999 },
    '2000s': { startYear: 2000, endYear: 2009 },
    'recent': { startYear: 2010, endYear: new Date().getFullYear() },
    'any': { startYear: 1900, endYear: new Date().getFullYear() }
};

// Region mappings for research geographic analysis
const REGION_MAPPINGS = {
    'domestic': { region: 'US', language: 'en' },
    'foreign': { region: 'non-US', language: 'non-en' },
    'any': { region: 'any', language: 'any' }
};

/**
 * Get research movie recommendations based on preferences
 */
async function getResearchRecommendations(preferences, consent, rejectedMovies = [], sessionId) {
    try {
        console.log('Research request received:', { preferences, consent, sessionId });

        // Build TMDb query based on research preferences
        const queryParams = buildResearchQuery(preferences);
        
        // Fetch movies from TMDb for research analysis
        const movies = await fetchResearchMovies(queryParams);
        
        // Apply research filters and preferences
        let filteredMovies = filterByResearchCriteria(movies, preferences);
        
        // Remove rejected movies from research samples
        if (rejectedMovies.length > 0) {
            filteredMovies = filteredMovies.filter(movie => !rejectedMovies.includes(movie.id));
        }
        
        // Remove seen movies if requested for research accuracy
        if (preferences.excludeSeen) {
            const seenMovies = await getSeenMovies(sessionId);
            filteredMovies = filteredMovies.filter(movie => !seenMovies.includes(movie.id));
        }
        
        // Sort by research relevance
        filteredMovies = sortByResearchRelevance(filteredMovies, preferences);
        
        // Limit to research sample size
        const recommendations = filteredMovies.slice(0, RESEARCH_CONFIG.MAX_RECOMMENDATIONS);
        
        // Track research data collection
        if (consent !== 'anonymous') {
            await trackResearchDataCollection(sessionId, preferences, recommendations.length);
        }
        
        console.log(`Research analysis complete: ${recommendations.length} movies found`);
        return recommendations;
        
    } catch (error) {
        console.error('Error in research recommendation system:', error);
        throw new Error('Research data collection failed');
    }
}

/**
 * Build TMDb query for research purposes
 */
function buildResearchQuery(preferences) {
    const queryParams = {
        with_genres: '27', // Horror genre
        sort_by: 'popularity.desc',
        include_adult: false,
        include_video: false,
        page: 1
    };
    
    // Apply timeframe filter for research temporal analysis
    if (preferences.timeframe && preferences.timeframe !== 'any') {
        const timeframe = TIMEFRAME_MAPPINGS[preferences.timeframe];
        queryParams['primary_release_date.gte'] = `${timeframe.startYear}-01-01`;
        queryParams['primary_release_date.lte'] = `${timeframe.endYear}-12-31`;
    }
    
    // Apply region filter for research geographic analysis
    if (preferences.region && preferences.region !== 'any') {
        const region = REGION_MAPPINGS[preferences.region];
        if (region.language !== 'any') {
            queryParams.with_original_language = region.language;
        }
    }
    
    return queryParams;
}

/**
 * Fetch movies from TMDb for research analysis
 */
async function fetchResearchMovies(queryParams) {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&${queryString}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TMDb API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results || [];
        
    } catch (error) {
        console.error('Error fetching research data from TMDb:', error);
        throw new Error('Research data source unavailable');
    }
}

/**
 * Filter movies by research criteria
 */
function filterByResearchCriteria(movies, preferences) {
    return movies.filter(movie => {
        // Basic quality filter for research validity
        if (movie.vote_count < RESEARCH_CONFIG.MIN_VOTE_COUNT) {
            return false;
        }
        
        // Apply mood filter for research analysis
        if (preferences.mood && preferences.mood !== 'any') {
            const moodFilter = MOOD_FILTERS[preferences.mood];
            if (movie.vote_average < moodFilter.minRating) {
                return false;
            }
        }
        
        // Apply subgenre keyword filtering for research precision
        if (preferences.subgenre && preferences.subgenre !== 'any') {
            const keywords = SUBGENRE_KEYWORDS[preferences.subgenre];
            if (keywords.length > 0) {
                const movieText = `${movie.title} ${movie.overview || ''} ${movie.tagline || ''}`.toLowerCase();
                const hasKeyword = keywords.some(keyword => movieText.includes(keyword));
                if (!hasKeyword) {
                    return false;
                }
            }
        }
        
        return true;
    });
}

/**
 * Sort movies by research relevance
 */
function sortByResearchRelevance(movies, preferences) {
    return movies.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        
        // Rating score (higher is better for research)
        scoreA += (a.vote_average || 0) * 2;
        scoreB += (b.vote_average || 0) * 2;
        
        // Popularity score (more votes = more research data)
        scoreA += Math.log10(a.vote_count || 1);
        scoreB += Math.log10(b.vote_count || 1);
        
        // Recency bonus for recent research
        if (preferences.timeframe === 'recent') {
            const yearA = new Date(a.release_date).getFullYear();
            const yearB = new Date(b.release_date).getFullYear();
            scoreA += (yearA - 2000) * 0.1;
            scoreB += (yearB - 2000) * 0.1;
        }
        
        return scoreB - scoreA;
    });
}

/**
 * Get detailed movie information for research analysis
 */
async function getMovieDetails(movieId) {
    try {
        const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=genres,keywords`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`TMDb API error: ${response.status}`);
        }
        
        const movie = await response.json();
        
        // Add research metadata
        movie.research_metadata = {
            data_source: 'TMDb',
            collection_timestamp: new Date().toISOString(),
            research_id: `research_${movieId}_${Date.now()}`
        };
        
        return movie;
        
    } catch (error) {
        console.error('Error fetching movie details for research:', error);
        throw new Error('Research data unavailable');
    }
}

/**
 * Get movie trailer for research analysis
 */
async function getMovieTrailer(movieId) {
    try {
        const url = `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`TMDb API error: ${response.status}`);
        }
        
        const data = await response.json();
        const trailers = data.results || [];
        
        // Find the best trailer for research purposes
        const officialTrailer = trailers.find(video => 
            video.type === 'Trailer' && 
            video.site === 'YouTube' &&
            (video.name.toLowerCase().includes('official') || video.name.toLowerCase().includes('trailer'))
        );
        
        const anyTrailer = trailers.find(video => 
            video.type === 'Trailer' && video.site === 'YouTube'
        );
        
        const trailer = officialTrailer || anyTrailer;
        
        return {
            trailerKey: trailer ? trailer.key : null,
            trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
            research_metadata: {
                total_videos: trailers.length,
                trailer_types: trailers.map(v => v.type),
                collection_timestamp: new Date().toISOString()
            }
        };
        
    } catch (error) {
        console.error('Error fetching trailer for research:', error);
        return { trailerKey: null, trailerUrl: null };
    }
}

/**
 * Get streaming platforms for research analysis (mock data for now)
 */
function getStreamingPlatforms(movieId) {
    // Mock streaming data for research purposes
    // In production, this would integrate with JustWatch API or similar
    const platforms = [
        { name: 'Netflix', type: 'Subscription', url: `https://www.netflix.com/search?q=${movieId}` },
        { name: 'Amazon Prime', type: 'Subscription', url: `https://www.amazon.com/s?k=${movieId}` },
        { name: 'Hulu', type: 'Subscription', url: `https://www.hulu.com/search?q=${movieId}` },
        { name: 'Vudu', type: 'Rental/Purchase', url: `https://www.vudu.com/content/movies/search?q=${movieId}` }
    ];
    
    return platforms.map(platform => ({
        ...platform,
        research_metadata: {
            data_source: 'mock',
            collection_timestamp: new Date().toISOString(),
            research_note: 'Mock data for research purposes'
        }
    }));
}

/**
 * Get seen movies for research accuracy
 */
async function getSeenMovies(sessionId) {
    try {
        // Check if table exists first
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'user_movie_history'
            );
        `);
        
        if (!tableExists.rows[0].exists) {
            console.log('user_movie_history table does not exist, skipping seen movies check');
            return [];
        }
        
        const query = 'SELECT movie_id FROM user_movie_history WHERE session_id = $1';
        const result = await pool.query(query, [sessionId]);
        return result.rows.map(row => row.movie_id);
    } catch (error) {
        console.error('Error fetching seen movies for research:', error);
        return [];
    }
}

/**
 * Track research data collection
 */
async function trackResearchDataCollection(sessionId, preferences, resultCount) {
    try {
        // Check if table exists first
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'movie_recommendation_tracking'
            );
        `);
        
        if (!tableExists.rows[0].exists) {
            console.log('movie_recommendation_tracking table does not exist, skipping tracking');
            return;
        }
        
        const query = `
            INSERT INTO movie_recommendation_tracking 
            (session_id, action, data, timestamp) 
            VALUES ($1, $2, $3, $4)
        `;
        
        const data = {
            preferences,
            result_count: resultCount,
            research_session: sessionId
        };
        
        await pool.query(query, [
            sessionId,
            'research_data_collection',
            JSON.stringify(data),
            new Date().toISOString()
        ]);
        
    } catch (error) {
        console.error('Error tracking research data collection:', error);
    }
}

/**
 * Track research participant actions
 */
async function trackResearchAction(action, data) {
    try {
        // Check if table exists first
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'movie_recommendation_tracking'
            );
        `);
        
        if (!tableExists.rows[0].exists) {
            console.log('movie_recommendation_tracking table does not exist, skipping action tracking');
            return;
        }
        
        const query = `
            INSERT INTO movie_recommendation_tracking 
            (session_id, action, data, timestamp) 
            VALUES ($1, $2, $3, $4)
        `;
        
        await pool.query(query, [
            data.sessionId,
            action,
            JSON.stringify(data),
            new Date().toISOString()
        ]);
        
    } catch (error) {
        console.error('Error tracking research action:', error);
    }
}

/**
 * Schedule rating email for research follow-up
 */
async function scheduleRatingEmail(sessionId, movieId, movieTitle) {
    try {
        // Check if table exists first
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'rating_email_queue'
            );
        `);
        
        if (!tableExists.rows[0].exists) {
            console.log('rating_email_queue table does not exist, skipping email scheduling');
            return;
        }
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const query = `
            INSERT INTO rating_email_queue 
            (session_id, movie_id, movie_title, scheduled_date, status) 
            VALUES ($1, $2, $3, $4, 'pending')
        `;
        
        await pool.query(query, [
            sessionId,
            movieId,
            movieTitle,
            tomorrow.toISOString()
        ]);
        
    } catch (error) {
        console.error('Error scheduling rating email for research:', error);
    }
}

// API Route Handlers
async function handleGetRecommendations(req, res) {
    try {
        console.log('Recommendations API called with body:', req.body);
        
        const { preferences, consent, rejectedMovies, sessionId } = req.body;
        
        if (!preferences || !consent) {
            console.log('Missing preferences or consent:', { preferences, consent });
            return res.status(400).json({ error: 'Research preferences and consent required' });
        }
        
        console.log('Getting recommendations for preferences:', preferences);
        
        const recommendations = await getResearchRecommendations(
            preferences, 
            consent, 
            rejectedMovies || [], 
            sessionId
        );
        
        console.log(`Found ${recommendations.length} recommendations`);
        
        res.json({ 
            recommendations,
            research_metadata: {
                session_id: sessionId,
                collection_timestamp: new Date().toISOString(),
                data_source: 'TMDb API',
                research_purpose: 'Academic horror movie analysis'
            }
        });
        
    } catch (error) {
        console.error('Research API error:', error);
        res.status(500).json({ error: 'Research data collection failed', details: error.message });
    }
}

async function handleGetTrailer(req, res) {
    try {
        const { movieId } = req.params;
        const trailerData = await getMovieTrailer(movieId);
        res.json(trailerData);
    } catch (error) {
        console.error('Trailer API error:', error);
        res.status(500).json({ error: 'Trailer data unavailable' });
    }
}

async function handleGetDetails(req, res) {
    try {
        const { movieId } = req.params;
        const movie = await getMovieDetails(movieId);
        const streamingPlatforms = getStreamingPlatforms(movieId);
        
        res.json({
            movie,
            streamingPlatforms,
            research_metadata: {
                movie_id: movieId,
                collection_timestamp: new Date().toISOString(),
                data_sources: ['TMDb API', 'Mock Streaming Data']
            }
        });
    } catch (error) {
        console.error('Details API error:', error);
        res.status(500).json({ error: 'Movie details unavailable' });
    }
}

async function handleTrackAction(req, res) {
    try {
        const { action, data } = req.body;
        
        if (!action || !data) {
            return res.status(400).json({ error: 'Action and data required for research tracking' });
        }
        
        await trackResearchAction(action, data);
        
        // Schedule rating email if movie is selected for research
        if (action === 'movie_interest' && data.interest === 'interested') {
            await scheduleRatingEmail(data.sessionId, data.movieId, data.movieTitle);
        }
        
        res.json({ success: true, message: 'Research action tracked' });
        
    } catch (error) {
        console.error('Tracking API error:', error);
        res.status(500).json({ error: 'Research tracking failed' });
    }
}

// Express Router Setup
const express = require('express');
const router = express.Router();

// POST /api/movies/recommendations - Get movie recommendations
router.post('/', handleGetRecommendations);

// GET /api/movies/recommendations/trailer/:movieId - Get movie trailer
router.get('/trailer/:movieId', handleGetTrailer);

// GET /api/movies/recommendations/details/:movieId - Get movie details
router.get('/details/:movieId', handleGetDetails);

// POST /api/movies/recommendations/track - Track research actions
router.post('/track', handleTrackAction);

// Export both the router and individual functions for testing
module.exports = router;
module.exports.functions = {
    handleGetRecommendations,
    handleGetTrailer,
    handleGetDetails,
    handleTrackAction,
    getResearchRecommendations,
    getMovieDetails,
    getMovieTrailer,
    getStreamingPlatforms,
    trackResearchAction,
    scheduleRatingEmail
};

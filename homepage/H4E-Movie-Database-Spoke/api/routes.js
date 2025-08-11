/**
 * Horror Movie Research & Analysis API Routes
 * Express.js router for research data collection and analysis
 * Designed for academic research purposes only
 */

const express = require('express');
const router = express.Router();

const {
    handleGetRecommendations,
    handleGetTrailer,
    handleGetDetails,
    handleTrackAction
} = require('./recommendations');

// Research data collection endpoint
router.post('/get', handleGetRecommendations);

// Research trailer analysis endpoint
router.get('/trailer/:movieId', handleGetTrailer);

// Research movie details endpoint
router.get('/details/:movieId', handleGetDetails);

// Research participant tracking endpoint
router.post('/track', handleTrackAction);

// Research analytics endpoint (for future use)
router.get('/analytics', async (req, res) => {
    try {
        // This endpoint would provide research analytics and insights
        // For now, return basic research statistics
        res.json({
            research_metadata: {
                system: 'Horror Movie Research & Analysis',
                purpose: 'Academic research on horror cinema trends',
                data_source: 'TMDb API',
                collection_timestamp: new Date().toISOString(),
                research_compliance: 'Non-commercial use only'
            },
            analytics: {
                total_research_sessions: 0, // Would be calculated from database
                total_movies_analyzed: 0,   // Would be calculated from database
                preference_distribution: {}, // Would be calculated from database
                research_trends: []         // Would be calculated from database
            }
        });
    } catch (error) {
        console.error('Research analytics error:', error);
        res.status(500).json({ error: 'Research analytics unavailable' });
    }
});

// Research health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        system: 'Horror Movie Research & Analysis API',
        timestamp: new Date().toISOString(),
        research_mode: process.env.RESEARCH_MODE === 'true',
        compliance: 'Non-commercial research use only'
    });
});

module.exports = router;

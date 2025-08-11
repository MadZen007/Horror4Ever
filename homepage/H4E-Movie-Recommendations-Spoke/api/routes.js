const express = require('express');
const router = express.Router();
const {
  handleGetRecommendations,
  handleGetTrailer,
  handleGetDetails,
  handleTrackAction
} = require('./recommendations');

// Get movie recommendations
router.post('/get', handleGetRecommendations);

// Get movie trailer
router.get('/trailer/:movieId', handleGetTrailer);

// Get movie details and streaming platforms
router.get('/details/:movieId', handleGetDetails);

// Track user actions
router.post('/track', handleTrackAction);

module.exports = router;

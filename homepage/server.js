const express = require('express');
const path = require('path');
const subscriptionRouter = require('./api/subscription');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// API Routes
app.use('/api/subscription', subscriptionRouter);
app.use('/api/movies', require('./api/movies'));
app.use('/api/dev-tools/setup', require('./api/dev-tools/setup'));
app.use('/api/trivia/stats', require('./api/trivia/stats'));
app.use('/api/trivia/track', require('./api/trivia/track'));
app.use('/api/trivia/questions', require('./api/trivia/questions'));

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/subscription.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'subscription.html'));
});

app.get('/fun.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'fun.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Horror4Ever server running on http://localhost:${PORT}`);
  console.log(`Subscription API available at http://localhost:${PORT}/api/subscription`);
}); 
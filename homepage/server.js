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
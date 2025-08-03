# Horror4Ever Server Setup

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Access Your Site
- **Main site**: http://localhost:3000
- **Subscription page**: http://localhost:3000/subscription.html
- **Fun page**: http://localhost:3000/fun.html

## What This Does

The server provides:
- **Static file serving** for all your HTML, CSS, and JS files
- **Subscription API** at `/api/subscription/*` endpoints
- **In-memory subscription storage** (for testing/demo purposes)

## API Endpoints Available

- `GET /api/subscription/status` - Check subscription status
- `POST /api/subscription/create` - Create new subscription
- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/subscription/reactivate` - Reactivate subscription
- `GET /api/subscription/plans` - Get available plans

## Development

For development with auto-restart:
```bash
npm run dev
```

## Production Deployment

For production, you'll want to:
1. Replace in-memory storage with a real database
2. Add proper authentication
3. Integrate with real payment processors
4. Set up environment variables for sensitive data

See `payment-integration-guide.md` for detailed production setup instructions. 
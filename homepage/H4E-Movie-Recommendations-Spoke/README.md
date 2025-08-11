# H4E Movie Recommendations Spoke

A sophisticated movie recommendation system for Horror4Ever that provides personalized horror movie suggestions based on user preferences, with advanced tracking and email follow-up features for subscribers.

## 🎬 Features

### Core Functionality
- **Preference-Based Recommendations**: Users can specify subgenre, mood, region, and timeframe
- **TMDb Integration**: Real-time movie data from The Movie Database API
- **Trailer Integration**: YouTube trailer playback for each recommendation
- **Streaming Platform Links**: Direct links to where movies can be watched
- **"Try Again" Functionality**: Get new recommendations if current ones don't appeal

### Subscriber-Only Features
- **Personalized Tracking**: Monitor user behavior to improve recommendations
- **Viewing History**: Track watched movies to avoid duplicates
- **Email Follow-ups**: Automated rating requests sent the day after movie selection
- **Analytics Dashboard**: Detailed insights into user preferences and behavior

## 🏗️ Architecture

### Frontend
- **HTML**: Responsive interface with preference forms and movie cards
- **CSS**: Dark horror theme with orange accents and smooth animations
- **JavaScript**: Class-based recommendation system with TMDb API integration

### Backend
- **Node.js/Express**: RESTful API endpoints
- **PostgreSQL/CockroachDB**: User tracking and preference storage
- **TMDb API**: Movie data, trailers, and metadata
- **Email Service**: Automated rating request emails

### Database Schema
- `movie_recommendation_tracking`: User action tracking
- `user_movie_history`: Watched movies and ratings
- `rating_email_queue`: Scheduled email notifications
- `user_movie_preferences`: Stored user preferences

## 🚀 Setup Instructions

### 1. Environment Variables
Add these to your `.env` file:
```bash
TMDB_API_KEY=your_tmdb_api_key_here
COCKROACHDB_CONNECTION_STRING=your_database_connection_string
```

### 2. Database Setup
Run the database setup script:
```bash
node api/setup-database.js
```

### 3. API Integration
Add the recommendation routes to your main server:
```javascript
app.use('/api/movie-recommendations', require('./H4E-Movie-Recommendations-Spoke/api/routes'));
```

### 4. TMDb API Key
Get a free API key from [The Movie Database](https://www.themoviedb.org/settings/api)

## 📁 File Structure

```
H4E-Movie-Recommendations-Spoke/
├── public/
│   ├── index.html          # Main recommendation interface
│   └── style.css           # Styling and animations
├── src/
│   └── recommendations.js  # Frontend recommendation logic
├── api/
│   ├── recommendations.js  # Backend recommendation engine
│   ├── routes.js           # Express.js API routes
│   └── setup-database.js   # Database schema and utilities
└── README.md               # This documentation
```

## 🎯 User Flow

### 1. Preference Selection
- User selects subgenre (slasher, supernatural, psychological, etc.)
- Chooses mood (terrifying, atmospheric, gory, etc.)
- Specifies region (domestic, foreign, any)
- Sets timeframe (classic, 80s-90s, 2000s, etc.)
- Option to exclude previously watched movies (subscribers only)

### 2. Recommendation Display
- System fetches 3 personalized recommendations from TMDb
- Each movie card shows poster, title, year, rating, and description
- "Watch Trailer" and "More Info" buttons for each movie

### 3. Movie Interaction
- **Trailer Viewing**: YouTube embed with autoplay
- **Detailed Info**: Full synopsis, genres, and streaming platforms
- **Streaming Links**: Direct affiliate links to platforms
- **"Not Interested"**: Tracks rejection and gets new recommendations

### 4. Subscriber Tracking
- All user actions logged for recommendation improvement
- Movie selections trigger next-day rating email
- Viewing history prevents duplicate recommendations

## 🔧 API Endpoints

### POST `/api/movie-recommendations/get`
Get personalized movie recommendations
```json
{
  "preferences": {
    "subgenre": "slasher",
    "mood": "terrifying",
    "region": "domestic",
    "timeframe": "recent",
    "excludeSeen": true
  },
  "isSubscriber": true,
  "rejectedMovies": [123, 456],
  "memberToken": "user_token_here"
}
```

### GET `/api/movie-recommendations/trailer/:movieId`
Get YouTube trailer key for a movie

### GET `/api/movie-recommendations/details/:movieId`
Get detailed movie info and streaming platforms

### POST `/api/movie-recommendations/track`
Track user actions for analytics
```json
{
  "action": "trailer_watch",
  "data": {
    "movieId": 123,
    "movieTitle": "Movie Title"
  },
  "memberToken": "user_token_here",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🎨 Customization

### Adding New Subgenres
Edit `SUBGENRE_KEYWORDS` in `api/recommendations.js`:
```javascript
const SUBGENRE_KEYWORDS = {
  'new-subgenre': ['keyword1', 'keyword2', 'keyword3'],
  // ... existing subgenres
};
```

### Modifying Mood Filters
Update `MOOD_FILTERS` in `api/recommendations.js`:
```javascript
const MOOD_FILTERS = {
  'new-mood': { 
    minRating: 6.5, 
    keywords: ['keyword1', 'keyword2'] 
  },
  // ... existing moods
};
```

### Styling Changes
Modify `public/style.css` to match your site's theme:
- Color variables in `:root`
- Component-specific styles
- Responsive breakpoints

## 📊 Analytics & Tracking

### Tracked Actions
- `preference_submission`: User submits preferences
- `trailer_watch`: User watches a trailer
- `movie_rejection`: User rejects a recommendation
- `streaming_search`: User searches for streaming options
- `movie_selection`: User selects a movie (triggers email)

### Email System
- Automated emails sent 24 hours after movie selection
- Rating request with 1-10 scale
- Links back to recommendation system
- Unsubscribe functionality

## 🔒 Security & Privacy

- All tracking requires valid member token
- Non-subscribers get random recommendations without tracking
- User data stored securely in PostgreSQL/CockroachDB
- API keys stored in environment variables

## 🚀 Future Enhancements

### Planned Features
- **Machine Learning**: Improved recommendation algorithm
- **Social Features**: Share recommendations with friends
- **Watchlists**: Save movies for later viewing
- **Reviews**: User-generated movie reviews
- **Advanced Filtering**: More granular preference options

### Integration Opportunities
- **JustWatch API**: Real streaming availability data
- **Letterboxd API**: Import user ratings and reviews
- **Email Marketing**: Integration with Mailchimp/SendGrid
- **Analytics**: Google Analytics 4 integration

## 🐛 Troubleshooting

### Common Issues
1. **TMDb API Errors**: Check API key and rate limits
2. **Database Connection**: Verify CockroachDB connection string
3. **Missing Trailers**: Some movies may not have YouTube trailers
4. **Streaming Links**: Currently uses mock data (integrate JustWatch API)

### Debug Mode
Enable detailed logging by setting:
```javascript
process.env.DEBUG = 'movie-recommendations:*';
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check TMDb API status
4. Verify database connectivity

---

**Built for Horror4Ever** 🎃
*Making horror movie discovery personal and engaging*

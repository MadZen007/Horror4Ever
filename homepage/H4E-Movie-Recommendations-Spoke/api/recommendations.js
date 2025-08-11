const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
});

// TMDb API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Horror genre ID in TMDb
const HORROR_GENRE_ID = 27;

// Subgenre to TMDb keyword mappings
const SUBGENRE_KEYWORDS = {
  'slasher': ['slasher', 'serial killer', 'masked killer'],
  'supernatural': ['supernatural', 'ghost', 'demon', 'possession'],
  'psychological': ['psychological', 'mind', 'mental', 'paranoia'],
  'found-footage': ['found footage', 'mockumentary', 'handheld'],
  'body-horror': ['body horror', 'transformation', 'mutation'],
  'folk-horror': ['folk horror', 'rural', 'pagan', 'ritual'],
  'cosmic-horror': ['cosmic horror', 'eldritch', 'cthulhu', 'lovecraft'],
  'zombie': ['zombie', 'undead', 'apocalypse'],
  'vampire': ['vampire', 'blood', 'undead'],
  'survival': ['survival horror', 'trapped', 'escape'],
  'gothic': ['gothic', 'victorian', 'castle', 'mansion'],
  'surreal': ['surreal', 'nightmare', 'dream', 'hallucination']
};

// Mood to rating/atmosphere mappings
const MOOD_FILTERS = {
  'terrifying': { minRating: 7.0, keywords: ['scary', 'terrifying', 'horror'] },
  'atmospheric': { minRating: 6.5, keywords: ['atmospheric', 'moody', 'gothic'] },
  'gory': { minRating: 6.0, keywords: ['gore', 'blood', 'violent'] },
  'mind-bending': { minRating: 6.5, keywords: ['psychological', 'mind', 'twist'] },
  'creepy': { minRating: 6.0, keywords: ['creepy', 'unsettling', 'disturbing'] },
  'disturbing': { minRating: 6.0, keywords: ['disturbing', 'shocking', 'extreme'] },
  'fun': { minRating: 5.5, keywords: ['campy', 'fun', 'entertaining'] },
  'suspenseful': { minRating: 6.5, keywords: ['suspense', 'thriller', 'tension'] }
};

// Timeframe to year ranges
const TIMEFRAME_YEARS = {
  'classic': { minYear: 1920, maxYear: 1979 },
  '80s-90s': { minYear: 1980, maxYear: 1999 },
  '2000s': { minYear: 2000, maxYear: 2009 },
  '2010s': { minYear: 2010, maxYear: 2019 },
  'recent': { minYear: 2020, maxYear: new Date().getFullYear() },
  'any': { minYear: 1920, maxYear: new Date().getFullYear() }
};

// Region to country codes
const REGION_COUNTRIES = {
  'domestic': ['US', 'CA'],
  'foreign': ['GB', 'JP', 'KR', 'FR', 'DE', 'IT', 'ES', 'AU', 'NZ', 'MX', 'BR', 'AR', 'CL', 'IN', 'TH', 'PH'],
  'any': []
};

async function getRecommendations(preferences, isSubscriber, rejectedMovies = [], memberToken = null) {
  try {
    // Build TMDb query parameters
    const queryParams = new URLSearchParams({
      api_key: TMDB_API_KEY,
      with_genres: HORROR_GENRE_ID.toString(),
      sort_by: 'popularity.desc',
      include_adult: false,
      include_video: false,
      page: '1',
      language: 'en-US'
    });

    // Add year filter
    const yearRange = TIMEFRAME_YEARS[preferences.timeframe] || TIMEFRAME_YEARS['any'];
    if (yearRange.minYear && yearRange.maxYear) {
      queryParams.append('primary_release_date.gte', `${yearRange.minYear}-01-01`);
      queryParams.append('primary_release_date.lte', `${yearRange.maxYear}-12-31`);
    }

    // Add region filter
    const countries = REGION_COUNTRIES[preferences.region] || [];
    if (countries.length > 0) {
      queryParams.append('with_origin_country', countries.join('|'));
    }

    // Get initial movie list from TMDb
    const response = await fetch(`${TMDB_BASE_URL}/discover/movie?${queryParams}`);
    const data = await response.json();

    if (!data.results) {
      throw new Error('Failed to fetch movies from TMDb');
    }

    let movies = data.results;

    // Filter by subgenre keywords
    if (preferences.subgenre && SUBGENRE_KEYWORDS[preferences.subgenre]) {
      const keywords = SUBGENRE_KEYWORDS[preferences.subgenre];
      movies = await filterByKeywords(movies, keywords);
    }

    // Filter by mood
    if (preferences.mood && MOOD_FILTERS[preferences.mood]) {
      const moodFilter = MOOD_FILTERS[preferences.mood];
      movies = movies.filter(movie => movie.vote_average >= moodFilter.minRating);
    }

    // Remove rejected movies
    movies = movies.filter(movie => !rejectedMovies.includes(movie.id));

    // Remove movies user has seen (if subscriber and excludeSeen is true)
    if (isSubscriber && preferences.excludeSeen && memberToken) {
      const seenMovies = await getSeenMovies(memberToken);
      movies = movies.filter(movie => !seenMovies.includes(movie.id));
    }

    // Get detailed info for top movies
    const detailedMovies = await Promise.all(
      movies.slice(0, 10).map(async (movie) => {
        try {
          const details = await getMovieDetails(movie.id);
          return { ...movie, ...details };
        } catch (error) {
          console.error(`Error getting details for movie ${movie.id}:`, error);
          return movie;
        }
      })
    );

    // Sort by relevance and return top 3
    const sortedMovies = sortByRelevance(detailedMovies, preferences);
    return sortedMovies.slice(0, 3);

  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}

async function filterByKeywords(movies, keywords) {
  const filteredMovies = [];
  
  for (const movie of movies.slice(0, 20)) { // Limit to avoid too many API calls
    try {
      const details = await getMovieDetails(movie.id);
      const textToSearch = `${movie.title} ${movie.overview} ${details.tagline || ''}`.toLowerCase();
      
      const hasKeyword = keywords.some(keyword => 
        textToSearch.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword) {
        filteredMovies.push(movie);
      }
    } catch (error) {
      console.error(`Error filtering movie ${movie.id}:`, error);
    }
  }
  
  return filteredMovies.length > 0 ? filteredMovies : movies.slice(0, 10);
}

async function getMovieDetails(movieId) {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,keywords`
  );
  const data = await response.json();
  
  return {
    runtime: data.runtime,
    genres: data.genres,
    tagline: data.tagline,
    budget: data.budget,
    revenue: data.revenue,
    production_companies: data.production_companies,
    videos: data.videos?.results || []
  };
}

async function getMovieTrailer(movieId) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json();
    
    // Find official trailer or teaser
    const trailer = data.results?.find(video => 
      video.type === 'Trailer' && 
      (video.name.toLowerCase().includes('trailer') || video.name.toLowerCase().includes('teaser'))
    );
    
    return trailer ? { trailerKey: trailer.key } : { trailerKey: null };
  } catch (error) {
    console.error(`Error getting trailer for movie ${movieId}:`, error);
    return { trailerKey: null };
  }
}

async function getStreamingPlatforms(movieId) {
  try {
    // This would typically use a service like JustWatch API
    // For now, return mock data
    const platforms = [
      { name: 'Netflix', type: 'Streaming', url: `https://www.netflix.com/search?q=${encodeURIComponent(movieId)}` },
      { name: 'Amazon Prime', type: 'Streaming', url: `https://www.amazon.com/s?k=${encodeURIComponent(movieId)}` },
      { name: 'Hulu', type: 'Streaming', url: `https://www.hulu.com/search?q=${encodeURIComponent(movieId)}` },
      { name: 'Vudu', type: 'Rental', url: `https://www.vudu.com/content/movies/search?searchString=${encodeURIComponent(movieId)}` }
    ];
    
    return platforms;
  } catch (error) {
    console.error(`Error getting streaming platforms for movie ${movieId}:`, error);
    return [];
  }
}

async function getSeenMovies(memberToken) {
  try {
    const result = await pool.query(
      'SELECT movie_id FROM user_movie_history WHERE member_token = $1',
      [memberToken]
    );
    return result.rows.map(row => row.movie_id);
  } catch (error) {
    console.error('Error getting seen movies:', error);
    return [];
  }
}

function sortByRelevance(movies, preferences) {
  return movies.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    
    // Rating score (40% weight)
    scoreA += (a.vote_average || 0) * 0.4;
    scoreB += (b.vote_average || 0) * 0.4;
    
    // Popularity score (30% weight)
    scoreA += (a.popularity || 0) * 0.3;
    scoreB += (b.popularity || 0) * 0.3;
    
    // Recency score (20% weight)
    const currentYear = new Date().getFullYear();
    const yearA = new Date(a.release_date).getFullYear();
    const yearB = new Date(b.release_date).getFullYear();
    scoreA += (yearA / currentYear) * 0.2;
    scoreB += (yearB / currentYear) * 0.2;
    
    // Vote count score (10% weight)
    scoreA += Math.min((a.vote_count || 0) / 1000, 1) * 0.1;
    scoreB += Math.min((b.vote_count || 0) / 1000, 1) * 0.1;
    
    return scoreB - scoreA;
  });
}

async function trackUserAction(action, data, memberToken, timestamp) {
  try {
    await pool.query(
      `INSERT INTO movie_recommendation_tracking 
       (member_token, action, data, timestamp) 
       VALUES ($1, $2, $3, $4)`,
      [memberToken, action, JSON.stringify(data), timestamp]
    );
  } catch (error) {
    console.error('Error tracking user action:', error);
  }
}

async function scheduleRatingEmail(memberToken, movieId, movieTitle) {
  try {
    // Schedule email for next day
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    await pool.query(
      `INSERT INTO rating_email_queue 
       (member_token, movie_id, movie_title, scheduled_for) 
       VALUES ($1, $2, $3, $4)`,
      [memberToken, movieId, movieTitle, tomorrow]
    );
  } catch (error) {
    console.error('Error scheduling rating email:', error);
  }
}

// API route handlers
async function handleGetRecommendations(req, res) {
  try {
    const { preferences, isSubscriber, rejectedMovies, memberToken } = req.body;
    
    const recommendations = await getRecommendations(
      preferences, 
      isSubscriber, 
      rejectedMovies, 
      memberToken
    );
    
    res.json({ recommendations });
  } catch (error) {
    console.error('Error in get recommendations handler:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
}

async function handleGetTrailer(req, res) {
  try {
    const { movieId } = req.params;
    const trailer = await getMovieTrailer(movieId);
    res.json(trailer);
  } catch (error) {
    console.error('Error in get trailer handler:', error);
    res.status(500).json({ error: 'Failed to get trailer' });
  }
}

async function handleGetDetails(req, res) {
  try {
    const { movieId } = req.params;
    const movie = await getMovieDetails(movieId);
    const streamingPlatforms = await getStreamingPlatforms(movieId);
    
    res.json({
      movie,
      streamingPlatforms
    });
  } catch (error) {
    console.error('Error in get details handler:', error);
    res.status(500).json({ error: 'Failed to get movie details' });
  }
}

async function handleTrackAction(req, res) {
  try {
    const { action, data, memberToken, timestamp } = req.body;
    
    await trackUserAction(action, data, memberToken, timestamp);
    
    // If user selected a movie, schedule rating email
    if (action === 'movie_selection' && data.movieId) {
      await scheduleRatingEmail(memberToken, data.movieId, data.movieTitle);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error in track action handler:', error);
    res.status(500).json({ error: 'Failed to track action' });
  }
}

module.exports = {
  handleGetRecommendations,
  handleGetTrailer,
  handleGetDetails,
  handleTrackAction
};

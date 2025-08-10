// Movies JavaScript Logic

// Load movies from API
async function loadMovies() {
  const loadingState = document.getElementById('loadingState');
  const moviesGrid = document.getElementById('moviesGrid');
  const emptyState = document.getElementById('emptyState');
  const errorState = document.getElementById('errorState');

  // Show loading state
  loadingState.style.display = 'flex';
  moviesGrid.style.display = 'none';
  emptyState.style.display = 'none';
  errorState.style.display = 'none';

  try {
    const response = await fetch('/api/movies');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const movies = await response.json();
    
    // Hide loading state
    loadingState.style.display = 'none';
    
    if (movies.length === 0) {
      // Show empty state
      emptyState.style.display = 'flex';
    } else {
      // Display movies
      displayMovies(movies);
      moviesGrid.style.display = 'grid';
    }
    
  } catch (error) {
    console.error('Error loading movies:', error);
    
    // Hide loading state
    loadingState.style.display = 'none';
    
    // Show error state
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = error.message || 'Failed to load movies. Please try again.';
    errorState.style.display = 'flex';
  }
}

// Display movies in the grid
function displayMovies(movies) {
  const moviesGrid = document.getElementById('moviesGrid');
  
  // Clear existing content
  moviesGrid.innerHTML = '';
  
  // Log movie data for debugging
  console.log('Loading movies:', movies);
  
  // Create movie cards
  movies.forEach(movie => {
    // Validate YouTube ID format
    if (movie.youtube_id) {
      validateYouTubeId(movie.youtube_id, movie.title);
    }
    
    const movieCard = createMovieCard(movie);
    moviesGrid.appendChild(movieCard);
  });
}

// Validate YouTube video ID format
function validateYouTubeId(youtubeId, title) {
  // YouTube video IDs should be exactly 11 characters and contain only letters, numbers, hyphens, and underscores
  const validFormat = /^[a-zA-Z0-9_-]{11}$/;
  
  if (!validFormat.test(youtubeId)) {
    console.warn(`Invalid YouTube ID format for "${title}": ${youtubeId}`);
    return false;
  }
  
  console.log(`Valid YouTube ID for "${title}": ${youtubeId}`);
  return true;
}

// Create an individual movie card
function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.onclick = () => openMovie(movie.id);
  
  // Create thumbnail with multiple fallback options
  let thumbnail;
  if (movie.youtube_id) {
    // Start with a more reliable thumbnail quality
    thumbnail = `https://img.youtube.com/vi/${movie.youtube_id}/hqdefault.jpg`;
  } else {
    thumbnail = movie.thumbnail || '../../images/default-movie-thumbnail.png';
  }
  
  card.innerHTML = `
    <img src="${thumbnail}" alt="${movie.title}" class="movie-thumbnail" 
         onerror="handleThumbnailError(this, '${movie.youtube_id}')"
         onload="handleThumbnailSuccess(this, '${movie.youtube_id}')">
    <div class="movie-content">
      <h3 class="movie-title">${movie.title}</h3>
      <div class="movie-year">${movie.year}</div>
      <button class="watch-button">WATCH REVIEW</button>
    </div>
  `;
  
  return card;
}

// Handle successful thumbnail loading
function handleThumbnailSuccess(img, youtubeId) {
  if (youtubeId) {
    console.log(`✅ Thumbnail loaded successfully for YouTube ID: ${youtubeId}`);
  }
}

// Handle thumbnail loading errors with fallback chain
function handleThumbnailError(img, youtubeId) {
  if (!youtubeId) {
    // No YouTube ID, use default image
    console.log('No YouTube ID provided, using default thumbnail');
    img.src = '../../images/default-movie-thumbnail.png';
    return;
  }
  
  console.log(`❌ Thumbnail failed for YouTube ID: ${youtubeId}, trying fallbacks...`);
  
  // Try different YouTube thumbnail qualities in order of preference
  const thumbnailQualities = [
    'maxresdefault.jpg', // Maximum resolution (1280x720)
    'sddefault.jpg',     // Standard definition (640x480)
    'mqdefault.jpg',     // Medium quality (320x180)
    'default.jpg'        // Default (120x90)
  ];
  
  const currentSrc = img.src;
  const currentQuality = thumbnailQualities.find(quality => currentSrc.includes(quality));
  
  if (currentQuality) {
    const currentIndex = thumbnailQualities.indexOf(currentQuality);
    const nextQuality = thumbnailQualities[currentIndex + 1];
    
    if (nextQuality) {
      // Try next quality
      console.log(`🔄 Trying ${nextQuality} for ${youtubeId}`);
      img.src = `https://img.youtube.com/vi/${youtubeId}/${nextQuality}`;
    } else {
      // All YouTube qualities failed, use default
      console.log(`💀 All YouTube thumbnails failed for ${youtubeId}, using default`);
      img.src = '../../images/default-movie-thumbnail.png';
    }
  } else {
    // Started with hqdefault, try maxresdefault
    console.log(`🔄 hqdefault failed for ${youtubeId}, trying maxresdefault`);
    img.src = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  }
}

// Open movie page
function openMovie(movieId) {
  window.location.href = `movie.html?id=${movieId}`;
}

// Load individual movie
async function loadMovie(movieId) {
  try {
    const response = await fetch(`/api/movies?id=${movieId}`);
    
    if (!response.ok) {
      throw new Error('Movie not found');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error loading movie:', error);
    throw error;
  }
}

// Extract YouTube video ID from URL
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Generate YouTube embed URL
function generateYouTubeEmbed(youtubeId) {
  return `https://www.youtube.com/embed/${youtubeId}`;
}

// Export functions for use in other files
window.MoviesModule = {
  loadMovies,
  displayMovies,
  createMovieCard,
  openMovie,
  loadMovie,
  extractYouTubeId,
  generateYouTubeEmbed
}; 
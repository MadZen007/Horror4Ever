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
  
  // Create movie cards
  movies.forEach(movie => {
    const movieCard = createMovieCard(movie);
    moviesGrid.appendChild(movieCard);
  });
}

// Create an individual movie card
function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.onclick = () => openMovie(movie.id);
  
  // Create thumbnail (YouTube thumbnail or default)
  const thumbnail = movie.youtube_id 
    ? `https://img.youtube.com/vi/${movie.youtube_id}/maxresdefault.jpg`
    : movie.thumbnail || '../../images/default-movie-thumbnail.png';
  
  card.innerHTML = `
    <img src="${thumbnail}" alt="${movie.title}" class="movie-thumbnail" onerror="this.src='../../images/default-movie-thumbnail.png'">
    <div class="movie-content">
      <h3 class="movie-title">${movie.title}</h3>
      <div class="movie-year">${movie.year}</div>
      <button class="watch-button">WATCH REVIEW</button>
    </div>
  `;
  
  return card;
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
// Movie Recommendations System
class MovieRecommendations {
  constructor() {
    this.currentRecommendations = [];
    this.userPreferences = {};
    this.isSubscriber = false;
    this.memberToken = null;
    this.rejectedMovies = new Set();
    this.watchedTrailers = new Set();
    
    this.init();
  }

  async init() {
    this.checkSubscriptionStatus();
    this.setupEventListeners();
    this.showMemberBenefits();
  }

  checkSubscriptionStatus() {
    this.memberToken = localStorage.getItem('horror4ever_member_token');
    this.isSubscriber = !!this.memberToken;
    
    if (this.isSubscriber) {
      document.getElementById('memberBenefitsNotice').style.display = 'block';
    }
  }

  setupEventListeners() {
    // Preference form submission
    document.getElementById('preferenceForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handlePreferenceSubmission();
    });

    // Try again button
    document.getElementById('tryAgainButton').addEventListener('click', () => {
      this.getRecommendations();
    });

    // New preferences button
    document.getElementById('newPreferencesButton').addEventListener('click', () => {
      this.showScreen('preferenceScreen');
    });

    // Back to home button
    document.getElementById('backToHomeButton').addEventListener('click', () => {
      window.location.href = '../../index.html';
    });

    // Modal action buttons
    document.getElementById('watchTrailerButton').addEventListener('click', () => {
      this.handleTrailerWatch();
    });

    document.getElementById('findStreamingButton').addEventListener('click', () => {
      this.handleStreamingSearch();
    });

    document.getElementById('notInterestedButton').addEventListener('click', () => {
      this.handleNotInterested();
    });
  }

  showMemberBenefits() {
    if (this.isSubscriber) {
      const memberName = localStorage.getItem('horror4ever_member_name');
      if (memberName) {
        // Could add personalized welcome message here
      }
    }
  }

  async handlePreferenceSubmission() {
    const formData = new FormData(document.getElementById('preferenceForm'));
    
    this.userPreferences = {
      subgenre: formData.get('subgenre'),
      mood: formData.get('mood'),
      region: formData.get('region'),
      timeframe: formData.get('timeframe'),
      excludeSeen: formData.get('excludeSeen') === 'on'
    };

    // Track preference submission
    if (this.isSubscriber) {
      await this.trackUserAction('preference_submission', this.userPreferences);
    }

    this.showScreen('loadingScreen');
    await this.getRecommendations();
  }

  async getRecommendations() {
    try {
      const response = await fetch('/api/movie-recommendations/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: this.userPreferences,
          isSubscriber: this.isSubscriber,
          rejectedMovies: Array.from(this.rejectedMovies),
          memberToken: this.memberToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      this.currentRecommendations = data.recommendations;
      
      this.displayRecommendations();
      this.showScreen('recommendationsScreen');
      
    } catch (error) {
      console.error('Error getting recommendations:', error);
      this.showError('Failed to get recommendations. Please try again.');
      this.showScreen('preferenceScreen');
    }
  }

  displayRecommendations() {
    const grid = document.getElementById('recommendationsGrid');
    const summary = document.getElementById('preferenceSummary');
    
    // Update preference summary
    summary.textContent = `${this.userPreferences.subgenre} ${this.userPreferences.mood} movies`;
    
    // Clear existing recommendations
    grid.innerHTML = '';
    
    // Display each recommendation
    this.currentRecommendations.forEach((movie, index) => {
      const movieCard = this.createMovieCard(movie, index);
      grid.appendChild(movieCard);
    });
  }

  createMovieCard(movie, index) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.movieId = movie.id;
    
    const posterUrl = movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : '../../images/default-movie-thumbnail.png';
    
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    const rating = movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : 'N/A';
    
    card.innerHTML = `
      <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" 
           onerror="this.src='../../images/default-movie-thumbnail.png'">
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <div class="movie-meta">
          <span>${releaseYear}</span>
          <span>•</span>
          <span>${movie.runtime || 'N/A'} min</span>
          <span>•</span>
          <span class="movie-rating">${rating}</span>
        </div>
        <p class="movie-description">${movie.overview || 'No description available.'}</p>
        <div class="movie-actions">
          <button class="movie-action-button watch-trailer-btn" onclick="recommendations.watchTrailer(${movie.id}, ${index})">
            🎬 Watch Trailer
          </button>
          <button class="movie-action-button more-info-btn" onclick="recommendations.showMovieDetails(${movie.id}, ${index})">
            ℹ️ More Info
          </button>
        </div>
      </div>
    `;
    
    return card;
  }

  async watchTrailer(movieId, index) {
    const movie = this.currentRecommendations[index];
    
    try {
      // Get trailer from TMDb
      const response = await fetch(`/api/movie-recommendations/trailer/${movieId}`);
      const data = await response.json();
      
      if (data.trailerKey) {
        // Track trailer watch for subscribers
        if (this.isSubscriber) {
          await this.trackUserAction('trailer_watch', {
            movieId: movieId,
            movieTitle: movie.title,
            trailerKey: data.trailerKey
          });
          this.watchedTrailers.add(movieId);
        }
        
        // Open trailer in modal
        this.showTrailerModal(data.trailerKey, movie);
      } else {
        alert('No trailer available for this movie.');
      }
    } catch (error) {
      console.error('Error getting trailer:', error);
      alert('Failed to load trailer. Please try again.');
    }
  }

  showTrailerModal(trailerKey, movie) {
    const modal = document.getElementById('movieDetailModal');
    const trailerContainer = document.getElementById('modalTrailerContainer');
    
    // Set movie info
    document.getElementById('modalMovieTitle').textContent = movie.title;
    document.getElementById('modalMoviePoster').src = movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : '../../images/default-movie-thumbnail.png';
    
    // Embed trailer
    trailerContainer.innerHTML = `
      <iframe width="100%" height="100%" 
              src="https://www.youtube.com/embed/${trailerKey}?autoplay=1" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
      </iframe>
    `;
    
    modal.style.display = 'block';
  }

  async showMovieDetails(movieId, index) {
    const movie = this.currentRecommendations[index];
    
    try {
      // Get detailed movie info including streaming platforms
      const response = await fetch(`/api/movie-recommendations/details/${movieId}`);
      const data = await response.json();
      
      this.populateMovieModal(data);
      document.getElementById('movieDetailModal').style.display = 'block';
      
    } catch (error) {
      console.error('Error getting movie details:', error);
      alert('Failed to load movie details. Please try again.');
    }
  }

  populateMovieModal(movieData) {
    const movie = movieData.movie;
    const streamingPlatforms = movieData.streamingPlatforms || [];
    
    // Set basic info
    document.getElementById('modalMovieTitle').textContent = movie.title;
    document.getElementById('modalMovieYear').textContent = new Date(movie.release_date).getFullYear();
    document.getElementById('modalMovieRuntime').textContent = `${movie.runtime} min`;
    document.getElementById('modalMovieRating').textContent = `${movie.vote_average.toFixed(1)}/10`;
    document.getElementById('modalMovieDescription').textContent = movie.overview || 'No description available.';
    
    // Set poster
    document.getElementById('modalMoviePoster').src = movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : '../../images/default-movie-thumbnail.png';
    
    // Set genres
    const genresContainer = document.getElementById('modalMovieGenres');
    genresContainer.innerHTML = movie.genres?.map(genre => 
      `<span class="genre-tag">${genre.name}</span>`
    ).join('') || '';
    
    // Set streaming platforms
    const platformsContainer = document.getElementById('modalStreamingPlatforms');
    if (streamingPlatforms.length > 0) {
      platformsContainer.innerHTML = streamingPlatforms.map(platform => `
        <div class="platform-item" onclick="recommendations.openStreamingLink('${platform.name}', '${platform.url}')">
          <strong>${platform.name}</strong>
          <br>
          <small>${platform.type}</small>
        </div>
      `).join('');
    } else {
      platformsContainer.innerHTML = '<p>No streaming information available.</p>';
    }
    
    // Store current movie for tracking
    this.currentModalMovie = movie;
  }

  async handleTrailerWatch() {
    if (this.currentModalMovie && this.isSubscriber) {
      await this.trackUserAction('trailer_watch_modal', {
        movieId: this.currentModalMovie.id,
        movieTitle: this.currentModalMovie.title
      });
    }
    
    // Trailer is already playing in the modal
  }

  async handleStreamingSearch() {
    if (this.currentModalMovie) {
      // Track streaming search
      if (this.isSubscriber) {
        await this.trackUserAction('streaming_search', {
          movieId: this.currentModalMovie.id,
          movieTitle: this.currentModalMovie.title
        });
      }
      
      // Open JustWatch or similar service
      const searchQuery = encodeURIComponent(this.currentModalMovie.title);
      window.open(`https://www.justwatch.com/us/search?q=${searchQuery}`, '_blank');
    }
  }

  async handleNotInterested() {
    if (this.currentModalMovie) {
      const movieId = this.currentModalMovie.id;
      this.rejectedMovies.add(movieId);
      
      // Track rejection for subscribers
      if (this.isSubscriber) {
        await this.trackUserAction('movie_rejection', {
          movieId: movieId,
          movieTitle: this.currentModalMovie.title
        });
      }
      
      // Close modal and get new recommendations
      document.getElementById('movieDetailModal').style.display = 'none';
      this.showScreen('loadingScreen');
      await this.getRecommendations();
    }
  }

  openStreamingLink(platformName, url) {
    if (this.isSubscriber) {
      this.trackUserAction('streaming_click', {
        platform: platformName,
        movieId: this.currentModalMovie?.id,
        movieTitle: this.currentModalMovie?.title
      });
    }
    
    window.open(url, '_blank');
  }

  async trackUserAction(action, data) {
    if (!this.isSubscriber) return;
    
    try {
      await fetch('/api/movie-recommendations/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          data: data,
          memberToken: this.memberToken,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error tracking user action:', error);
    }
  }

  showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(screenId).classList.add('active');
  }

  showError(message) {
    // Could implement a proper error notification system
    alert(message);
  }
}

// Initialize the recommendation system
const recommendations = new MovieRecommendations();

// Global functions for HTML onclick handlers
window.recommendations = recommendations;

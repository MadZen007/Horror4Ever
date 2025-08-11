/**
 * Horror Movie Research & Analysis System
 * Frontend JavaScript for research data collection and analysis
 * Designed for academic research purposes only
 */

class HorrorMovieResearch {
    constructor() {
        this.currentScreen = 'preference';
        this.researchData = {
            preferences: {},
            consent: null,
            sessionId: this.generateSessionId(),
            interactions: []
        };
        this.recommendations = [];
        this.rejectedMovies = [];
        this.seenMovies = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadResearchSession();
        console.log('Horror Movie Research System initialized for academic purposes');
    }

    generateSessionId() {
        return 'research_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setupEventListeners() {
        // Form submission for research preferences
        const preferenceForm = document.getElementById('preferenceForm');
        if (preferenceForm) {
            preferenceForm.addEventListener('submit', (e) => this.handlePreferenceSubmission(e));
        }

        // Try again button for new research samples
        const tryAgainBtn = document.getElementById('tryAgainBtn');
        if (tryAgainBtn) {
            tryAgainBtn.addEventListener('click', () => this.getNewResearchSamples());
        }

        // Modal close functionality
        const modals = document.querySelectorAll('.modal');
        const closeButtons = document.querySelectorAll('.close');
        
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.closeModals());
        });

        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModals();
                }
            });
        });
    }

    loadResearchSession() {
        // Load any existing research session data
        const savedSession = localStorage.getItem('horror_research_session');
        if (savedSession) {
            try {
                const sessionData = JSON.parse(savedSession);
                this.researchData.sessionId = sessionData.sessionId || this.researchData.sessionId;
                this.rejectedMovies = sessionData.rejectedMovies || [];
                this.seenMovies = sessionData.seenMovies || [];
            } catch (error) {
                console.log('No valid research session found, starting fresh');
            }
        }
    }

    saveResearchSession() {
        const sessionData = {
            sessionId: this.researchData.sessionId,
            rejectedMovies: this.rejectedMovies,
            seenMovies: this.seenMovies,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('horror_research_session', JSON.stringify(sessionData));
    }

    async handlePreferenceSubmission(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        this.researchData.preferences = {
            subgenre: formData.get('subgenre'),
            mood: formData.get('mood'),
            region: formData.get('region'),
            timeframe: formData.get('timeframe'),
            excludeSeen: formData.get('excludeSeen') === 'on'
        };
        
        this.researchData.consent = formData.get('researchConsent');
        
        // Track research participation
        this.trackResearchAction('preference_submission', {
            preferences: this.researchData.preferences,
            consent: this.researchData.consent
        });

        this.showLoadingScreen();
        await this.getResearchRecommendations();
    }

    async getResearchRecommendations() {
        try {
            const response = await fetch('/api/research/movies/get', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    preferences: this.researchData.preferences,
                    consent: this.researchData.consent,
                    rejectedMovies: this.rejectedMovies,
                    sessionId: this.researchData.sessionId
                })
            });

            if (!response.ok) {
                throw new Error(`Research API error: ${response.status}`);
            }

            const data = await response.json();
            this.recommendations = data.recommendations || [];
            
            // Track research data collection
            this.trackResearchAction('recommendations_retrieved', {
                count: this.recommendations.length,
                preferences: this.researchData.preferences
            });

            this.displayResearchResults();
            
        } catch (error) {
            console.error('Error retrieving research data:', error);
            this.showError('Unable to retrieve research data. Please try again.');
        }
    }

    async getNewResearchSamples() {
        this.showLoadingScreen();
        await this.getResearchRecommendations();
    }

    displayResearchResults() {
        const grid = document.getElementById('recommendationsGrid');
        if (!grid) return;

        grid.innerHTML = '';

        if (this.recommendations.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <h3>No Research Matches Found</h3>
                    <p>No movies match your current research criteria. Try adjusting your preferences.</p>
                </div>
            `;
            this.showScreen('results');
            return;
        }

        this.recommendations.forEach((movie, index) => {
            const movieCard = this.createResearchMovieCard(movie, index);
            grid.appendChild(movieCard);
        });

        this.showScreen('results');
    }

    createResearchMovieCard(movie, index) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.style.animationDelay = `${index * 0.1}s`;

        const posterUrl = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : '../images/default-movie-thumbnail.png';

        card.innerHTML = `
            <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" 
                 onerror="this.src='../images/default-movie-thumbnail.png'">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span>${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                    <span class="movie-rating">★ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                    <span>${movie.vote_count ? `${movie.vote_count} votes` : 'No votes'}</span>
                </div>
                <p class="movie-description">${movie.overview || 'No description available for research purposes.'}</p>
                <div class="movie-actions">
                    <button class="action-btn watch-trailer-btn" onclick="researchSystem.watchTrailer(${movie.id})">
                        Watch Trailer
                    </button>
                    <button class="action-btn more-info-btn" onclick="researchSystem.showMovieDetails(${movie.id})">
                        Research Details
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    async watchTrailer(movieId) {
        try {
            const response = await fetch(`/api/research/movies/trailer/${movieId}`);
            if (!response.ok) throw new Error('Trailer not available');
            
            const data = await response.json();
            
            if (data.trailerKey) {
                this.showTrailerModal(data.trailerKey, movieId);
                
                // Track research interaction
                this.trackResearchAction('trailer_watch', {
                    movieId: movieId,
                    trailerKey: data.trailerKey
                });
            } else {
                this.showError('Trailer not available for this research sample.');
            }
        } catch (error) {
            console.error('Error fetching trailer:', error);
            this.showError('Unable to load trailer for research purposes.');
        }
    }

    async showMovieDetails(movieId) {
        try {
            const response = await fetch(`/api/research/movies/details/${movieId}`);
            if (!response.ok) throw new Error('Details not available');
            
            const movie = await response.json();
            this.showMovieModal(movie);
            
            // Track research interaction
            this.trackResearchAction('details_view', {
                movieId: movieId,
                movieTitle: movie.title
            });
        } catch (error) {
            console.error('Error fetching movie details:', error);
            this.showError('Unable to load research details.');
        }
    }

    showTrailerModal(trailerKey, movieId) {
        const modal = document.getElementById('movieModal');
        const modalContent = document.getElementById('modalContent');
        
        modalContent.innerHTML = `
            <h2>Research Trailer Analysis</h2>
            <div class="trailer-container">
                <iframe width="100%" height="400" 
                        src="https://www.youtube.com/embed/${trailerKey}?autoplay=1" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                </iframe>
            </div>
            <div class="modal-actions">
                <button onclick="researchSystem.trackMovieInterest(${movieId}, 'interested')" class="action-btn more-info-btn">
                    Interested in Research
                </button>
                <button onclick="researchSystem.trackMovieInterest(${movieId}, 'not_interested')" class="action-btn watch-trailer-btn">
                    Not Interested
                </button>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    showMovieModal(movie) {
        const modal = document.getElementById('movieModal');
        const modalContent = document.getElementById('modalContent');
        
        const posterUrl = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : '../images/default-movie-thumbnail.png';

        modalContent.innerHTML = `
            <div class="movie-detail-header">
                <img src="${posterUrl}" alt="${movie.title}" class="modal-poster" 
                     onerror="this.src='../images/default-movie-thumbnail.png'">
                <div class="modal-movie-info">
                    <h2>${movie.title}</h2>
                    <div class="modal-movie-meta">
                        <span>${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span> • 
                        <span>${movie.runtime ? `${movie.runtime} min` : 'N/A'}</span> • 
                        <span class="movie-rating">★ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                    </div>
                    <div class="modal-movie-genres">
                        ${movie.genres ? movie.genres.map(genre => 
                            `<span class="genre-tag">${genre.name}</span>`
                        ).join('') : ''}
                    </div>
                </div>
            </div>
            <div class="movie-detail-body">
                <div class="movie-description">
                    <h3>Research Synopsis</h3>
                    <p>${movie.overview || 'No synopsis available for research analysis.'}</p>
                </div>
                <div class="research-platforms">
                    <h3>Research Data Sources</h3>
                    <div class="platforms-grid">
                        <div class="platform-item">
                            <strong>TMDb ID:</strong> ${movie.id}
                        </div>
                        <div class="platform-item">
                            <strong>Popularity:</strong> ${movie.popularity ? movie.popularity.toFixed(2) : 'N/A'}
                        </div>
                        <div class="platform-item">
                            <strong>Vote Count:</strong> ${movie.vote_count || 'N/A'}
                        </div>
                        <div class="platform-item">
                            <strong>Original Language:</strong> ${movie.original_language || 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button onclick="researchSystem.trackMovieInterest(${movie.id}, 'interested')" class="action-btn more-info-btn">
                    Interested in Research
                </button>
                <button onclick="researchSystem.trackMovieInterest(${movie.id}, 'not_interested')" class="action-btn watch-trailer-btn">
                    Not Interested
                </button>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    trackMovieInterest(movieId, interest) {
        const movie = this.recommendations.find(m => m.id === movieId);
        
        if (interest === 'interested') {
            this.seenMovies.push(movieId);
            this.trackResearchAction('movie_interest', {
                movieId: movieId,
                movieTitle: movie?.title,
                interest: 'interested'
            });
        } else {
            this.rejectedMovies.push(movieId);
            this.trackResearchAction('movie_rejection', {
                movieId: movieId,
                movieTitle: movie?.title,
                interest: 'not_interested'
            });
        }
        
        this.saveResearchSession();
        this.closeModals();
    }

    async trackResearchAction(action, data) {
        if (this.researchData.consent === 'anonymous') {
            return; // Don't track for anonymous participants
        }

        const trackingData = {
            action: action,
            data: data,
            sessionId: this.researchData.sessionId,
            consent: this.researchData.consent,
            timestamp: new Date().toISOString()
        };

        try {
            await fetch('/api/research/movies/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(trackingData)
            });
        } catch (error) {
            console.error('Error tracking research action:', error);
        }
    }

    showScreen(screenName) {
        const screens = ['preference', 'loading', 'results'];
        screens.forEach(screen => {
            const element = document.getElementById(screen + 'Screen');
            if (element) {
                element.classList.remove('active');
            }
        });

        const targetScreen = document.getElementById(screenName + 'Screen');
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        
        this.currentScreen = screenName;
    }

    showLoadingScreen() {
        this.showScreen('loading');
    }

    closeModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    showError(message) {
        // Simple error display - could be enhanced with a proper error modal
        alert(`Research Error: ${message}`);
    }
}

// Initialize the research system when the page loads
let researchSystem;
document.addEventListener('DOMContentLoaded', () => {
    researchSystem = new HorrorMovieResearch();
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HorrorMovieResearch;
}

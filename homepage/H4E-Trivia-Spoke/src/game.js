// Horror Trivia Game Logic

class HorrorTriviaGame {
  constructor() {
    this.currentQuestionIndex = 0;
    this.totalScore = 0;
    this.correctAnswers = 0;
    this.currentQuestion = null;
    this.gameQuestions = [];
    this.timer = null;
    this.timeLeft = 30;
    this.maxTime = 30;
    this.isAnswered = false;
    
    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    // Screens
    this.startScreen = document.getElementById('startScreen');
    this.questionScreen = document.getElementById('questionScreen');
    this.answerScreen = document.getElementById('answerScreen');
    this.gameOverScreen = document.getElementById('gameOverScreen');
    
    // Start screen elements
    this.startButton = document.getElementById('startGame');
    
    // Question screen elements
    this.currentQuestionSpan = document.getElementById('currentQuestion');
    this.totalQuestionsSpan = document.getElementById('totalQuestions');
    this.timeLeftSpan = document.getElementById('timeLeft');
    this.currentScoreSpan = document.getElementById('currentScore');
    this.timerFill = document.getElementById('timerFill');
    this.questionImage = document.getElementById('questionImage');
    this.questionText = document.getElementById('questionText');
    this.optionButtons = document.querySelectorAll('.option-button');
    this.totalScoreDisplay = document.getElementById('totalScore');
    
    // Answer screen elements
    this.resultIcon = document.getElementById('resultIcon');
    this.resultText = document.getElementById('resultText');
    this.correctAnswerText = document.getElementById('correctAnswerText');
    this.explanationText = document.getElementById('explanationText');
    this.pointsEarned = document.getElementById('pointsEarned');
    this.nextButton = document.getElementById('nextQuestion');
    
    // Game over screen elements
    this.finalScore = document.getElementById('finalScore');
    this.scoreMessage = document.getElementById('scoreMessage');
    this.playAgainButton = document.getElementById('playAgain');
  }

  bindEvents() {
    this.startButton.addEventListener('click', () => this.startGame());
    this.nextButton.addEventListener('click', () => this.nextQuestion());
    this.playAgainButton.addEventListener('click', () => this.restartGame());
    
    // Option button events
    this.optionButtons.forEach(button => {
      button.addEventListener('click', (e) => this.selectAnswer(e));
    });
  }

  async startGame() {
    try {
      // Show loading state
      this.startButton.disabled = true;
      this.startButton.textContent = 'Loading Questions...';
      
      // Fetch questions from database
      const response = await fetch('/api/trivia/questions?limit=10&approved=true&random=true');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      
      this.gameQuestions = await response.json();
      
      if (this.gameQuestions.length === 0) {
        throw new Error('No questions available');
      }
      
      this.currentQuestionIndex = 0;
      this.totalScore = 0;
      this.correctAnswers = 0;
      this.updateTotalScore();
      this.showScreen(this.questionScreen);
      this.loadQuestion();
      
    } catch (error) {
      console.error('Error loading questions:', error);
      alert('Failed to load questions. Please try again.');
    } finally {
      // Reset button
      this.startButton.disabled = false;
      this.startButton.textContent = 'Start Game';
    }
  }

  loadQuestion() {
    if (this.currentQuestionIndex >= this.gameQuestions.length) {
      this.endGame();
      return;
    }

    this.currentQuestion = this.gameQuestions[this.currentQuestionIndex];
    this.isAnswered = false;
    this.timeLeft = this.maxTime;
    
    // Update question counter
    this.currentQuestionSpan.textContent = this.currentQuestionIndex + 1;
    this.totalQuestionsSpan.textContent = this.gameQuestions.length;
    
    // Load question content
    this.questionText.textContent = this.currentQuestion.question;
    
    // Load image with error handling
    this.questionImage.onerror = () => {
      // If external image fails, fall back to placeholder
      this.questionImage.src = '../images/skeletonquestion.png';
    };
    this.questionImage.src = this.currentQuestion.image_url || '../images/skeletonquestion.png';
    
    // Load options (handle both array and JSON string formats)
    let options = this.currentQuestion.options;
    if (typeof options === 'string') {
      try {
        options = JSON.parse(options);
      } catch (e) {
        console.error('Error parsing options:', e);
        options = [];
      }
    }
    
    options.forEach((option, index) => {
      const optionText = document.getElementById(`option${index}`);
      optionText.textContent = option;
      
      // Reset button styles
      const button = this.optionButtons[index];
      button.className = 'option-button';
      button.disabled = false;
    });
    
    // Start timer
    this.startTimer();
  }

  startTimer() {
    this.updateTimerDisplay();
    
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();
      
      if (this.timeLeft <= 0) {
        this.timeUp();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    this.timeLeftSpan.textContent = this.timeLeft;
    this.currentScoreSpan.textContent = this.calculateCurrentScore();
    
    // Update timer bar
    const percentage = (this.timeLeft / this.maxTime) * 100;
    this.timerFill.style.width = `${percentage}%`;
    
    // Change color based on time remaining
    if (this.timeLeft <= 5) {
      this.timerFill.style.background = 'var(--accent-red)';
    } else if (this.timeLeft <= 10) {
      this.timerFill.style.background = 'var(--accent-orange)';
    } else {
      this.timerFill.style.background = 'var(--accent-green)';
    }
  }

  calculateCurrentScore() {
    return Math.max(1, Math.floor((this.timeLeft / this.maxTime) * 10));
  }

  selectAnswer(event) {
    if (this.isAnswered) return;
    
    this.isAnswered = true;
    clearInterval(this.timer);
    
    const selectedButton = event.currentTarget;
    const selectedIndex = parseInt(selectedButton.dataset.option);
    
    // Handle options (could be array or JSON string)
    let options = this.currentQuestion.options;
    if (typeof options === 'string') {
      try {
        options = JSON.parse(options);
      } catch (e) {
        console.error('Error parsing options:', e);
        options = [];
      }
    }
    
    const selectedAnswer = options[selectedIndex];
    const isCorrect = selectedAnswer === this.currentQuestion.correct_answer;
    
    // Calculate score
    const pointsEarned = isCorrect ? this.calculateCurrentScore() : 0;
    this.totalScore += pointsEarned;
    
    // Track correct answers
    if (isCorrect) {
      this.correctAnswers++;
    }
    
    // Show answer feedback
    this.showAnswerFeedback(selectedIndex, isCorrect, pointsEarned);
  }

  showAnswerFeedback(selectedIndex, isCorrect, pointsEarned) {
    // Disable all buttons
    this.optionButtons.forEach(button => {
      button.disabled = true;
    });
    
    // Highlight correct and incorrect answers
    this.optionButtons.forEach((button, index) => {
      const optionText = button.querySelector('.option-text').textContent;
      
      if (optionText === this.currentQuestion.correct_answer) {
        button.classList.add('correct');
      } else if (index === selectedIndex && !isCorrect) {
        button.classList.add('incorrect');
      }
    });
    
    // Wait a moment then show answer screen
    setTimeout(() => {
      this.showAnswerScreen(isCorrect, pointsEarned);
    }, 1500);
  }

  showAnswerScreen(isCorrect, pointsEarned) {
    // Update answer screen content
    this.resultIcon.className = `result-icon ${isCorrect ? 'correct' : 'incorrect'}`;
    this.resultText.textContent = isCorrect ? 'CORRECT!' : 'INCORRECT!';
    this.resultText.className = `result-text ${isCorrect ? 'correct' : 'incorrect'}`;
    this.correctAnswerText.textContent = this.currentQuestion.correct_answer;
    this.explanationText.textContent = this.currentQuestion.explanation || '';
    this.pointsEarned.textContent = pointsEarned;
    
    this.updateTotalScore();
    this.showScreen(this.answerScreen);
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    this.showScreen(this.questionScreen);
    this.loadQuestion();
  }

  timeUp() {
    if (!this.isAnswered) {
      this.isAnswered = true;
      clearInterval(this.timer);
      
      // Show answer feedback with 0 points
      this.showAnswerFeedback(-1, false, 0);
    }
  }

  endGame() {
    this.showScreen(this.gameOverScreen);
    this.finalScore.textContent = this.totalScore;
    this.scoreMessage.textContent = this.getScoreMessage();
  }

  getScoreMessage() {
    const maxPossible = this.gameQuestions.length * 10;
    const percentage = (this.totalScore / maxPossible) * 100;
    
    if (percentage >= 90) {
      return "🎃 AMAZING! You're a true horror master! 🎃";
    } else if (percentage >= 70) {
      return "👻 Great job! You really know your horror! 👻";
    } else if (percentage >= 50) {
      return "💀 Not bad! You've got some horror knowledge! 💀";
    } else if (percentage >= 30) {
      return "🦇 Keep watching! Your horror education continues! 🦇";
    } else {
      return "😱 Time to binge some horror classics! 😱";
    }
  }

  restartGame() {
    this.correctAnswers = 0;
    this.showScreen(this.startScreen);
  }

  showScreen(screen) {
    // Hide all screens
    [this.startScreen, this.questionScreen, this.answerScreen, this.gameOverScreen].forEach(s => {
      s.classList.remove('active');
    });
    
    // Show target screen
    screen.classList.add('active');
  }

  updateTotalScore() {
    const maxPossibleScore = this.gameQuestions.length * 10;
    const scoreText = `${this.correctAnswers} out of ${this.currentQuestionIndex} - Score ${this.totalScore} out of ${maxPossibleScore}`;
    this.totalScoreDisplay.textContent = scoreText;
  }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const game = new HorrorTriviaGame();
  
  // Make game globally accessible for debugging
  window.horrorTriviaGame = game;
});

// Utility functions for AI integration
function generateNewQuestions() {
  // This function would integrate with AI to generate new questions
  // For now, it's a placeholder for future AI integration
  console.log('AI question generation would happen here');
}

function reviewPendingQuestions() {
  // This function would allow manual review of AI-generated questions
  const pending = questionManager.getPendingQuestions();
  console.log('Pending questions for review:', pending);
  return pending;
}

// Export for potential future use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HorrorTriviaGame, generateNewQuestions, reviewPendingQuestions };
} 
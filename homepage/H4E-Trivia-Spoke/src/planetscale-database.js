// PlanetScale Database Service for Horror Trivia

// You'll need to add your PlanetScale connection details here
const PLANETSCALE_CONNECTION_STRING = 'YOUR_PLANETSCALE_CONNECTION_STRING';

class PlanetScaleTriviaDatabase {
  constructor() {
    this.connection = null;
    this.initializeConnection();
  }

  async initializeConnection() {
    // We'll use a simple HTTP API approach for PlanetScale
    // PlanetScale provides a REST API that's perfect for this use case
    console.log('PlanetScale connection will be initialized here');
  }

  // Get random approved questions
  async getRandomQuestions(count = 10) {
    try {
      // Using PlanetScale's REST API
      const response = await fetch(`/api/trivia/questions?limit=${count}&approved=true&random=true`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  }

  // Get questions by category
  async getQuestionsByCategory(category, count = 10) {
    try {
      const response = await fetch(`/api/trivia/questions?limit=${count}&category=${category}&approved=true&random=true`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching questions by category:', error);
      return [];
    }
  }

  // Get questions by difficulty
  async getQuestionsByDifficulty(difficulty, count = 10) {
    try {
      const response = await fetch(`/api/trivia/questions?limit=${count}&difficulty=${difficulty}&approved=true&random=true`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching questions by difficulty:', error);
      return [];
    }
  }

  // Add a new question (for admin use)
  async addQuestion(questionData) {
    try {
      const response = await fetch('/api/trivia/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData)
      });
      
      if (!response.ok) throw new Error('Failed to add question');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  }

  // Update a question (for admin use)
  async updateQuestion(id, updates) {
    try {
      const response = await fetch(`/api/trivia/questions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update question');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  // Approve a question (for admin use)
  async approveQuestion(id) {
    return await this.updateQuestion(id, { is_approved: true });
  }

  // Delete a question (for admin use)
  async deleteQuestion(id) {
    try {
      const response = await fetch(`/api/trivia/questions/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete question');
      return true;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  // Get pending questions (for admin use)
  async getPendingQuestions() {
    try {
      const response = await fetch('/api/trivia/questions?approved=false');
      if (!response.ok) throw new Error('Failed to fetch pending questions');
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching pending questions:', error);
      return [];
    }
  }

  // Get question statistics
  async getQuestionStats() {
    try {
      const response = await fetch('/api/trivia/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching question stats:', error);
      return { total: 0, approved: 0, pending: 0, categories: {}, difficulties: {} };
    }
  }

  // Import questions from JSON (for initial setup)
  async importQuestions(questionsArray) {
    try {
      const response = await fetch('/api/trivia/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionsArray)
      });
      
      if (!response.ok) throw new Error('Failed to import questions');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error importing questions:', error);
      throw error;
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlanetScaleTriviaDatabase };
}

// Make available globally for browser use
window.PlanetScaleTriviaDatabase = PlanetScaleTriviaDatabase; 
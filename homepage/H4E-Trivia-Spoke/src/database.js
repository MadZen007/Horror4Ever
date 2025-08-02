// Supabase Database Service for Horror Trivia

// Initialize Supabase client
// You'll need to add your Supabase URL and anon key here
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client (you'll need to include the Supabase JS library)
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class TriviaDatabase {
  constructor() {
    this.supabase = null;
    this.initializeSupabase();
  }

  async initializeSupabase() {
    // This will be initialized when you add the Supabase client
    // For now, we'll use a placeholder
    console.log('Supabase client will be initialized here');
  }

  // Get random approved questions
  async getRandomQuestions(count = 10) {
    try {
      const { data, error } = await this.supabase
        .from('trivia_questions')
        .select('*')
        .eq('is_approved', true)
        .order('RANDOM()')
        .limit(count);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  }

  // Get questions by category
  async getQuestionsByCategory(category, count = 10) {
    try {
      const { data, error } = await this.supabase
        .from('trivia_questions')
        .select('*')
        .eq('is_approved', true)
        .eq('category', category)
        .order('RANDOM()')
        .limit(count);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching questions by category:', error);
      return [];
    }
  }

  // Get questions by difficulty
  async getQuestionsByDifficulty(difficulty, count = 10) {
    try {
      const { data, error } = await this.supabase
        .from('trivia_questions')
        .select('*')
        .eq('is_approved', true)
        .eq('difficulty', difficulty)
        .order('RANDOM()')
        .limit(count);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching questions by difficulty:', error);
      return [];
    }
  }

  // Add a new question (for admin use)
  async addQuestion(questionData) {
    try {
      const { data, error } = await this.supabase
        .from('trivia_questions')
        .insert([questionData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  }

  // Update a question (for admin use)
  async updateQuestion(id, updates) {
    try {
      const { data, error } = await this.supabase
        .from('trivia_questions')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
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
      const { error } = await this.supabase
        .from('trivia_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  // Get pending questions (for admin use)
  async getPendingQuestions() {
    try {
      const { data, error } = await this.supabase
        .from('trivia_questions')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending questions:', error);
      return [];
    }
  }

  // Get question statistics
  async getQuestionStats() {
    try {
      const { data, error } = await this.supabase
        .from('trivia_questions')
        .select('is_approved, category, difficulty');

      if (error) throw error;

      const stats = {
        total: data.length,
        approved: data.filter(q => q.is_approved).length,
        pending: data.filter(q => !q.is_approved).length,
        categories: {},
        difficulties: {}
      };

      // Count by category
      data.forEach(q => {
        stats.categories[q.category] = (stats.categories[q.category] || 0) + 1;
        stats.difficulties[q.difficulty] = (stats.difficulties[q.difficulty] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching question stats:', error);
      return { total: 0, approved: 0, pending: 0, categories: {}, difficulties: {} };
    }
  }

  // Import questions from JSON (for initial setup)
  async importQuestions(questionsArray) {
    try {
      const { data, error } = await this.supabase
        .from('trivia_questions')
        .insert(questionsArray)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error importing questions:', error);
      throw error;
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TriviaDatabase };
}

// Make available globally for browser use
window.TriviaDatabase = TriviaDatabase; 
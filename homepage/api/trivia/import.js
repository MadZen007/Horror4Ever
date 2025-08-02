// API endpoint to import trivia questions from JSON
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { questions } = req.body;
    
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Questions array is required' });
    }

    let importedCount = 0;
    let errors = [];

    for (const question of questions) {
      try {
        // Convert from your JSON format to database format
        const dbQuestion = {
          question: question.question,
          image_url: question.image,
          options: JSON.stringify(question.options),
          correct_answer: question.correctAnswer,
          explanation: question.explanation || '',
          category: 'horror',
          difficulty: 1,
          is_approved: true
        };

        const sql = `
          INSERT INTO trivia_questions 
          (question, image_url, options, correct_answer, explanation, category, difficulty, is_approved)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;

        const params = [
          dbQuestion.question,
          dbQuestion.image_url,
          dbQuestion.options,
          dbQuestion.correct_answer,
          dbQuestion.explanation,
          dbQuestion.category,
          dbQuestion.difficulty,
          dbQuestion.is_approved
        ];

        await pool.query(sql, params);
        importedCount++;
      } catch (error) {
        console.error(`Error importing question ${question.id}:`, error);
        errors.push({
          questionId: question.id,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Imported ${importedCount} questions successfully`,
      importedCount,
      totalQuestions: questions.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Failed to import questions'
    });
  }
} 
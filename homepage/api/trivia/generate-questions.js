// Vercel API Route for Manual Question Generation
// This endpoint allows manual triggering of the question generation automation

import { Pool } from 'pg';

// CockroachDB connection configuration
const pool = new Pool({
  connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { count = 10 } = req.body;
    
    console.log('Manual question generation requested:', { count });
    
    // Import the question generator
    const { default: QuestionGenerator } = await import('../../H4E-Trivia-Spoke/automation/question-generator.js');
    
    // Create a new instance and execute
    const generator = new QuestionGenerator();
    const result = await generator.execute();
    
    if (result.success) {
      console.log('Manual generation completed successfully:', result);
      res.status(200).json({
        success: true,
        generatedCount: result.generatedCount,
        message: `Successfully generated ${result.generatedCount} new questions`
      });
    } else {
      console.error('Manual generation failed:', result.error);
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate questions'
      });
    }
    
  } catch (error) {
    console.error('Manual generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during question generation'
    });
  }
} 
// Vercel API Route for Trivia Questions
// This handles all CRUD operations for trivia questions using CockroachDB

import { Pool } from 'pg';

// CockroachDB connection configuration
const pool = new Pool({
  connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGet(req, res);
        break;
      case 'POST':
        await handlePost(req, res);
        break;
      case 'PUT':
        await handlePut(req, res);
        break;
      case 'DELETE':
        await handleDelete(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// GET - Fetch questions
async function handleGet(req, res) {
  const { limit = 10, approved, category, difficulty, random, id } = req.query;
  
  // If a specific question ID is requested
  if (id) {
    try {
      const sql = 'SELECT * FROM trivia_questions WHERE id = $1';
      const result = await pool.query(sql, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      res.status(200).json(result.rows[0]);
      return;
    } catch (error) {
      console.error('GET Question Error:', error);
      res.status(500).json({ error: 'Failed to fetch question' });
      return;
    }
  }
  
  // Fetch multiple questions (existing logic)
  try {
    let sql = 'SELECT * FROM trivia_questions WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (approved !== undefined) {
      paramCount++;
      sql += ` AND is_approved = $${paramCount}`;
      params.push(approved === 'true');
    }
    
    if (category) {
      paramCount++;
      sql += ` AND category = $${paramCount}`;
      params.push(category);
    }
    
    if (difficulty) {
      paramCount++;
      sql += ` AND difficulty = $${paramCount}`;
      params.push(parseInt(difficulty));
    }
    
    if (random === 'true') {
      sql += ' ORDER BY RANDOM()';
    } else {
      sql += ' ORDER BY created_at DESC';
    }
    
    paramCount++;
    sql += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));
    
    const result = await pool.query(sql, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('GET Error:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
}

// POST - Add new question
async function handlePost(req, res) {
  const { question, image_url, options, correct_answer, explanation, category, difficulty, is_approved } = req.body;
  
  try {
    const sql = `
      INSERT INTO trivia_questions 
      (question, image_url, options, correct_answer, explanation, category, difficulty, is_approved)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    
    const params = [
      question,
      image_url,
      JSON.stringify(options),
      correct_answer,
      explanation,
      category || 'horror',
      difficulty || 1,
      is_approved || false
    ];
    
    const result = await pool.query(sql, params);
    
    res.status(201).json({ 
      id: result.rows[0].id,
      message: 'Question added successfully' 
    });
  } catch (error) {
    console.error('POST Error:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
}

// PUT - Update question
async function handlePut(req, res) {
  const { id } = req.query;
  const updates = req.body;
  
  try {
    // Build dynamic update query
    const updateFields = [];
    const params = [];
    let paramCount = 0;
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id') {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        params.push(updates[key]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    paramCount++;
    params.push(parseInt(id));
    
    const sql = `UPDATE trivia_questions SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount}`;
    
    const result = await pool.query(sql, params);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.status(200).json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('PUT Error:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
}

// DELETE - Delete question
async function handleDelete(req, res) {
  const { id } = req.query;
  
  try {
    const sql = 'DELETE FROM trivia_questions WHERE id = $1';
    const result = await pool.query(sql, [parseInt(id)]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('DELETE Error:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
} 
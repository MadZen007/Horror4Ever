// Vercel API Route for Trivia Questions
// This handles all CRUD operations for trivia questions using CockroachDB

const { Pool } = require('pg');

// CockroachDB connection configuration
const pool = new Pool({
  connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = async function handler(req, res) {
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
    console.log('API: Fetching question with ID:', id, 'Type:', typeof id);
    try {
      const sql = 'SELECT * FROM trivia_questions WHERE id = $1';
      console.log('API: Executing SQL:', sql, 'with params:', [id]);
      const result = await pool.query(sql, [id]);
      console.log('API: Query result rows:', result.rows.length);
      
      if (result.rows.length === 0) {
        console.log('API: Question not found with ID:', id);
        return res.status(404).json({ error: 'Question not found' });
      }
      
      console.log('API: Found question:', { id: result.rows[0].id, question: result.rows[0].question });
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
    
    console.log('GET: Fetching questions with filters:', { limit, approved, category, difficulty, random });
    
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
    console.log('GET: Query result - found', result.rows.length, 'questions');
    if (result.rows.length > 0) {
      console.log('GET: Sample question IDs:', result.rows.slice(0, 3).map(q => ({ id: q.id, question: q.question.substring(0, 50) + '...', is_approved: q.is_approved })));
    }
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
  
  console.log('PUT: Attempting to update question with ID:', id, 'Type:', typeof id);
  
  try {
    // Handle large integer IDs properly - don't use parseInt for very large numbers
    const questionId = id;
    console.log('PUT: Using question ID as:', questionId, 'Type:', typeof questionId);
    
    // Build dynamic update query
    const updateFields = [];
    const params = [];
    let paramCount = 0;
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id') {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        // Handle options field - stringify if it's an array
        if (key === 'options' && Array.isArray(updates[key])) {
          params.push(JSON.stringify(updates[key]));
        } else {
          params.push(updates[key]);
        }
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    paramCount++;
    params.push(questionId);
    
    const sql = `UPDATE trivia_questions SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount}`;
    console.log('PUT: Executing SQL:', sql, 'with params:', params);
    
    const result = await pool.query(sql, params);
    console.log('PUT: Update result rowCount:', result.rowCount);
    
    if (result.rowCount === 0) {
      console.log('PUT: Question not found in database');
      return res.status(404).json({ error: 'Question not found' });
    }
    
    console.log('PUT: Question successfully updated');
    res.status(200).json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('PUT Error:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
}

// DELETE - Delete question
async function handleDelete(req, res) {
  const { id } = req.query;
  
  console.log('DELETE: Attempting to delete question with ID:', id, 'Type:', typeof id);
  
  try {
    // Handle large integer IDs properly - don't use parseInt for very large numbers
    const questionId = id;
    console.log('DELETE: Using question ID as:', questionId, 'Type:', typeof questionId);
    
    // First, let's check if the question exists
    const checkSql = 'SELECT id, question, is_approved FROM trivia_questions WHERE id = $1';
    console.log('DELETE: Checking if question exists with SQL:', checkSql, 'with params:', [questionId]);
    const checkResult = await pool.query(checkSql, [questionId]);
    console.log('DELETE: Check result rows:', checkResult.rows.length);
    
    if (checkResult.rows.length === 0) {
      console.log('DELETE: Question not found in database - ID does not exist');
      return res.status(404).json({ error: 'Question not found' });
    }
    
    const question = checkResult.rows[0];
    console.log('DELETE: Found question:', { id: question.id, question: question.question, is_approved: question.is_approved });
    
    // Now delete the question
    const deleteSql = 'DELETE FROM trivia_questions WHERE id = $1';
    console.log('DELETE: Executing delete SQL:', deleteSql, 'with params:', [questionId]);
    const result = await pool.query(deleteSql, [questionId]);
    console.log('DELETE: Delete result rowCount:', result.rowCount);
    
    console.log('DELETE: Question successfully deleted');
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('DELETE Error:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
} 
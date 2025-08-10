// API endpoint for tracking game sessions, visits, and responses
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = async function handler(req, res) {
  const { method, body } = req;

  try {
    switch (method) {
      case 'POST':
        await handleTrack(req, res);
        break;
      default:
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Tracking API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Handle tracking requests
async function handleTrack(req, res) {
  const { action, data } = req.body;
  
  try {
    switch (action) {
      case 'start_game':
        await trackGameStart(data, res);
        break;
      case 'end_game':
        await trackGameEnd(data, res);
        break;
      case 'question_response':
        await trackQuestionResponse(data, res);
        break;
      case 'site_visit':
        await trackSiteVisit(data, res);
        break;
      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Failed to track data' });
  }
}

// Track game start
async function trackGameStart(data, res) {
  const { sessionId, userAgent, ipAddress } = data;
  
  const sql = `
    INSERT INTO game_sessions (session_id, user_agent, ip_address)
    VALUES ($1, $2, $3)
    ON CONFLICT (session_id) DO NOTHING
  `;
  
  await pool.query(sql, [sessionId, userAgent, ipAddress]);
  
  res.status(200).json({ 
    success: true, 
    message: 'Game session started',
    sessionId 
  });
}

// Track game end
async function trackGameEnd(data, res) {
  const { 
    sessionId, 
    totalScore, 
    questionsAnswered, 
    correctAnswers, 
    maxPossibleScore 
  } = data;
  
  const sql = `
    UPDATE game_sessions 
    SET 
      end_time = CURRENT_TIMESTAMP,
      total_score = $2,
      questions_answered = $3,
      correct_answers = $4,
      max_possible_score = $5,
      completed = true
    WHERE session_id = $1
  `;
  
  const result = await pool.query(sql, [
    sessionId, 
    totalScore, 
    questionsAnswered, 
    correctAnswers, 
    maxPossibleScore
  ]);
  
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  res.status(200).json({ 
    success: true, 
    message: 'Game session ended',
    sessionId 
  });
}

// Track question response
async function trackQuestionResponse(data, res) {
  const { 
    sessionId, 
    questionId, 
    selectedAnswer, 
    correctAnswer, 
    isCorrect, 
    timeTaken, 
    pointsEarned 
  } = data;
  
  const sql = `
    INSERT INTO question_responses 
    (session_id, question_id, selected_answer, correct_answer, is_correct, time_taken, points_earned)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  
  await pool.query(sql, [
    sessionId, 
    questionId, 
    selectedAnswer, 
    correctAnswer, 
    isCorrect, 
    timeTaken, 
    pointsEarned
  ]);
  
  res.status(200).json({ 
    success: true, 
    message: 'Question response tracked' 
  });
}

// Track site visit
async function trackSiteVisit(data, res) {
  const { 
    pageUrl, 
    userAgent, 
    ipAddress, 
    referrer, 
    sessionId 
  } = data;
  
  const sql = `
    INSERT INTO site_visits (page_url, user_agent, ip_address, referrer, session_id)
    VALUES ($1, $2, $3, $4, $5)
  `;
  
  await pool.query(sql, [pageUrl, userAgent, ipAddress, referrer, sessionId]);
  
  res.status(200).json({ 
    success: true, 
    message: 'Site visit tracked' 
  });
} 
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

// Simplified question generation logic (copied from automation)
const horrorMovies = [
  { title: 'Halloween', year: 1978, director: 'John Carpenter', location: 'Haddonfield, Illinois', characters: { 'main villain': 'Michael Myers', 'protagonist': 'Laurie Strode', 'final girl': 'Laurie Strode', 'monster': 'Michael Myers' }},
  { title: 'The Shining', year: 1980, director: 'Stanley Kubrick', location: 'Overlook Hotel, Colorado', characters: { 'main villain': 'Jack Torrance', 'protagonist': 'Danny Torrance', 'final girl': 'Wendy Torrance', 'monster': 'Jack Torrance' }},
  { title: 'A Nightmare on Elm Street', year: 1984, director: 'Wes Craven', location: 'Springwood, Ohio', characters: { 'main villain': 'Freddy Krueger', 'protagonist': 'Nancy Thompson', 'final girl': 'Nancy Thompson', 'monster': 'Freddy Krueger' }},
  { title: 'Friday the 13th', year: 1980, director: 'Sean S. Cunningham', location: 'Camp Crystal Lake, New Jersey', characters: { 'main villain': 'Jason Voorhees', 'protagonist': 'Alice Hardy', 'final girl': 'Alice Hardy', 'monster': 'Jason Voorhees' }},
  { title: 'The Exorcist', year: 1973, director: 'William Friedkin', location: 'Georgetown, Washington D.C.', characters: { 'main villain': 'Pazuzu', 'protagonist': 'Father Damien Karras', 'final girl': 'Regan MacNeil', 'monster': 'Pazuzu' }},
  { title: 'Psycho', year: 1960, director: 'Alfred Hitchcock', location: 'Bates Motel, California', characters: { 'main villain': 'Norman Bates', 'protagonist': 'Marion Crane', 'final girl': 'Lila Crane', 'monster': 'Norman Bates' }},
  { title: 'The Texas Chain Saw Massacre', year: 1974, director: 'Tobe Hooper', location: 'Texas', characters: { 'main villain': 'Leatherface', 'protagonist': 'Sally Hardesty', 'final girl': 'Sally Hardesty', 'monster': 'Leatherface' }},
  { title: 'Evil Dead', year: 1981, director: 'Sam Raimi', location: 'Tennessee', characters: { 'main villain': 'Deadites', 'protagonist': 'Ash Williams', 'final girl': 'Ash Williams', 'monster': 'Deadites' }},
  { title: 'The Omen', year: 1976, director: 'Richard Donner', location: 'London, England', characters: { 'main villain': 'Damien Thorn', 'protagonist': 'Robert Thorn', 'final girl': 'Katherine Thorn', 'monster': 'Damien Thorn' }},
  { title: 'Poltergeist', year: 1982, director: 'Tobe Hooper', location: 'Cuesta Verde, California', characters: { 'main villain': 'Beast', 'protagonist': 'Carol Anne Freeling', 'final girl': 'Diane Freeling', 'monster': 'Beast' }},
  { title: 'The Fly', year: 1986, director: 'David Cronenberg', location: 'Philadelphia, Pennsylvania', characters: { 'main villain': 'Seth Brundle', 'protagonist': 'Seth Brundle', 'final girl': 'Veronica Quaife', 'monster': 'Seth Brundle' }},
  { title: 'Dawn of the Dead', year: 1978, director: 'George A. Romero', location: 'Shopping mall', characters: { 'main villain': 'Zombies', 'protagonist': 'Peter Washington', 'final girl': 'Francine Parker', 'monster': 'Zombies' }}
];

const questionTemplates = [
  { type: 'year', template: "What year was '{movie}' released?", difficulty: 1 },
  { type: 'director', template: "Who directed '{movie}'?", difficulty: 2 },
  { type: 'location', template: "Where does '{movie}' take place?", difficulty: 2 },
  { type: 'character', template: "What is the name of the {characterType} in '{movie}'?", difficulty: 2 }
];

const characterTypes = ['main villain', 'protagonist', 'final girl', 'monster'];

async function fetchApprovedQuestions() {
  try {
    const result = await pool.query('SELECT question FROM trivia_questions WHERE is_approved = true');
    return result.rows.map(row => row.question);
  } catch (error) {
    console.error('Error fetching approved questions:', error);
    throw error;
  }
}

function generateCharacterOptions(movieTitle, characterType) {
  const movie = horrorMovies.find(m => m.title === movieTitle);
  if (!movie || !movie.characters[characterType]) {
    return null;
  }
  
  const correctCharacter = movie.characters[characterType];
  const allCharacters = horrorMovies.flatMap(m => Object.values(m.characters));
  const otherCharacters = allCharacters.filter(char => char !== correctCharacter);
  
  const options = [correctCharacter];
  while (options.length < 4 && otherCharacters.length > 0) {
    const randomIndex = Math.floor(Math.random() * otherCharacters.length);
    const randomCharacter = otherCharacters.splice(randomIndex, 1)[0];
    if (!options.includes(randomCharacter)) {
      options.push(randomCharacter);
    }
  }
  
  // Shuffle options
  return options.sort(() => Math.random() - 0.5);
}

function validateQuestion(question, movieTitle, questionType) {
  const movie = horrorMovies.find(m => m.title === movieTitle);
  if (!movie) return false;
  
  switch (questionType) {
    case 'year':
      return question.correct_answer === movie.year.toString();
    case 'director':
      return question.correct_answer === movie.director;
    case 'location':
      return question.correct_answer === movie.location;
    case 'character':
      const characterType = question.question.match(/the (\w+(?:\s+\w+)*) in/)?.[1];
      if (!characterType) return false;
      const fullCharacterType = characterTypes.find(type => type.includes(characterType));
      return fullCharacterType && question.correct_answer === movie.characters[fullCharacterType];
    default:
      return true;
  }
}

async function generateQuestions(count = 10) {
  const approvedQuestions = await fetchApprovedQuestions();
  const generatedQuestions = [];
  let attempts = 0;
  const maxAttempts = 100;
  
  while (generatedQuestions.length < count && attempts < maxAttempts) {
    attempts++;
    
    const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
    const movie = horrorMovies[Math.floor(Math.random() * horrorMovies.length)];
    
    let questionText, correctAnswer, options;
    
    if (template.type === 'character') {
      const characterType = characterTypes[Math.floor(Math.random() * characterTypes.length)];
      questionText = template.template.replace('{movie}', movie.title).replace('{characterType}', characterType);
      options = generateCharacterOptions(movie.title, characterType);
      if (!options) continue;
      correctAnswer = options[0]; // First option is correct
    } else {
      questionText = template.template.replace('{movie}', movie.title);
      
      switch (template.type) {
        case 'year':
          correctAnswer = movie.year.toString();
          options = [correctAnswer];
          while (options.length < 4) {
            const randomYear = movie.year + Math.floor(Math.random() * 20) - 10;
            if (!options.includes(randomYear.toString())) {
              options.push(randomYear.toString());
            }
          }
          break;
        case 'director':
          correctAnswer = movie.director;
          options = [correctAnswer];
          const allDirectors = horrorMovies.map(m => m.director);
          while (options.length < 4) {
            const randomDirector = allDirectors[Math.floor(Math.random() * allDirectors.length)];
            if (!options.includes(randomDirector)) {
              options.push(randomDirector);
            }
          }
          break;
        case 'location':
          correctAnswer = movie.location;
          options = [correctAnswer];
          const allLocations = horrorMovies.map(m => m.location);
          while (options.length < 4) {
            const randomLocation = allLocations[Math.floor(Math.random() * allLocations.length)];
            if (!options.includes(randomLocation)) {
              options.push(randomLocation);
            }
          }
          break;
      }
    }
    
    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);
    
    const newQuestion = {
      question: questionText,
      image_url: '../images/skeletonquestion.png',
      options: JSON.stringify(options),
      correct_answer: correctAnswer,
      explanation: `The answer is ${correctAnswer}.`,
      category: 'horror',
      difficulty: template.difficulty,
      is_approved: false
    };
    
    // Check if question is unique and valid
    if (!approvedQuestions.includes(questionText) && 
        !generatedQuestions.some(q => q.question === questionText) &&
        validateQuestion(newQuestion, movie.title, template.type)) {
      generatedQuestions.push(newQuestion);
      console.log(`Generated question ${generatedQuestions.length}: ${questionText}...`);
    }
  }
  
  return generatedQuestions;
}

async function saveQuestionsToDatabase(questions) {
  const insertQuery = `
    INSERT INTO trivia_questions (question, image_url, options, correct_answer, explanation, category, difficulty, is_approved, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;
  
  let savedCount = 0;
  for (const question of questions) {
    try {
      await pool.query(insertQuery, [
        question.question,
        question.image_url,
        question.options,
        question.correct_answer,
        question.explanation,
        question.category,
        question.difficulty,
        question.is_approved
      ]);
      savedCount++;
    } catch (error) {
      console.error('Error saving question to database:', error);
    }
  }
  
  return savedCount;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { count = 10 } = req.body;
    
    console.log('Manual question generation requested:', { count });
    
    // Generate questions
    const questions = await generateQuestions(count);
    
    if (questions.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate any questions'
      });
    }
    
    // Save to database
    const savedCount = await saveQuestionsToDatabase(questions);
    
    console.log(`Successfully saved ${savedCount} questions to database`);
    
    res.status(200).json({
      success: true,
      generatedCount: savedCount,
      message: `Successfully generated ${savedCount} new questions`
    });
    
  } catch (error) {
    console.error('Manual generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during question generation'
    });
  }
} 
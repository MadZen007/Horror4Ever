// Daily Question Generator for Horror4Ever Trivia
// This script runs daily at 8:00 AM to generate 10 new unique questions

import { Pool } from 'pg';

// CockroachDB connection configuration
const pool = new Pool({
  connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

class QuestionGenerator {
  constructor() {
    this.generatedQuestions = [];
    this.approvedQuestions = [];
    this.questionTemplates = this.initializeTemplates();
  }

  // Initialize question generation templates
  initializeTemplates() {
    return {
      movieYears: {
        pattern: "What year was '{movie}' released?",
        difficulty: 1,
        category: 'horror'
      },
      directors: {
        pattern: "Who directed '{movie}'?",
        difficulty: 2,
        category: 'horror'
      },
      characters: {
        pattern: "What is the name of the {character_type} in '{movie}'?",
        difficulty: 2,
        category: 'horror'
      },
      weapons: {
        pattern: "What weapon does {character} use in '{movie}'?",
        difficulty: 1,
        category: 'horror'
      },
      locations: {
        pattern: "Where does '{movie}' take place?",
        difficulty: 2,
        category: 'horror'
      },
      actors: {
        pattern: "Who plays {character} in '{movie}'?",
        difficulty: 3,
        category: 'horror'
      },
      sequels: {
        pattern: "How many sequels does '{movie}' have?",
        difficulty: 2,
        category: 'horror'
      },
      awards: {
        pattern: "What award did '{movie}' win?",
        difficulty: 3,
        category: 'horror'
      }
    };
  }

  // Fetch approved questions from database
  async fetchApprovedQuestions() {
    try {
      const sql = 'SELECT * FROM trivia_questions WHERE is_approved = true ORDER BY RANDOM() LIMIT 50';
      const result = await pool.query(sql);
      this.approvedQuestions = result.rows;
      console.log(`Fetched ${this.approvedQuestions.length} approved questions for analysis`);
      return this.approvedQuestions;
    } catch (error) {
      console.error('Error fetching approved questions:', error);
      throw error;
    }
  }

  // Extract movie titles from existing questions
  extractMovieTitles() {
    const movies = new Set();
    
    this.approvedQuestions.forEach(question => {
      // Extract movie titles from question text (basic pattern matching)
      const moviePattern = /'([^']+)'/g;
      const matches = question.question.match(moviePattern);
      if (matches) {
        matches.forEach(match => {
          movies.add(match.replace(/'/g, ''));
        });
      }
    });

    return Array.from(movies);
  }

  // Generate new questions based on approved questions
  async generateQuestions() {
    console.log('Starting daily question generation...');
    
    await this.fetchApprovedQuestions();
    const movieTitles = this.extractMovieTitles();
    
    // Horror movie database for question generation
    const horrorMovies = [
      { title: "The Exorcist", year: 1973, director: "William Friedkin", location: "Georgetown, Washington D.C.", characters: { 'main villain': 'Pazuzu', 'protagonist': 'Regan MacNeil', 'final girl': 'Regan MacNeil' } },
      { title: "Halloween", year: 1978, director: "John Carpenter", location: "Haddonfield, Illinois", characters: { 'main villain': 'Michael Myers', 'protagonist': 'Laurie Strode', 'final girl': 'Laurie Strode' } },
      { title: "A Nightmare on Elm Street", year: 1984, director: "Wes Craven", location: "Springwood, Ohio", characters: { 'main villain': 'Freddy Krueger', 'protagonist': 'Nancy Thompson', 'final girl': 'Nancy Thompson' } },
      { title: "Friday the 13th", year: 1980, director: "Sean S. Cunningham", location: "Camp Crystal Lake", characters: { 'main villain': 'Jason Voorhees', 'protagonist': 'Alice Hardy', 'final girl': 'Alice Hardy' } },
      { title: "The Texas Chain Saw Massacre", year: 1974, director: "Tobe Hooper", location: "Texas", characters: { 'main villain': 'Leatherface', 'protagonist': 'Sally Hardesty', 'final girl': 'Sally Hardesty' } },
      { title: "The Shining", year: 1980, director: "Stanley Kubrick", location: "The Overlook Hotel", characters: { 'main villain': 'Jack Torrance', 'protagonist': 'Danny Torrance', 'final girl': 'Wendy Torrance' } },
      { title: "Alien", year: 1979, director: "Ridley Scott", location: "Nostromo spaceship", characters: { 'main villain': 'Xenomorph', 'protagonist': 'Ellen Ripley', 'final girl': 'Ellen Ripley' } },
      { title: "Psycho", year: 1960, director: "Alfred Hitchcock", location: "Bates Motel", characters: { 'main villain': 'Norman Bates', 'protagonist': 'Marion Crane', 'final girl': 'Lila Crane' } },
      { title: "The Silence of the Lambs", year: 1991, director: "Jonathan Demme", location: "Baltimore, Maryland", characters: { 'main villain': 'Hannibal Lecter', 'protagonist': 'Clarice Starling', 'final girl': 'Clarice Starling' } },
      { title: "Child's Play", year: 1988, director: "Tom Holland", location: "Chicago, Illinois", characters: { 'main villain': 'Chucky', 'protagonist': 'Andy Barclay', 'final girl': 'Karen Barclay' } },
      { title: "The Thing", year: 1982, director: "John Carpenter", location: "Antarctica", characters: { 'main villain': 'The Thing', 'protagonist': 'MacReady', 'final girl': 'MacReady' } },
      { title: "Evil Dead", year: 1981, director: "Sam Raimi", location: "Tennessee cabin", characters: { 'main villain': 'Deadites', 'protagonist': 'Ash Williams', 'final girl': 'Ash Williams' } },
      { title: "Poltergeist", year: 1982, director: "Tobe Hooper", location: "Cuesta Verde, California", characters: { 'main villain': 'Poltergeist', 'protagonist': 'Carol Anne Freeling', 'final girl': 'Diane Freeling' } },
      { title: "The Omen", year: 1976, director: "Richard Donner", location: "London, England", characters: { 'main villain': 'Damien Thorn', 'protagonist': 'Robert Thorn', 'final girl': 'Katherine Thorn' } },
      { title: "Carrie", year: 1976, director: "Brian De Palma", location: "Chamberlain, Maine", characters: { 'main villain': 'Carrie White', 'protagonist': 'Carrie White', 'final girl': 'Sue Snell' } },
      { title: "Rosemary's Baby", year: 1968, director: "Roman Polanski", location: "New York City", characters: { 'main villain': 'Roman Castevet', 'protagonist': 'Rosemary Woodhouse', 'final girl': 'Rosemary Woodhouse' } },
      { title: "The Amityville Horror", year: 1979, director: "Stuart Rosenberg", location: "Amityville, New York", characters: { 'main villain': 'House', 'protagonist': 'George Lutz', 'final girl': 'Kathy Lutz' } },
      { title: "The Hills Have Eyes", year: 1977, director: "Wes Craven", location: "Nevada desert", characters: { 'main villain': 'Jupiter', 'protagonist': 'Brenda Carter', 'final girl': 'Brenda Carter' } },
      { title: "Dawn of the Dead", year: 1978, director: "George A. Romero", location: "Shopping mall", characters: { 'main villain': 'Zombies', 'protagonist': 'Francine Parker', 'final girl': 'Francine Parker' } },
      { title: "The Fly", year: 1986, director: "David Cronenberg", location: "Philadelphia", characters: { 'main villain': 'Brundlefly', 'protagonist': 'Seth Brundle', 'final girl': 'Veronica Quaife' } }
    ];

    // Filter out movies that already have many questions
    const availableMovies = horrorMovies.filter(movie => {
      const existingCount = this.approvedQuestions.filter(q => 
        q.question.includes(movie.title)
      ).length;
      return existingCount < 3; // Limit to 3 questions per movie
    });

    // Generate 10 unique questions
    const questionsToGenerate = 10;
    let generatedCount = 0;
    let attempts = 0;
    const maxAttempts = 100; // Increased to account for validation failures

    while (generatedCount < questionsToGenerate && attempts < maxAttempts) {
      attempts++;
      
      const movie = availableMovies[Math.floor(Math.random() * availableMovies.length)];
      const templateKeys = Object.keys(this.questionTemplates);
      const templateKey = templateKeys[Math.floor(Math.random() * templateKeys.length)];
      const template = this.questionTemplates[templateKey];

      try {
        const newQuestion = await this.createQuestionFromTemplate(movie, template, templateKey);
        
        if (newQuestion && this.isQuestionUnique(newQuestion)) {
          // Validate the question before adding it
          if (this.validateQuestion(newQuestion)) {
            this.generatedQuestions.push(newQuestion);
            generatedCount++;
            console.log(`Generated question ${generatedCount}: ${newQuestion.question.substring(0, 50)}...`);
          } else {
            console.log(`Question failed validation, skipping: ${newQuestion.question.substring(0, 50)}...`);
          }
        }
      } catch (error) {
        console.error('Error generating question:', error);
      }
    }

    console.log(`Successfully generated ${this.generatedQuestions.length} new questions`);
    return this.generatedQuestions;
  }

  // Create a question from a template
  async createQuestionFromTemplate(movie, template, templateType) {
    let question, options, correctAnswer, explanation;

    switch (templateType) {
      case 'movieYears':
        question = `What year was '${movie.title}' released?`;
        options = this.generateYearOptions(movie.year);
        correctAnswer = movie.year.toString();
        explanation = `'${movie.title}' was released in ${movie.year}.`;
        break;

      case 'directors':
        question = `Who directed '${movie.title}'?`;
        options = this.generateDirectorOptions(movie.director);
        correctAnswer = movie.director;
        explanation = `'${movie.title}' was directed by ${movie.director}.`;
        break;

      case 'locations':
        question = `Where does '${movie.title}' take place?`;
        options = this.generateLocationOptions(movie.location);
        correctAnswer = movie.location;
        explanation = `'${movie.title}' is set in ${movie.location}.`;
        break;

      case 'characters':
        const characterTypes = ['main villain', 'protagonist', 'final girl', 'monster'];
        const characterType = characterTypes[Math.floor(Math.random() * characterTypes.length)];
        question = `What is the name of the ${characterType} in '${movie.title}'?`;
        options = this.generateCharacterOptions(movie.title, characterType);
        correctAnswer = options[0]; // First option is correct
        explanation = `The ${characterType} in '${movie.title}' is ${correctAnswer}.`;
        break;

      default:
        return null;
    }

    return {
      question,
      image_url: '../images/skeletonquestion.png',
      options: JSON.stringify(options),
      correct_answer: correctAnswer,
      explanation,
      category: template.category,
      difficulty: template.difficulty,
      is_approved: false,
      ai_generated: true,
      generated_date: new Date().toISOString().split('T')[0]
    };
  }

  // Generate year options with the correct year and 3 wrong years
  generateYearOptions(correctYear) {
    const options = [correctYear];
    const yearRange = 20; // ±20 years from correct year
    
    while (options.length < 4) {
      const randomYear = correctYear + Math.floor(Math.random() * yearRange * 2) - yearRange;
      if (randomYear >= 1900 && randomYear <= 2024 && !options.includes(randomYear)) {
        options.push(randomYear);
      }
    }
    
    return this.shuffleArray(options);
  }

  // Generate director options
  generateDirectorOptions(correctDirector) {
    const famousDirectors = [
      "John Carpenter", "Wes Craven", "Alfred Hitchcock", "Stanley Kubrick",
      "David Cronenberg", "George A. Romero", "Tobe Hooper", "William Friedkin",
      "Roman Polanski", "Brian De Palma", "Sam Raimi", "Ridley Scott"
    ];
    
    const options = [correctDirector];
    
    while (options.length < 4) {
      const randomDirector = famousDirectors[Math.floor(Math.random() * famousDirectors.length)];
      if (!options.includes(randomDirector)) {
        options.push(randomDirector);
      }
    }
    
    return this.shuffleArray(options);
  }

  // Generate location options
  generateLocationOptions(correctLocation) {
    const locations = [
      "New York City", "Los Angeles", "Chicago", "Texas", "California",
      "Illinois", "Ohio", "Maine", "Nevada", "Antarctica", "London, England",
      "Georgetown, Washington D.C.", "Baltimore, Maryland", "Philadelphia"
    ];
    
    const options = [correctLocation];
    
    while (options.length < 4) {
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      if (!options.includes(randomLocation)) {
        options.push(randomLocation);
      }
    }
    
    return this.shuffleArray(options);
  }

  // Generate character options (simplified)
  generateCharacterOptions(movieTitle, characterType) {
    // Find the correct character for this movie and character type
    const movie = this.movieDatabase.find(m => m.title === movieTitle);
    if (!movie || !movie.characters[characterType]) {
      console.log(`Warning: No character data found for ${movieTitle} - ${characterType}`);
      return this.generateFallbackCharacterOptions();
    }
    
    const correctCharacter = movie.characters[characterType];
    
    // Get other characters from different movies for wrong options
    const allCharacters = [];
    this.movieDatabase.forEach(m => {
      Object.values(m.characters).forEach(char => {
        if (char !== correctCharacter && !allCharacters.includes(char)) {
          allCharacters.push(char);
        }
      });
    });
    
    const options = [correctCharacter];
    while (options.length < 4) {
      const randomCharacter = allCharacters[Math.floor(Math.random() * allCharacters.length)];
      if (!options.includes(randomCharacter)) {
        options.push(randomCharacter);
      }
    }
    
    return this.shuffleArray(options);
  }

  generateFallbackCharacterOptions() {
    const characterOptions = [
      "Michael Myers", "Freddy Krueger", "Jason Voorhees", "Leatherface",
      "Chucky", "Norman Bates", "Hannibal Lecter", "Regan MacNeil",
      "Laurie Strode", "Nancy Thompson", "Ellen Ripley", "Jack Torrance"
    ];
    
    const options = [];
    while (options.length < 4) {
      const randomCharacter = characterOptions[Math.floor(Math.random() * characterOptions.length)];
      if (!options.includes(randomCharacter)) {
        options.push(randomCharacter);
      }
    }
    
    return this.shuffleArray(options);
  }

  // Check if question is unique (not already in database)
  isQuestionUnique(newQuestion) {
    return !this.approvedQuestions.some(existing => 
      existing.question.toLowerCase() === newQuestion.question.toLowerCase()
    );
  }

  // Fact-check the generated question
  validateQuestion(question) {
    console.log(`Validating question: ${question.question}`);
    
    // Extract movie title from question
    const movieMatch = question.question.match(/'([^']+)'/);
    if (!movieMatch) {
      console.log('Warning: Could not extract movie title from question');
      return false;
    }
    
    const movieTitle = movieMatch[1];
    const movie = this.movieDatabase.find(m => m.title === movieTitle);
    
    if (!movie) {
      console.log(`Warning: Movie "${movieTitle}" not found in database`);
      return false;
    }
    
    // Validate based on question type
    if (question.question.includes('year')) {
      const correctYear = movie.year.toString();
      if (question.correct_answer !== correctYear) {
        console.log(`Error: Wrong year for ${movieTitle}. Expected: ${correctYear}, Got: ${question.correct_answer}`);
        return false;
      }
    } else if (question.question.includes('directed')) {
      if (question.correct_answer !== movie.director) {
        console.log(`Error: Wrong director for ${movieTitle}. Expected: ${movie.director}, Got: ${question.correct_answer}`);
        return false;
      }
    } else if (question.question.includes('place')) {
      if (question.correct_answer !== movie.location) {
        console.log(`Error: Wrong location for ${movieTitle}. Expected: ${movie.location}, Got: ${question.correct_answer}`);
        return false;
      }
    } else if (question.question.includes('name of')) {
      // Extract character type from question
      const characterTypeMatch = question.question.match(/name of the (main villain|protagonist|final girl|monster)/);
      if (characterTypeMatch) {
        const characterType = characterTypeMatch[1];
        const correctCharacter = movie.characters[characterType];
        if (question.correct_answer !== correctCharacter) {
          console.log(`Error: Wrong character for ${movieTitle} - ${characterType}. Expected: ${correctCharacter}, Got: ${question.correct_answer}`);
          return false;
        }
      }
    }
    
    console.log(`✓ Question validated successfully: ${question.question}`);
    return true;
  }

  // Shuffle array
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Save generated questions to database
  async saveQuestionsToDatabase() {
    console.log('Saving generated questions to database...');
    
    for (const question of this.generatedQuestions) {
      try {
        const sql = `
          INSERT INTO trivia_questions 
          (question, image_url, options, correct_answer, explanation, category, difficulty, is_approved)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
        `;
        
        const params = [
          question.question,
          question.image_url,
          JSON.stringify(question.options),
          question.correct_answer,
          question.explanation,
          question.category,
          question.difficulty,
          question.is_approved
        ];
        
        const result = await pool.query(sql, params);
        console.log(`Saved question with ID: ${result.rows[0].id}`);
        
      } catch (error) {
        console.error('Error saving question to database:', error);
      }
    }
    
    console.log(`Successfully saved ${this.generatedQuestions.length} questions to database`);
  }

  // Main execution method
  async execute() {
    try {
      console.log('=== Starting Daily Question Generation ===');
      console.log(`Date: ${new Date().toISOString()}`);
      
      await this.generateQuestions();
      await this.saveQuestionsToDatabase();
      
      console.log('=== Daily Question Generation Complete ===');
      console.log(`Generated ${this.generatedQuestions.length} new questions`);
      
      return {
        success: true,
        generatedCount: this.generatedQuestions.length,
        questions: this.generatedQuestions
      };
      
    } catch (error) {
      console.error('Error in question generation execution:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      await pool.end();
    }
  }
}

// Export for use in other files
export default QuestionGenerator;

// If running directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new QuestionGenerator();
  generator.execute()
    .then(result => {
      console.log('Execution result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
} 
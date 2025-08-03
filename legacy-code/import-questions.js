// Import Script for Horror Trivia Questions
// This script helps convert your existing questions to the database format

// Your existing questions from questions.js
const existingQuestions = [
  {
    "id": "1",
    "question": "What year was 'The Exorcist' released?",
    "image": "https://firebasestorage.googleapis.com/v0/b/horrorhub.appspot.com/o/public%2Ftrivia-images%2Fq1.jpg?alt=media&token=0d2a4b50-de4a-49b1-8c05-7cdd0b7b5d33",
    "options": ["1971", "1973", "1975", "1977"],
    "correctAnswer": "1973",
    "explanation": "'The Exorcist' was released in 1973 and became a cultural phenomenon."
  },
  {
    "id": "2",
    "question": "Which iconic horror villain wields a glove with razor blades?",
    "image": "https://firebasestorage.googleapis.com/v0/b/horrorhub.appspot.com/o/public%2Ftrivia-images%2Fq2.jpg?alt=media&token=98463f14-8a53-45a6-a1f2-8d0983e33fe8",
    "options": ["Jason Voorhees", "Michael Myers", "Freddy Krueger", "Leatherface"],
    "correctAnswer": "Freddy Krueger",
    "explanation": "Freddy Krueger, from the 'A Nightmare on Elm Street' series, is known for his bladed glove."
  },
  {
    "id": "3",
    "question": "In 'Alien', what is the name of the spaceship?",
    "image": "https://firebasestorage.googleapis.com/v0/b/horrorhub.appspot.com/o/public%2Ftrivia-images%2Fq3.jpg?alt=media&token=f9a77dc9-799f-4554-ab3b-d33b765036ed",
    "options": ["Nostromo", "Sulaco", "Prometheus", "Covenant"],
    "correctAnswer": "Nostromo",
    "explanation": "The Nostromo is the commercial towing spaceship in the original 'Alien' film."
  },
  {
    "id": "4",
    "question": "What is the name of the hotel in 'The Shining'?",
    "image": "../images/skeletonquestion.png",
    "options": ["The Overlook Hotel", "The Stanley Hotel", "The Timberline Lodge", "The Mount Washington Hotel"],
    "correctAnswer": "The Overlook Hotel",
    "explanation": "The Overlook Hotel is the haunted hotel where the Torrance family stays in 'The Shining'."
  },
  {
    "id": "5",
    "question": "Who directed 'Halloween' (1978)?",
    "image": "../images/skeletonquestion.png",
    "options": ["Wes Craven", "John Carpenter", "Tobe Hooper", "George A. Romero"],
    "correctAnswer": "John Carpenter",
    "explanation": "John Carpenter directed, co-wrote, and composed the music for the original 'Halloween'."
  },
  {
    "id": "6",
    "question": "What is the name of the demon in 'The Exorcist'?",
    "image": "../images/skeletonquestion.png",
    "options": ["Pazuzu", "Asmodeus", "Belial", "Mammon"],
    "correctAnswer": "Pazuzu",
    "explanation": "Pazuzu is the demon that possesses Regan in 'The Exorcist'."
  },
  {
    "id": "7",
    "question": "In 'A Nightmare on Elm Street', what is Freddy's full name?",
    "image": "../images/skeletonquestion.png",
    "options": ["Frederick Krueger", "Freddy Krueger", "Frederick Charles Krueger", "Freddy Charles Krueger"],
    "correctAnswer": "Frederick Charles Krueger",
    "explanation": "Freddy's full name is Frederick Charles Krueger, as revealed in the films."
  },
  {
    "id": "8",
    "question": "What year was the original 'Friday the 13th' released?",
    "image": "../images/skeletonquestion.png",
    "options": ["1978", "1980", "1982", "1984"],
    "correctAnswer": "1980",
    "explanation": "The original 'Friday the 13th' was released in 1980, introducing Jason Voorhees' mother as the killer."
  },
  {
    "id": "9",
    "question": "What is the name of the killer doll in 'Child's Play'?",
    "image": "../images/skeletonquestion.png",
    "options": ["Billy", "Chucky", "Dolly", "Buddy"],
    "correctAnswer": "Chucky",
    "explanation": "Chucky is the possessed Good Guys doll that contains the soul of serial killer Charles Lee Ray."
  },
  {
    "id": "10",
    "question": "Who plays Norman Bates in the original 'Psycho'?",
    "image": "../images/skeletonquestion.png",
    "options": ["Anthony Perkins", "Vince Vaughn", "Freddie Highmore", "James D'Arcy"],
    "correctAnswer": "Anthony Perkins",
    "explanation": "Anthony Perkins played Norman Bates in Alfred Hitchcock's original 'Psycho' (1960)."
  }
];

// Function to convert existing questions to database format
function convertQuestionsForDatabase(questions) {
  return questions.map(q => ({
    question: q.question,
    image_url: q.image,
    options: q.options,
    correct_answer: q.correctAnswer,
    explanation: q.explanation,
    category: 'horror',
    difficulty: 1,
    is_approved: true
  }));
}

// Convert your questions
const databaseQuestions = convertQuestionsForDatabase(existingQuestions);

// Export for use in import script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { databaseQuestions, convertQuestionsForDatabase };
}

// For browser use, you can access:
// window.databaseQuestions = databaseQuestions;
// window.convertQuestionsForDatabase = convertQuestionsForDatabase;

console.log('Converted questions for database:', databaseQuestions);
console.log('Total questions to import:', databaseQuestions.length); 
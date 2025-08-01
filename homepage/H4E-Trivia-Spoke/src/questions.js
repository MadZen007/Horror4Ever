// Horror Trivia Questions Database

// Approved Questions (Ready for gameplay)
const approvedQuestions = [
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
    "image": "../homepage/images/skeletonquestion.png",
    "options": ["The Overlook Hotel", "The Stanley Hotel", "The Timberline Lodge", "The Mount Washington Hotel"],
    "correctAnswer": "The Overlook Hotel",
    "explanation": "The Overlook Hotel is the haunted hotel where the Torrance family stays in 'The Shining'."
  },
  {
    "id": "5",
    "question": "Who directed 'Halloween' (1978)?",
    "image": "../homepage/images/skeletonquestion.png",
    "options": ["Wes Craven", "John Carpenter", "Tobe Hooper", "George A. Romero"],
    "correctAnswer": "John Carpenter",
    "explanation": "John Carpenter directed, co-wrote, and composed the music for the original 'Halloween'."
  },
  {
    "id": "6",
    "question": "What is the name of the demon in 'The Exorcist'?",
    "image": "../homepage/images/skeletonquestion.png",
    "options": ["Pazuzu", "Asmodeus", "Belial", "Mammon"],
    "correctAnswer": "Pazuzu",
    "explanation": "Pazuzu is the demon that possesses Regan in 'The Exorcist'."
  },
  {
    "id": "7",
    "question": "In 'A Nightmare on Elm Street', what is Freddy's full name?",
    "image": "../homepage/images/skeletonquestion.png",
    "options": ["Frederick Krueger", "Freddy Krueger", "Frederick Charles Krueger", "Freddy Charles Krueger"],
    "correctAnswer": "Frederick Charles Krueger",
    "explanation": "Freddy's full name is Frederick Charles Krueger, as revealed in the films."
  },
  {
    "id": "8",
    "question": "What year was the original 'Friday the 13th' released?",
    "image": "../homepage/images/skeletonquestion.png",
    "options": ["1978", "1980", "1982", "1984"],
    "correctAnswer": "1980",
    "explanation": "The original 'Friday the 13th' was released in 1980, introducing Jason Voorhees' mother as the killer."
  },
  {
    "id": "9",
    "question": "What is the name of the killer doll in 'Child's Play'?",
    "image": "../homepage/images/skeletonquestion.png",
    "options": ["Billy", "Chucky", "Dolly", "Buddy"],
    "correctAnswer": "Chucky",
    "explanation": "Chucky is the possessed Good Guys doll that contains the soul of serial killer Charles Lee Ray."
  },
  {
    "id": "10",
    "question": "Who plays Norman Bates in the original 'Psycho'?",
    "image": "../homepage/images/skeletonquestion.png",
    "options": ["Anthony Perkins", "Vince Vaughn", "Freddie Highmore", "James D'Arcy"],
    "correctAnswer": "Anthony Perkins",
    "explanation": "Anthony Perkins played Norman Bates in Alfred Hitchcock's original 'Psycho' (1960)."
  }
];

// Pending Questions (AI-generated, awaiting review)
const pendingQuestions = [
  {
    "id": "p1",
    "question": "What is the name of the fictional town where 'Stranger Things' is primarily set?",
    "image": "../homepage/images/skeletonquestion.png",
    "options": ["Hawkins", "Springfield", "Riverdale", "Mystic Falls"],
    "correctAnswer": "Hawkins",
    "explanation": "Hawkins, Indiana is the fictional town where most of the events in 'Stranger Things' take place.",
    "status": "pending",
    "aiGenerated": true,
    "generatedDate": "2024-01-01"
  },
  {
    "id": "p2",
    "question": "In 'The Silence of the Lambs', what is Hannibal Lecter's profession?",
    "image": "../homepage/images/skeletonquestion.png",
    "options": ["Psychiatrist", "Surgeon", "Psychologist", "Criminal Profiler"],
    "correctAnswer": "Psychiatrist",
    "explanation": "Dr. Hannibal Lecter was a brilliant psychiatrist and cannibalistic serial killer.",
    "status": "pending",
    "aiGenerated": true,
    "generatedDate": "2024-01-01"
  }
];

// Question Management Functions
class QuestionManager {
  constructor() {
    this.approvedQuestions = [...approvedQuestions];
    this.pendingQuestions = [...pendingQuestions];
    this.currentGameQuestions = [];
  }

  // Get random questions for a game
  getRandomQuestions(count = 10) {
    const shuffled = [...this.approvedQuestions].sort(() => 0.5 - Math.random());
    this.currentGameQuestions = shuffled.slice(0, count);
    return this.currentGameQuestions;
  }

  // Get a specific question by ID
  getQuestionById(id) {
    return this.approvedQuestions.find(q => q.id === id) || 
           this.pendingQuestions.find(q => q.id === id);
  }

  // Add a new pending question (for AI integration)
  addPendingQuestion(question) {
    const newQuestion = {
      ...question,
      id: `p${this.pendingQuestions.length + 1}`,
      status: "pending",
      aiGenerated: true,
      generatedDate: new Date().toISOString().split('T')[0]
    };
    this.pendingQuestions.push(newQuestion);
    return newQuestion;
  }

  // Approve a pending question
  approveQuestion(pendingId) {
    const pendingIndex = this.pendingQuestions.findIndex(q => q.id === pendingId);
    if (pendingIndex !== -1) {
      const question = this.pendingQuestions[pendingIndex];
      question.status = "approved";
      question.id = `${this.approvedQuestions.length + 1}`;
      this.approvedQuestions.push(question);
      this.pendingQuestions.splice(pendingIndex, 1);
      return question;
    }
    return null;
  }

  // Get all pending questions for review
  getPendingQuestions() {
    return this.pendingQuestions.filter(q => q.status === "pending");
  }

  // Get statistics
  getStats() {
    return {
      approved: this.approvedQuestions.length,
      pending: this.pendingQuestions.filter(q => q.status === "pending").length,
      total: this.approvedQuestions.length + this.pendingQuestions.length
    };
  }
}

// Initialize the question manager
const questionManager = new QuestionManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { questionManager, approvedQuestions, pendingQuestions };
} 
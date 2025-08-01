// Admin Interface for Horror Trivia

class TriviaAdmin {
  constructor() {
    this.currentTab = 'approved';
    this.initializeAdmin();
  }

  initializeAdmin() {
    this.updateStats();
    this.loadQuestions('approved');
  }

  updateStats() {
    const stats = questionManager.getStats();
    document.getElementById('approvedCount').textContent = stats.approved;
    document.getElementById('pendingCount').textContent = stats.pending;
    document.getElementById('totalCount').textContent = stats.total;
  }

  showTab(tabName) {
    this.currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load questions for selected tab
    this.loadQuestions(tabName);
  }

  loadQuestions(tabName) {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';
    
    let questions = [];
    if (tabName === 'approved') {
      questions = questionManager.approvedQuestions;
    } else if (tabName === 'pending') {
      questions = questionManager.getPendingQuestions();
    }
    
    if (questions.length === 0) {
      questionsList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <h3>No ${tabName} questions found</h3>
          <p>${tabName === 'pending' ? 'All questions have been reviewed!' : 'Add some questions to get started!'}</p>
        </div>
      `;
      return;
    }
    
    questions.forEach(question => {
      const questionElement = this.createQuestionElement(question, tabName);
      questionsList.appendChild(questionElement);
    });
  }

  createQuestionElement(question, tabName) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    
    const optionsList = question.options.map((option, index) => {
      const isCorrect = option === question.correctAnswer;
      return `<li class="${isCorrect ? 'correct-option' : ''}">${String.fromCharCode(65 + index)}. ${option}</li>`;
    }).join('');
    
    const actions = tabName === 'pending' ? `
      <div class="question-actions">
        <button class="action-button approve-button" onclick="admin.approveQuestion('${question.id}')">Approve</button>
        <button class="action-button reject-button" onclick="admin.rejectQuestion('${question.id}')">Reject</button>
        <button class="action-button edit-button" onclick="admin.editQuestion('${question.id}')">Edit</button>
      </div>
    ` : `
      <div class="question-actions">
        <button class="action-button edit-button" onclick="admin.editQuestion('${question.id}')">Edit</button>
      </div>
    `;
    
    const aiGenerated = question.aiGenerated ? ' (AI Generated)' : '';
    const generatedDate = question.generatedDate ? ` - Generated: ${question.generatedDate}` : '';
    
    questionDiv.innerHTML = `
      <div class="question-header">
        <div class="question-text">${question.question}</div>
        ${actions}
      </div>
      <div class="question-details">
        ID: ${question.id}${aiGenerated}${generatedDate}
      </div>
      <div class="question-options">
        <ul>${optionsList}</ul>
      </div>
      <div class="question-details">
        <strong>Explanation:</strong> ${question.explanation || 'No explanation provided'}
      </div>
      <div class="question-details">
        <strong>Image:</strong> ${question.image}
      </div>
    `;
    
    return questionDiv;
  }

  approveQuestion(questionId) {
    const approvedQuestion = questionManager.approveQuestion(questionId);
    if (approvedQuestion) {
      this.updateStats();
      this.loadQuestions(this.currentTab);
      this.showNotification(`Question "${approvedQuestion.question.substring(0, 50)}..." approved!`, 'success');
    }
  }

  rejectQuestion(questionId) {
    const pendingIndex = questionManager.pendingQuestions.findIndex(q => q.id === questionId);
    if (pendingIndex !== -1) {
      const rejectedQuestion = questionManager.pendingQuestions[pendingIndex];
      questionManager.pendingQuestions.splice(pendingIndex, 1);
      this.updateStats();
      this.loadQuestions(this.currentTab);
      this.showNotification(`Question "${rejectedQuestion.question.substring(0, 50)}..." rejected!`, 'error');
    }
  }

  editQuestion(questionId) {
    // This would open an edit modal/form
    // For now, just show a notification
    this.showNotification('Edit functionality coming soon!', 'info');
  }

  showNotification(message, type = 'info') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 2rem;
      border-radius: 8px;
      color: var(--dark-bg);
      font-weight: bold;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    
    switch (type) {
      case 'success':
        notification.style.background = 'var(--accent-green)';
        break;
      case 'error':
        notification.style.background = 'var(--accent-red)';
        break;
      default:
        notification.style.background = 'var(--accent-orange)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// AI Integration Functions
function generateNewQuestions() {
  // This would integrate with an AI service
  // For now, we'll simulate AI generation with some sample questions
  
  const sampleQuestions = [
    {
      question: "What is the name of the demonic entity in 'The Conjuring'?",
      image: "../images/skeletonquestion.png",
      options: ["Valak", "Bathsheba", "Annabelle", "The Nun"],
      correctAnswer: "Valak",
      explanation: "Valak is the demonic entity that appears as a nun in 'The Conjuring' universe."
    },
    {
      question: "In 'The Texas Chain Saw Massacre', what does Leatherface use as his weapon?",
      image: "../images/skeletonquestion.png",
      options: ["Machete", "Chainsaw", "Axe", "Knife"],
      correctAnswer: "Chainsaw",
      explanation: "Leatherface is known for using a chainsaw as his primary weapon in the film."
    },
    {
      question: "What year was the original 'Night of the Living Dead' released?",
      image: "../images/skeletonquestion.png",
      options: ["1966", "1968", "1970", "1972"],
      correctAnswer: "1968",
      explanation: "George A. Romero's 'Night of the Living Dead' was released in 1968."
    }
  ];
  
  // Add sample questions to pending
  sampleQuestions.forEach(question => {
    questionManager.addPendingQuestion(question);
  });
  
  // Update the admin interface
  admin.updateStats();
  admin.loadQuestions(admin.currentTab);
  admin.showNotification('Generated 3 new AI questions! Check the Pending Review tab.', 'success');
}

// Initialize admin when page loads
let admin;
document.addEventListener('DOMContentLoaded', () => {
  admin = new TriviaAdmin();
  
  // Make functions globally accessible
  window.showTab = (tabName) => admin.showTab(tabName);
  window.generateNewQuestions = generateNewQuestions;
});

// Add some CSS for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style); 

// Cron Job Scheduler for Daily Question Generation
// This script sets up a cron job to run the question generator daily at 8:00 AM

import cron from 'node-cron';
import QuestionGenerator from './question-generator.js';
import fs from 'fs';
import path from 'path';

class QuestionScheduler {
  constructor() {
    this.isRunning = false;
    this.logFile = path.join(process.cwd(), 'automation-logs.txt');
    this.setupLogging();
  }

  // Setup logging
  setupLogging() {
    // Create log directory if it doesn't exist
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  // Log message with timestamp
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    console.log(logMessage.trim());
    
    // Append to log file
    fs.appendFileSync(this.logFile, logMessage);
  }

  // Execute question generation
  async executeQuestionGeneration() {
    if (this.isRunning) {
      this.log('Question generation already running, skipping...');
      return;
    }

    this.isRunning = true;
    this.log('=== Starting Scheduled Question Generation ===');

    try {
      const generator = new QuestionGenerator();
      const result = await generator.execute();
      
      if (result.success) {
        this.log(`✅ Successfully generated ${result.generatedCount} new questions`);
        this.log(`Generated questions: ${JSON.stringify(result.questions.map(q => q.question.substring(0, 50)))}`);
      } else {
        this.log(`❌ Question generation failed: ${result.error}`);
      }
      
    } catch (error) {
      this.log(`❌ Fatal error in question generation: ${error.message}`);
      console.error('Full error:', error);
    } finally {
      this.isRunning = false;
      this.log('=== Scheduled Question Generation Complete ===\n');
    }
  }

  // Start the cron job scheduler
  startScheduler() {
    this.log('Starting Question Generation Scheduler...');
    
    // Schedule daily question generation at 8:00 AM
    const cronExpression = '0 8 * * *'; // Every day at 8:00 AM
    
    cron.schedule(cronExpression, () => {
      this.log('🕗 8:00 AM - Time to generate daily questions!');
      this.executeQuestionGeneration();
    }, {
      scheduled: true,
      timezone: "America/New_York" // Adjust timezone as needed
    });
    
    this.log(`✅ Scheduler started - Will run daily at 8:00 AM (${cronExpression})`);
    this.log('Scheduler is now running. Press Ctrl+C to stop.');
    
    // Keep the process alive
    process.on('SIGINT', () => {
      this.log('Shutting down scheduler...');
      process.exit(0);
    });
  }

  // Manual execution (for testing)
  async runManual() {
    this.log('🔄 Manual execution triggered');
    await this.executeQuestionGeneration();
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      logFile: this.logFile,
      nextRun: '8:00 AM daily'
    };
  }
}

// Export for use in other files
export default QuestionScheduler;

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const scheduler = new QuestionScheduler();
  
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--manual')) {
    // Run manual execution
    scheduler.runManual()
      .then(() => {
        console.log('Manual execution complete');
        process.exit(0);
      })
      .catch(error => {
        console.error('Manual execution failed:', error);
        process.exit(1);
      });
  } else if (args.includes('--status')) {
    // Show status
    console.log('Scheduler Status:', scheduler.getStatus());
    process.exit(0);
  } else {
    // Start the scheduler
    scheduler.startScheduler();
  }
} 
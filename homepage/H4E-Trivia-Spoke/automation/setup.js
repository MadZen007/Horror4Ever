#!/usr/bin/env node

// Setup script for Horror4Ever Trivia Automation
// This script helps configure and start the daily question generation system

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class AutomationSetup {
  constructor() {
    this.automationDir = process.cwd();
    this.envFile = path.join(this.automationDir, '.env');
    this.logDir = path.join(this.automationDir, 'logs');
  }

  // Check if required environment variables are set
  checkEnvironment() {
    console.log('🔍 Checking environment configuration...');
    
    const requiredVars = ['COCKROACHDB_CONNECTION_STRING'];
    const missing = [];
    
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    });
    
    if (missing.length > 0) {
      console.log('❌ Missing required environment variables:');
      missing.forEach(varName => {
        console.log(`   - ${varName}`);
      });
      
      if (!fs.existsSync(this.envFile)) {
        this.createEnvFile();
      } else {
        console.log('\n📝 Please update your .env file with the missing variables.');
      }
      
      return false;
    }
    
    console.log('✅ Environment configuration looks good!');
    return true;
  }

  // Create .env file template
  createEnvFile() {
    console.log('📝 Creating .env file template...');
    
    const envTemplate = `# Horror4Ever Trivia Automation Environment Variables
# Replace these values with your actual database credentials

# CockroachDB Connection String
# Format: postgresql://username:password@host:port/database?sslmode=require
COCKROACHDB_CONNECTION_STRING=postgresql://your_username:your_password@your_host:26257/your_database?sslmode=require

# Optional: Customize automation settings
GENERATION_TIME=08:00
TIMEZONE=America/New_York
QUESTIONS_PER_DAY=10
LOG_LEVEL=info
`;
    
    fs.writeFileSync(this.envFile, envTemplate);
    console.log('✅ Created .env file template');
    console.log('📝 Please edit the .env file with your actual database credentials');
  }

  // Install dependencies
  installDependencies() {
    console.log('📦 Installing dependencies...');
    
    try {
      execSync('npm install', { stdio: 'inherit', cwd: this.automationDir });
      console.log('✅ Dependencies installed successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to install dependencies:', error.message);
      return false;
    }
  }

  // Create log directory
  createLogDirectory() {
    console.log('📁 Creating log directory...');
    
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
      console.log('✅ Log directory created');
    } else {
      console.log('✅ Log directory already exists');
    }
  }

  // Test database connection
  async testDatabaseConnection() {
    console.log('🔌 Testing database connection...');
    
    try {
      const { Pool } = await import('pg');
      
      const pool = new Pool({
        connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
        ssl: {
          rejectUnauthorized: false
        }
      });
      
      const result = await pool.query('SELECT COUNT(*) FROM trivia_questions');
      console.log(`✅ Database connection successful - Found ${result.rows[0].count} questions`);
      
      await pool.end();
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  // Test question generation
  async testQuestionGeneration() {
    console.log('🧪 Testing question generation...');
    
    try {
      const QuestionGenerator = (await import('./question-generator.js')).default;
      const generator = new QuestionGenerator();
      
      // Test with a small batch
      const testResult = await generator.generateQuestions();
      console.log(`✅ Question generation test successful - Generated ${testResult.length} questions`);
      
      return true;
    } catch (error) {
      console.error('❌ Question generation test failed:', error.message);
      return false;
    }
  }

  // Create systemd service file (for Linux systems)
  createSystemdService() {
    console.log('🔧 Creating systemd service file...');
    
    const serviceContent = `[Unit]
Description=Horror4Ever Trivia Question Generator
After=network.target

[Service]
Type=simple
User=${process.env.USER || 'www-data'}
WorkingDirectory=${this.automationDir}
Environment=NODE_ENV=production
ExecStart=/usr/bin/node scheduler.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
`;
    
    const serviceFile = path.join(this.automationDir, 'horror4ever-trivia.service');
    fs.writeFileSync(serviceFile, serviceContent);
    
    console.log('✅ Created systemd service file: horror4ever-trivia.service');
    console.log('📝 To install the service, run:');
    console.log(`   sudo cp ${serviceFile} /etc/systemd/system/`);
    console.log('   sudo systemctl daemon-reload');
    console.log('   sudo systemctl enable horror4ever-trivia');
    console.log('   sudo systemctl start horror4ever-trivia');
  }

  // Create Windows Task Scheduler script
  createWindowsTask() {
    console.log('🔧 Creating Windows Task Scheduler script...');
    
    const batchContent = `@echo off
cd /d "${this.automationDir}"
node scheduler.js
`;
    
    const batchFile = path.join(this.automationDir, 'start-automation.bat');
    fs.writeFileSync(batchFile, batchContent);
    
    console.log('✅ Created Windows batch file: start-automation.bat');
    console.log('📝 To set up Windows Task Scheduler:');
    console.log('   1. Open Task Scheduler');
    console.log('   2. Create Basic Task');
    console.log('   3. Name: "Horror4Ever Trivia Generator"');
    console.log('   4. Trigger: Daily at 8:00 AM');
    console.log('   5. Action: Start a program');
    console.log(`   6. Program: ${batchFile}`);
  }

  // Show usage instructions
  showUsageInstructions() {
    console.log('\n🎯 Horror4Ever Trivia Automation Setup Complete!');
    console.log('\n📋 Usage Instructions:');
    console.log('\n1. Manual Execution:');
    console.log('   npm run manual    # Run question generation once');
    console.log('   npm run status    # Check scheduler status');
    console.log('   npm run generate  # Run generator directly');
    
    console.log('\n2. Start Scheduler:');
    console.log('   npm start         # Start the daily scheduler');
    
    console.log('\n3. Production Deployment:');
    console.log('   - Linux: Use the systemd service file');
    console.log('   - Windows: Use Task Scheduler with the batch file');
    console.log('   - Cloud: Deploy as a background service');
    
    console.log('\n📊 Monitoring:');
    console.log('   - Logs are saved to: automation-logs.txt');
    console.log('   - Check admin panel for new pending questions');
    console.log('   - Questions are generated daily at 8:00 AM');
    
    console.log('\n🔧 Configuration:');
    console.log('   - Edit .env file to change settings');
    console.log('   - Modify question-generator.js for custom logic');
    console.log('   - Adjust scheduler.js for different timing');
  }

  // Run complete setup
  async runSetup() {
    console.log('🚀 Horror4Ever Trivia Automation Setup');
    console.log('=====================================\n');
    
    // Check environment
    if (!this.checkEnvironment()) {
      console.log('\n❌ Setup incomplete - Please configure environment variables');
      return false;
    }
    
    // Install dependencies
    if (!this.installDependencies()) {
      console.log('\n❌ Setup incomplete - Failed to install dependencies');
      return false;
    }
    
    // Create log directory
    this.createLogDirectory();
    
    // Test database connection
    if (!(await this.testDatabaseConnection())) {
      console.log('\n❌ Setup incomplete - Database connection failed');
      return false;
    }
    
    // Test question generation
    if (!(await this.testQuestionGeneration())) {
      console.log('\n❌ Setup incomplete - Question generation failed');
      return false;
    }
    
    // Create deployment files
    this.createSystemdService();
    this.createWindowsTask();
    
    // Show usage instructions
    this.showUsageInstructions();
    
    console.log('\n✅ Setup completed successfully!');
    return true;
  }
}

// Run setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new AutomationSetup();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Horror4Ever Trivia Automation Setup');
    console.log('Usage: node setup.js [options]');
    console.log('\nOptions:');
    console.log('  --help, -h     Show this help message');
    console.log('  --env-only     Only create .env file');
    console.log('  --test-only    Only run tests');
    console.log('  --service      Only create service files');
  } else if (args.includes('--env-only')) {
    setup.createEnvFile();
  } else if (args.includes('--test-only')) {
    setup.checkEnvironment();
    setup.testDatabaseConnection();
    setup.testQuestionGeneration();
  } else if (args.includes('--service')) {
    setup.createSystemdService();
    setup.createWindowsTask();
  } else {
    setup.runSetup();
  }
}

export default AutomationSetup; 
#!/usr/bin/env node

// Simple Setup script for Horror4Ever Trivia Automation
// This script helps configure and start the daily question generation system

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
    
    // Show usage instructions
    this.showUsageInstructions();
    
    console.log('\n✅ Setup completed successfully!');
    return true;
  }
}

// Run setup
const setup = new AutomationSetup();
setup.runSetup().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
}); 
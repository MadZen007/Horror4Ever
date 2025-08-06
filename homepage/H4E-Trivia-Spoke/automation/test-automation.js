#!/usr/bin/env node

// Test script for Horror4Ever Trivia Automation
// This script tests all components of the automation system

import QuestionGenerator from './question-generator.js';
import QuestionScheduler from './scheduler.js';
import fs from 'fs';
import path from 'path';

class AutomationTester {
  constructor() {
    this.testResults = [];
    this.logFile = path.join(process.cwd(), 'test-results.txt');
  }

  // Log test results
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
    
    console.log(logMessage.trim());
    fs.appendFileSync(this.logFile, logMessage);
    
    this.testResults.push({ message, type, timestamp });
  }

  // Test database connection
  async testDatabaseConnection() {
    this.log('Testing database connection...');
    
    try {
      const { Pool } = await import('pg');
      
      const pool = new Pool({
        connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
        ssl: {
          rejectUnauthorized: false
        }
      });
      
      const result = await pool.query('SELECT COUNT(*) FROM trivia_questions');
      const count = parseInt(result.rows[0].count);
      
      await pool.end();
      
      if (count >= 0) {
        this.log(`✅ Database connection successful - Found ${count} questions`, 'success');
        return true;
      } else {
        this.log('❌ Database query returned invalid result', 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Database connection failed: ${error.message}`, 'error');
      return false;
    }
  }

  // Test question generation
  async testQuestionGeneration() {
    this.log('Testing question generation...');
    
    try {
      const generator = new QuestionGenerator();
      
      // Test with a small batch
      const questions = await generator.generateQuestions();
      
      if (questions && questions.length > 0) {
        this.log(`✅ Question generation successful - Generated ${questions.length} questions`, 'success');
        
        // Log sample questions
        questions.slice(0, 3).forEach((q, i) => {
          this.log(`   Sample ${i + 1}: ${q.question.substring(0, 60)}...`, 'info');
        });
        
        return true;
      } else {
        this.log('❌ Question generation returned no questions', 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Question generation failed: ${error.message}`, 'error');
      return false;
    }
  }

  // Test scheduler functionality
  async testScheduler() {
    this.log('Testing scheduler functionality...');
    
    try {
      const scheduler = new QuestionScheduler();
      
      // Test status method
      const status = scheduler.getStatus();
      
      if (status && typeof status.isRunning === 'boolean') {
        this.log('✅ Scheduler status method working', 'success');
        this.log(`   Status: ${JSON.stringify(status)}`, 'info');
        return true;
      } else {
        this.log('❌ Scheduler status method failed', 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Scheduler test failed: ${error.message}`, 'error');
      return false;
    }
  }

  // Test file operations
  testFileOperations() {
    this.log('Testing file operations...');
    
    try {
      // Test log file creation
      const testLogFile = path.join(process.cwd(), 'test-log.txt');
      fs.writeFileSync(testLogFile, 'Test log entry');
      
      if (fs.existsSync(testLogFile)) {
        fs.unlinkSync(testLogFile);
        this.log('✅ File operations working', 'success');
        return true;
      } else {
        this.log('❌ File operations failed', 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ File operations test failed: ${error.message}`, 'error');
      return false;
    }
  }

  // Test environment variables
  testEnvironmentVariables() {
    this.log('Testing environment variables...');
    
    const requiredVars = ['COCKROACHDB_CONNECTION_STRING'];
    const missing = [];
    
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    });
    
    if (missing.length === 0) {
      this.log('✅ All required environment variables are set', 'success');
      return true;
    } else {
      this.log(`❌ Missing environment variables: ${missing.join(', ')}`, 'error');
      return false;
    }
  }

  // Test package.json scripts
  testPackageScripts() {
    this.log('Testing package.json scripts...');
    
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      
      if (fs.existsSync(packagePath)) {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        const requiredScripts = ['start', 'manual', 'status', 'generate'];
        const missingScripts = [];
        
        requiredScripts.forEach(script => {
          if (!packageData.scripts || !packageData.scripts[script]) {
            missingScripts.push(script);
          }
        });
        
        if (missingScripts.length === 0) {
          this.log('✅ All required package.json scripts are present', 'success');
          return true;
        } else {
          this.log(`❌ Missing package.json scripts: ${missingScripts.join(', ')}`, 'error');
          return false;
        }
      } else {
        this.log('❌ package.json not found', 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Package.json test failed: ${error.message}`, 'error');
      return false;
    }
  }

  // Run all tests
  async runAllTests() {
    this.log('🧪 Starting Horror4Ever Trivia Automation Tests');
    this.log('==============================================');
    
    const tests = [
      { name: 'Environment Variables', test: () => this.testEnvironmentVariables() },
      { name: 'Package.json Scripts', test: () => this.testPackageScripts() },
      { name: 'File Operations', test: () => this.testFileOperations() },
      { name: 'Database Connection', test: async () => await this.testDatabaseConnection() },
      { name: 'Question Generation', test: async () => await this.testQuestionGeneration() },
      { name: 'Scheduler Functionality', test: async () => await this.testScheduler() }
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    for (const test of tests) {
      this.log(`\n--- Testing: ${test.name} ---`);
      
      try {
        const result = await test.test();
        if (result) {
          passedTests++;
        }
      } catch (error) {
        this.log(`❌ Test failed with exception: ${error.message}`, 'error');
      }
    }
    
    // Summary
    this.log('\n==============================================');
    this.log(`🧪 Test Summary: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      this.log('🎉 All tests passed! Automation system is ready to use.', 'success');
      this.log('\n📋 Next steps:');
      this.log('   1. Run: npm start (to start the scheduler)');
      this.log('   2. Run: npm run manual (to test generation)');
      this.log('   3. Check your admin panel for new questions');
    } else {
      this.log('⚠️  Some tests failed. Please review the errors above.', 'warning');
      this.log('\n🔧 Troubleshooting:');
      this.log('   1. Check your .env file configuration');
      this.log('   2. Verify database connectivity');
      this.log('   3. Ensure all dependencies are installed');
    }
    
    return passedTests === totalTests;
  }

  // Generate test report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: this.testResults.length,
      passedTests: this.testResults.filter(r => r.type === 'success').length,
      failedTests: this.testResults.filter(r => r.type === 'error').length,
      results: this.testResults
    };
    
    const reportFile = path.join(process.cwd(), 'test-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    this.log(`📊 Test report saved to: ${reportFile}`);
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new AutomationTester();
  
  tester.runAllTests()
    .then(success => {
      tester.generateReport();
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal test error:', error);
      process.exit(1);
    });
}

export default AutomationTester; 
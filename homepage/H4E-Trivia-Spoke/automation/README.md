# Horror4Ever Trivia Automation System

This automation system generates 10 new horror trivia questions daily at 8:00 AM, analyzing your approved questions to create unique variations and adding them to the pending list for your review.

## 🎯 Features

- **Daily Automation**: Runs automatically every day at 8:00 AM
- **Smart Generation**: Analyzes existing approved questions to avoid duplicates
- **Multiple Question Types**: Generates questions about movie years, directors, locations, characters, and more
- **Database Integration**: Works with your existing CockroachDB trivia database
- **Comprehensive Logging**: Tracks all generation activities
- **Easy Management**: Simple commands for manual execution and monitoring

## 📁 File Structure

```
automation/
├── question-generator.js    # Main question generation logic
├── scheduler.js             # Cron job scheduler
├── setup.js                 # Setup and configuration script
├── package.json             # Dependencies and scripts
├── README.md               # This file
└── logs/                   # Log files (created automatically)
```

## 🚀 Quick Start

### 1. Navigate to the automation directory

```bash
cd homepage/H4E-Trivia-Spoke/automation
```

### 2. Run the setup script

```bash
node setup.js
```

This will:
- Check your environment configuration
- Install required dependencies
- Test database connection
- Test question generation
- Create deployment files

### 3. Configure your database connection

Edit the `.env` file created by the setup script:

```env
COCKROACHDB_CONNECTION_STRING=postgresql://your_username:your_password@your_host:26257/your_database?sslmode=require
```

### 4. Start the automation

```bash
npm start
```

## 📋 Usage Commands

### Manual Execution

```bash
# Generate questions once (for testing)
npm run manual

# Check scheduler status
npm run status

# Run generator directly
npm run generate
```

### Start the Scheduler

```bash
# Start daily automation (runs at 8:00 AM)
npm start
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the automation directory:

```env
# Required: Database connection
COCKROACHDB_CONNECTION_STRING=postgresql://username:password@host:26257/database?sslmode=require

# Optional: Customize settings
GENERATION_TIME=08:00
TIMEZONE=America/New_York
QUESTIONS_PER_DAY=10
LOG_LEVEL=info
```

### Customizing Question Generation

Edit `question-generator.js` to modify:

- **Question Types**: Add new templates in `initializeTemplates()`
- **Movie Database**: Expand the `horrorMovies` array
- **Generation Logic**: Modify `createQuestionFromTemplate()`
- **Uniqueness Rules**: Adjust `isQuestionUnique()`

### Changing Schedule

Edit `scheduler.js` to modify the cron expression:

```javascript
// Current: Daily at 8:00 AM
const cronExpression = '0 8 * * *';

// Examples:
// '0 */6 * * *'     // Every 6 hours
// '0 8,20 * * *'    // 8 AM and 8 PM daily
// '0 8 * * 1-5'     // Weekdays at 8 AM
```

## 🖥️ Production Deployment

### Linux (systemd)

1. Copy the service file:
```bash
sudo cp horror4ever-trivia.service /etc/systemd/system/
```

2. Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable horror4ever-trivia
sudo systemctl start horror4ever-trivia
```

3. Check status:
```bash
sudo systemctl status horror4ever-trivia
```

### Windows (Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. Configure:
   - **Name**: Horror4Ever Trivia Generator
   - **Trigger**: Daily at 8:00 AM
   - **Action**: Start a program
   - **Program**: `start-automation.bat`

### Cloud Deployment

For cloud platforms (Vercel, Netlify, etc.), deploy as a background service:

```bash
# Install dependencies
npm install

# Set environment variables in your cloud platform
# Start the scheduler
npm start
```

## 📊 Monitoring

### Logs

- **Location**: `automation-logs.txt` in the automation directory
- **Format**: Timestamped entries with detailed information
- **Content**: Generation results, errors, and system status

### Admin Panel

- Check the **Pending Review** tab in your trivia admin panel
- New questions will appear with `ai_generated: true` flag
- Review and approve/reject generated questions

### Status Commands

```bash
# Check if scheduler is running
npm run status

# View recent logs
tail -f automation-logs.txt

# Check database for new questions
# (Use your admin panel or database client)
```

## 🔍 Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify your `COCKROACHDB_CONNECTION_STRING`
- Check network connectivity
- Ensure database is accessible

**No Questions Generated**
- Check if approved questions exist in database
- Verify question generation logic
- Review logs for specific errors

**Scheduler Not Running**
- Check if cron is installed and running
- Verify timezone settings
- Check system permissions

### Debug Mode

Run with verbose logging:

```bash
LOG_LEVEL=debug npm start
```

### Manual Testing

Test individual components:

```bash
# Test database connection only
node setup.js --test-only

# Test question generation only
npm run generate
```

## 🎨 Customization

### Adding New Question Types

1. Add template in `initializeTemplates()`:
```javascript
newType: {
  pattern: "Your question pattern here",
  difficulty: 2,
  category: 'horror'
}
```

2. Add generation logic in `createQuestionFromTemplate()`:
```javascript
case 'newType':
  question = `Your question text`;
  options = this.generateNewTypeOptions();
  correctAnswer = 'correct answer';
  explanation = 'explanation text';
  break;
```

3. Create option generation method:
```javascript
generateNewTypeOptions() {
  // Your option generation logic
}
```

### Expanding Movie Database

Add more movies to the `horrorMovies` array:

```javascript
{
  title: "Movie Title",
  year: 2024,
  director: "Director Name",
  location: "Setting Location"
}
```

## 📈 Performance

- **Generation Time**: ~30-60 seconds for 10 questions
- **Database Load**: Minimal (reads 50 approved questions, writes 10 new)
- **Memory Usage**: ~50MB during generation
- **Storage**: Logs grow ~1KB per day

## 🔒 Security

- Database credentials stored in environment variables
- No sensitive data in logs
- Read-only access to approved questions
- Write access only to new pending questions

## 📞 Support

For issues or questions:

1. Check the logs: `automation-logs.txt`
2. Review this README
3. Test individual components
4. Check database connectivity

## 🎯 Next Steps

After setup:

1. **Test the system**: Run `npm run manual` to generate test questions
2. **Review questions**: Check your admin panel for new pending questions
3. **Approve/reject**: Use the admin interface to manage generated questions
4. **Monitor**: Check logs regularly to ensure smooth operation
5. **Customize**: Modify generation logic based on your needs

---

**Happy automating! 🎃👻💀** 
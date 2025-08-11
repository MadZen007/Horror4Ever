# H4E Movie Research & Analysis System

## Overview
This system is designed for **research purposes only**, focusing on collecting and analyzing horror movie metadata to understand genre patterns, audience preferences, and cinematic trends. The system operates within TMDb's non-commercial API terms and is built for academic and research applications.

## Research Objectives
- **Data Collection**: Gather comprehensive horror movie metadata for research analysis
- **Pattern Analysis**: Identify trends in horror subgenres, release patterns, and audience reception
- **Preference Mapping**: Study user preference patterns for research insights
- **Metadata Enrichment**: Build a research database of horror film characteristics
- **Academic Research**: Support horror film studies and genre analysis

## Architecture

### Frontend (Research Interface)
- **Technology**: Next.js for performant research data visualization
- **Purpose**: Display research findings and allow researchers to interact with collected data
- **Features**: 
  - Research dashboard with data visualizations
  - Preference collection for research studies
  - Movie metadata display for analysis
  - Research analytics and insights

### Backend (Data Processing)
- **Technology**: Node.js with Express.js
- **Purpose**: Handle research data collection and processing
- **Features**:
  - TMDb API integration for metadata collection
  - Research data storage and retrieval
  - Batch processing for large datasets
  - Data validation and quality control

### Database (Research Repository)
- **Technology**: CockroachDB
- **Purpose**: Store research data with high consistency and scalability
- **Schema**: Optimized for research queries and data analysis

### Data Pipeline (Cursor)
- **Technology**: Cursor for data orchestration
- **Purpose**: Transform, cleanse, and enrich research data
- **Features**:
  - Data lineage tracking
  - Quality assurance pipelines
  - Research data validation
  - Automated data enrichment

### Asynchronous Processing (Resend)
- **Technology**: Resend for queue management
- **Purpose**: Handle batch data imports and research processing
- **Features**:
  - Asynchronous data collection
  - Research survey distribution
  - Batch processing for large datasets

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory:
```bash
# Database
COCKROACHDB_CONNECTION_STRING=your_cockroachdb_connection_string

# TMDb API (Research Use Only)
TMDB_API_KEY=your_tmdb_api_key

# Resend (for research communications)
RESEND_API_KEY=your_resend_api_key

# Research Configuration
RESEARCH_MODE=true
DATA_COLLECTION_LIMIT=1000
```

### 2. Database Setup
Run the database setup script to create research tables:
```bash
node api/setup-database.js
```

### 3. API Integration
Add the research API routes to your main server:
```javascript
// In server.js
app.use('/api/research/movies', require('./H4E-Movie-Database-Spoke/api/routes'));
```

### 4. TMDb API Key
- Visit https://www.themoviedb.org/settings/api
- Request an API key for **research purposes only**
- Clearly state your research objectives in the application

## File Structure
```
H4E-Movie-Database-Spoke/
├── public/
│   ├── index.html          # Research interface
│   └── style.css           # Research UI styling
├── src/
│   └── recommendations.js  # Research data handling
├── api/
│   ├── recommendations.js  # Research API logic
│   ├── routes.js           # Research API routes
│   └── setup-database.js   # Research database schema
└── README.md               # This file
```

## Research Workflow

### 1. Data Collection Phase
- Users provide research preferences (subgenre, mood, timeframe)
- System collects movie metadata from TMDb
- Data is stored with research identifiers
- Quality checks are performed on collected data

### 2. Analysis Phase
- Research data is processed through Cursor pipelines
- Patterns and trends are identified
- Statistical analysis is performed
- Research insights are generated

### 3. Reporting Phase
- Research findings are displayed in the interface
- Data visualizations show trends and patterns
- Research reports are generated
- Academic insights are documented

## API Endpoints (Research Focus)

### GET /api/research/movies/get
- **Purpose**: Retrieve research movie data
- **Parameters**: Research preferences and filters
- **Response**: Research-grade movie metadata

### GET /api/research/movies/details/:id
- **Purpose**: Get detailed research data for a specific movie
- **Response**: Comprehensive movie metadata for analysis

### POST /api/research/movies/track
- **Purpose**: Track research interactions for analysis
- **Data**: Research participant behavior patterns

### GET /api/research/analytics
- **Purpose**: Retrieve research analytics and insights
- **Response**: Statistical analysis and trend data

## Research Data Schema

### movie_research_data
- `id`: Primary key
- `tmdb_id`: TMDb movie identifier
- `title`: Movie title
- `overview`: Research description
- `release_date`: Release date for temporal analysis
- `vote_average`: Audience rating for research
- `vote_count`: Sample size for statistical validity
- `genre_ids`: Genre classification for research
- `keywords`: Research keywords and themes
- `research_metadata`: Additional research data
- `created_at`: Data collection timestamp

### research_participants
- `id`: Participant identifier
- `session_id`: Research session tracking
- `preferences`: Research preference data
- `interactions`: Research interaction patterns
- `created_at`: Participation timestamp

### research_analytics
- `id`: Analytics record identifier
- `metric_name`: Research metric being tracked
- `metric_value`: Quantitative research data
- `sample_size`: Statistical sample size
- `confidence_interval`: Statistical confidence
- `analysis_date`: Analysis timestamp

## Research Compliance

### TMDb API Compliance
- **Usage**: Research and academic purposes only
- **Rate Limiting**: Strict adherence to API limits
- **Data Attribution**: Proper attribution to TMDb
- **Non-Commercial**: No commercial use of collected data

### Data Privacy
- **Anonymization**: All participant data is anonymized
- **Consent**: Clear research consent procedures
- **Retention**: Research data retention policies
- **Security**: Secure storage of research data

### Research Ethics
- **Transparency**: Clear research objectives
- **Consent**: Informed consent for research participation
- **Benefit**: Research benefits clearly communicated
- **Harm Prevention**: Minimize potential research harm

## Customization Options

### Research Parameters
- **Data Collection Scope**: Adjust research data collection parameters
- **Analysis Depth**: Configure analysis complexity
- **Reporting Frequency**: Set research reporting intervals
- **Quality Thresholds**: Define data quality standards

### Research Interface
- **Dashboard Layout**: Customize research dashboard
- **Data Visualizations**: Configure research charts and graphs
- **Export Formats**: Set research data export options
- **Access Controls**: Define research access permissions

## Analytics and Research Insights

### Data Collection Metrics
- **Research Participation**: Track research participant engagement
- **Data Quality**: Monitor research data quality metrics
- **Collection Efficiency**: Measure data collection performance
- **Error Rates**: Track research data collection errors

### Research Analytics
- **Genre Trends**: Analyze horror subgenre popularity
- **Temporal Patterns**: Study release date patterns
- **Audience Preferences**: Research viewer preference patterns
- **Quality Correlations**: Analyze rating and popularity relationships

### Research Reporting
- **Automated Reports**: Generate research insights automatically
- **Trend Analysis**: Identify emerging horror trends
- **Statistical Significance**: Calculate research statistical validity
- **Academic Citations**: Generate research citations and references

## Security Considerations

### Research Data Protection
- **Encryption**: Encrypt research data at rest and in transit
- **Access Controls**: Implement research data access controls
- **Audit Logging**: Log all research data access
- **Backup Procedures**: Secure research data backup procedures

### API Security
- **Rate Limiting**: Implement research-appropriate rate limits
- **Authentication**: Secure research API access
- **Input Validation**: Validate all research data inputs
- **Error Handling**: Secure error handling for research data

## Future Research Enhancements

### Advanced Analytics
- **Machine Learning**: Implement ML for research pattern recognition
- **Predictive Modeling**: Develop research prediction models
- **Sentiment Analysis**: Analyze research participant sentiment
- **Network Analysis**: Study horror movie influence networks

### Research Collaboration
- **Multi-Institution**: Support collaborative research projects
- **Data Sharing**: Enable secure research data sharing
- **Peer Review**: Implement research peer review processes
- **Publication Support**: Generate research publication materials

## Troubleshooting

### Common Research Issues
- **Data Collection Errors**: Check TMDb API status and rate limits
- **Database Connection**: Verify CockroachDB connection settings
- **Research Data Quality**: Monitor data quality metrics
- **Performance Issues**: Optimize research query performance

### Research Support
- **Documentation**: Comprehensive research documentation
- **Logging**: Detailed research operation logging
- **Monitoring**: Real-time research system monitoring
- **Backup Procedures**: Research data backup and recovery

## Research Citation
When using this system for research, please cite:
- TMDb API for movie metadata
- This research system for data collection methodology
- Relevant academic sources for research methodology

---

**Note**: This system is designed for research and academic purposes only. All data collection and analysis must comply with applicable research ethics guidelines and institutional review board requirements.

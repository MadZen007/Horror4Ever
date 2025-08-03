// Articles JavaScript Logic

// Load articles from API
async function loadArticles() {
  const loadingState = document.getElementById('loadingState');
  const articlesGrid = document.getElementById('articlesGrid');
  const emptyState = document.getElementById('emptyState');
  const errorState = document.getElementById('errorState');

  // Show loading state
  loadingState.style.display = 'flex';
  articlesGrid.style.display = 'none';
  emptyState.style.display = 'none';
  errorState.style.display = 'none';

  try {
    const response = await fetch('/api/articles');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const articles = await response.json();
    
    // Hide loading state
    loadingState.style.display = 'none';
    
    if (articles.length === 0) {
      // Show empty state
      emptyState.style.display = 'flex';
    } else {
      // Display articles
      displayArticles(articles);
      articlesGrid.style.display = 'grid';
    }
    
  } catch (error) {
    console.error('Error loading articles:', error);
    
    // Hide loading state
    loadingState.style.display = 'none';
    
    // Show error state
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = error.message || 'Failed to load articles. Please try again.';
    errorState.style.display = 'flex';
  }
}

// Display articles in the grid
function displayArticles(articles) {
  const articlesGrid = document.getElementById('articlesGrid');
  
  // Clear existing content
  articlesGrid.innerHTML = '';
  
  // Create article cards
  articles.forEach(article => {
    const articleCard = createArticleCard(article);
    articlesGrid.appendChild(articleCard);
  });
}

// Create an individual article card
function createArticleCard(article) {
  const card = document.createElement('div');
  card.className = 'article-card';
  card.onclick = () => openArticle(article.slug);
  
  // Format date
  const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create thumbnail image
  const thumbnail = article.thumbnail 
    ? `<img src="${article.thumbnail}" alt="${article.title}" class="article-thumbnail">`
    : `<div class="article-thumbnail" style="display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-style: italic;">No Image</div>`;
  
  // Create tags HTML
  const tagsHTML = article.tags && article.tags.length > 0
    ? article.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('')
    : '';
  
  card.innerHTML = `
    ${thumbnail}
    <div class="article-content">
      <h3 class="article-title">${article.title}</h3>
      <div class="article-meta">
        <span class="article-author">By ${article.author}</span>
        <span class="article-date">${formattedDate}</span>
      </div>
      <p class="article-summary">${article.summary || 'No summary available.'}</p>
      ${tagsHTML ? `<div class="article-tags">${tagsHTML}</div>` : ''}
      <button class="read-more-button">Read More</button>
    </div>
  `;
  
  return card;
}

// Open article page
function openArticle(slug) {
  // For now, we'll use a simple URL parameter approach
  // Later we can implement proper routing
  window.location.href = `article.html?slug=${encodeURIComponent(slug)}`;
}

// Load specific article by slug
async function loadArticle(slug) {
  try {
    const response = await fetch(`/api/articles?slug=${encodeURIComponent(slug)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Article not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const article = await response.json();
    return article;
    
  } catch (error) {
    console.error('Error loading article:', error);
    throw error;
  }
}

// Format article content (basic markdown support)
function formatArticleContent(content) {
  // Basic markdown formatting
  let formatted = content;
  
  // Headers
  formatted = formatted.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  formatted = formatted.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  formatted = formatted.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold and italic
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Links
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Line breaks
  formatted = formatted.replace(/\n\n/g, '</p><p>');
  formatted = formatted.replace(/\n/g, '<br>');
  
  // Wrap in paragraphs
  formatted = `<p>${formatted}</p>`;
  
  return formatted;
}

// Utility function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Export functions for use in other files
window.ArticlesModule = {
  loadArticles,
  loadArticle,
  displayArticles,
  createArticleCard,
  openArticle,
  formatArticleContent,
  generateSlug
}; 
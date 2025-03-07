import { fetchFromApi } from '../utils/api.js';

/**
 * Fetch and display news
 */
export async function loadNews() {
  const newsContainer = document.getElementById('news-container');
  
  try {
    const news = await fetchFromApi('/api/news');
    
    if (news.length === 0) {
      newsContainer.innerHTML = '<p>No news available at the moment.</p>';
      return;
    }
    
    newsContainer.innerHTML = '';
    newsContainer.classList.remove('loading');
    
    news.forEach(article => {
      const date = new Date(article.publishedAt);
      const formattedDate = date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      
      const card = document.createElement('div');
      card.className = 'news-card';
      
      card.innerHTML = `
        <h3>${article.title}</h3>
        <p class="news-source">Source: ${article.source.name}</p>
        <p class="news-date">${formattedDate}</p>
        ${article.urlToImage ? `<img class="news-image" src="${article.urlToImage}" alt="${article.title}">` : ''}
        <p>${article.description || ''}</p>
        <a href="${article.url}" target="_blank" class="read-more">Read more</a>
      `;
      
      newsContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading news:', error);
    newsContainer.innerHTML = '<p>Failed to load news. Please try again later.</p>';
    newsContainer.classList.remove('loading');
  }
} 
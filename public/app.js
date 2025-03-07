document.addEventListener('DOMContentLoaded', () => {
  // Initialize tabs
  initTabs();
  
  // Fetch data
  fetchNews();
  fetchMatches();
});

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all tabs
      tabBtns.forEach(tab => tab.classList.remove('active'));
      
      // Add active class to clicked tab
      btn.classList.add('active');
      
      // Hide all tab content
      const tabContents = document.querySelectorAll('.tab-content');
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Show the corresponding tab content
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

async function fetchNews() {
  const newsContainer = document.getElementById('news-container');
  
  try {
    const response = await fetch('/api/news');
    const news = await response.json();
    
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
    console.error('Error fetching news:', error);
    newsContainer.innerHTML = '<p>Failed to load news. Please try again later.</p>';
    newsContainer.classList.remove('loading');
  }
}

async function fetchMatches() {
  const matchesContainer = document.getElementById('matches-container');
  
  try {
    const response = await fetch('/api/matches');
    const data = await response.json();
    
    if (!data || data.length === 0) {
      matchesContainer.innerHTML = '<p>No matches available at the moment.</p>';
      return;
    }
    
    matchesContainer.innerHTML = '';
    matchesContainer.classList.remove('loading');
    
    data.forEach(match => {
      const matchDate = new Date(match.utcDate);
      const formattedDate = matchDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const isLiverpool = match.homeTeam.id === 64 || match.awayTeam.id === 64;
      
      if (isLiverpool) {
        const card = document.createElement('div');
        card.className = 'match-card';
        
        // Determine match status
        let statusDisplay = '';
        switch (match.status) {
          case 'SCHEDULED':
            statusDisplay = 'Upcoming';
            break;
          case 'LIVE':
          case 'IN_PLAY':
            statusDisplay = 'LIVE';
            break;
          case 'PAUSED':
            statusDisplay = 'Half-time';
            break;
          case 'FINISHED':
            statusDisplay = 'Full-time';
            break;
          default:
            statusDisplay = match.status;
        }
        
        card.innerHTML = `
          <div class="match-status">${statusDisplay}</div>
          <div class="match-teams">
            <div class="team">
              <span>${match.homeTeam.name}</span>
            </div>
            <div class="score">
              ${match.status === 'SCHEDULED' ? 'vs' : `${match.score.fullTime.home ?? 0} - ${match.score.fullTime.away ?? 0}`}
            </div>
            <div class="team">
              <span>${match.awayTeam.name}</span>
            </div>
          </div>
          <div class="match-date">${formattedDate}</div>
        `;
        
        matchesContainer.appendChild(card);
      }
    });
    
    if (matchesContainer.children.length === 0) {
      matchesContainer.innerHTML = '<p>No Liverpool matches found.</p>';
    }
  } catch (error) {
    console.error('Error fetching matches:', error);
    matchesContainer.innerHTML = '<p>Failed to load matches. Please try again later.</p>';
    matchesContainer.classList.remove('loading');
  }
} 
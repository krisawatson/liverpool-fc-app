import { fetchFromApi } from '../utils/api.js';

/**
 * Fetch and display matches
 */
export async function loadMatches() {
  const matchesContainer = document.getElementById('matches-container');
  
  try {
    const data = await fetchFromApi('/api/matches');
    
    if (!data || data.length === 0) {
      matchesContainer.innerHTML = '<p>No matches available at the moment.</p>';
      return;
    }
    
    matchesContainer.innerHTML = '';
    matchesContainer.classList.remove('loading');
    
    // Group matches by month
    const groupedMatches = data.reduce((acc, match) => {
      const date = new Date(match.utcDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      if (match.homeTeam.id === 64 || match.awayTeam.id === 64) {
        acc[monthKey].push(match);
      }
      return acc;
    }, {});

    // Get sorted month keys
    const monthKeys = Object.keys(groupedMatches)
      .filter(key => groupedMatches[key].length > 0)
      .sort();

    // Create improved month navigation
    const nav = document.createElement('nav');
    nav.className = 'months-nav';
    
    // Previous month button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'month-nav-btn prev';
    prevBtn.innerHTML = '&larr;';
    prevBtn.setAttribute('aria-label', 'Previous month');
    nav.appendChild(prevBtn);
    
    // Current month display
    const currentMonthDisplay = document.createElement('span');
    currentMonthDisplay.className = 'current-month';
    nav.appendChild(currentMonthDisplay);
    
    // Next month button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'month-nav-btn next';
    nextBtn.innerHTML = '&rarr;';
    nextBtn.setAttribute('aria-label', 'Next month');
    nav.appendChild(nextBtn);
    
    matchesContainer.appendChild(nav);

    // Create container for month sections
    const monthsContainer = document.createElement('div');
    monthsContainer.className = 'months-container';
    matchesContainer.appendChild(monthsContainer);

    // Create sections for each month
    monthKeys.forEach(monthKey => {
      const monthSection = document.createElement('section');
      monthSection.className = 'month-section';
      monthSection.dataset.monthKey = monthKey;
      
      const [year, month] = monthKey.split('-');
      const date = new Date(year, month - 1);
      const monthHeader = document.createElement('h2');
      monthHeader.className = 'month-header';
      monthHeader.textContent = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      monthSection.appendChild(monthHeader);

      groupedMatches[monthKey].forEach(match => {
        const matchDate = new Date(match.utcDate);
        const formattedDate = matchDate.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        renderMatchCard(match, formattedDate, monthSection);
      });

      monthsContainer.appendChild(monthSection);
    });

    // Navigation state management
    let currentMonthIndex = 0;
    
    // Find index of current month or default to first month
    const currentDate = new Date();
    const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const foundIndex = monthKeys.indexOf(currentMonthKey);
    if (foundIndex !== -1) {
      currentMonthIndex = foundIndex;
    }

    // Navigation functions
    function updateMonthDisplay() {
      const monthKey = monthKeys[currentMonthIndex];
      const [year, month] = monthKey.split('-');
      const date = new Date(year, month - 1);
      currentMonthDisplay.textContent = date.toLocaleDateString('en-GB', { 
        month: 'long',
        year: 'numeric'
      });
      
      // Update button states
      prevBtn.disabled = currentMonthIndex === 0;
      nextBtn.disabled = currentMonthIndex === monthKeys.length - 1;
      
      showMonth(monthKey);
    }

    prevBtn.addEventListener('click', () => {
      if (currentMonthIndex > 0) {
        currentMonthIndex--;
        updateMonthDisplay();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentMonthIndex < monthKeys.length - 1) {
        currentMonthIndex++;
        updateMonthDisplay();
      }
    });

    // Initial display
    updateMonthDisplay();

  } catch (error) {
    console.error('Error loading matches:', error);
    matchesContainer.innerHTML = '<p>Failed to load matches. Please try again later.</p>';
    matchesContainer.classList.remove('loading');
  }
}

/**
 * Show matches for the selected month
 * @param {string} monthKey - Month key in YYYY-MM format
 */
function showMonth(monthKey) {
  // Update active button
  const buttons = document.querySelectorAll('.months-nav button');
  buttons.forEach(button => {
    button.classList.toggle('active', button.dataset.monthKey === monthKey);
  });

  // Show selected month section, hide others
  const sections = document.querySelectorAll('.month-section');
  sections.forEach(section => {
    section.classList.toggle('active', section.dataset.monthKey === monthKey);
  });
}

/**
 * Render a match card
 * @param {Object} match - Match data
 * @param {string} formattedDate - Formatted date string
 * @param {HTMLElement} container - Container to append card to
 */
function renderMatchCard(match, formattedDate, container) {
  const matchCard = document.createElement('div');
  matchCard.className = 'match-card';
  matchCard.dataset.status = match.status;

  let scoreDisplay;
  let halftimeDisplay = '';
  
  if (['SCHEDULED', 'TIMED'].includes(match.status)) {
    scoreDisplay = 'vs';
  } else {
    scoreDisplay = `${match.score.fullTime.home ?? 0}-${match.score.fullTime.away ?? 0}`;
    // Add halftime score if the match has been played
    if (match.score.halfTime) {
      halftimeDisplay = `<div class="halftime-score">(HT ${match.score.halfTime.home}-${match.score.halfTime.away})</div>`;
    }
  }

  matchCard.innerHTML = `
    <div class="match-date">${formattedDate}</div>
    <div class="match-teams">
      <div class="team-info ${match.homeTeam.id === 64 ? 'liverpool' : ''}">
        <span class="team-name">${match.homeTeam.shortName || match.homeTeam.name}</span>
        <img class="team-badge" src="${match.homeTeam.crest}" alt="${match.homeTeam.shortName || match.homeTeam.name} badge" />
      </div>
      <div class="score-container">
        <div class="score">${scoreDisplay}</div>
        ${halftimeDisplay}
      </div>
      <div class="team-info ${match.awayTeam.id === 64 ? 'liverpool' : ''}">
        <img class="team-badge" src="${match.awayTeam.crest}" alt="${match.awayTeam.shortName || match.awayTeam.name} badge" />
        <span class="team-name">${match.awayTeam.shortName || match.awayTeam.name}</span>
      </div>
    </div>
    ${match.venue ? `<div class="match-venue">${match.venue}</div>` : ''}
  `;

  // Add error handling for badge images
  matchCard.querySelectorAll('.team-badge').forEach(img => {
    img.onerror = function() {
      this.style.display = 'none';
    };
  });

  container.appendChild(matchCard);
}

/**
 * Get display text for match status
 * @param {string} status - API status value
 * @returns {string} - Human-readable status
 */
function getMatchStatusDisplay(status) {
  switch (status) {
    case 'SCHEDULED':
      return 'Upcoming';
    case 'LIVE':
    case 'IN_PLAY':
      return 'LIVE';
    case 'PAUSED':
      return 'Half-time';
    case 'FINISHED':
      return 'Full-time';
    default:
      return status;
  }
}

/**
 * Get team badge URL based on team ID
 * @param {number} teamId - Team ID
 * @param {string} teamName - Team name for fallback
 * @returns {string} - URL to team badge
 */
function getTeamBadgeUrl(teamId, teamName) {
  // Known team IDs - could be expanded
  const knownTeams = {
    64: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/800px-Liverpool_FC.svg.png', // Liverpool
    65: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/800px-Manchester_City_FC_badge.svg.png', // Man City
    66: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/800px-Manchester_United_FC_crest.svg.png', // Man United
    57: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Arsenal_FC.svg/800px-Arsenal_FC.svg.png', // Arsenal
    61: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Chelsea_FC.svg/800px-Chelsea_FC.svg.png', // Chelsea
    73: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/800px-Tottenham_Hotspur.svg.png', // Tottenham
  };
  
  // Return known team badge or fallback
  return knownTeams[teamId] || `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=random&color=fff&size=128`;
}

function showMatchDetails(match, formattedDate) {
  const modal = document.createElement('div');
  modal.className = 'match-modal';
  
  // Format score display
  let scoreDisplay;
  if (['SCHEDULED', 'TIMED'].includes(match.status)) {
    scoreDisplay = 'vs';
  } else {
    scoreDisplay = `${match.score.fullTime.home ?? 0}-${match.score.fullTime.away ?? 0}`;
  }

  // Get match events (goals, cards)
  const goals = match.goals || [];
  const cards = match.cards || [];
  
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close">&times;</button>
      
      <div class="modal-header">
        <div class="match-date">${formattedDate}</div>
        <div class="match-status">${match.status.replace(/_/g, ' ')}</div>
      </div>

      <div class="match-teams-detail">
        <div class="team-info ${match.homeTeam.id === 64 ? 'liverpool' : ''}">
          <img class="team-badge" src="${match.homeTeam.crest}" alt="${match.homeTeam.name}" />
          <span class="team-name">${match.homeTeam.name}</span>
        </div>
        <div class="match-score">${scoreDisplay}</div>
        <div class="team-info ${match.awayTeam.id === 64 ? 'liverpool' : ''}">
          <img class="team-badge" src="${match.awayTeam.crest}" alt="${match.awayTeam.name}" />
          <span class="team-name">${match.awayTeam.name}</span>
        </div>
      </div>

      ${match.venue ? `
        <div class="match-venue-detail">
          <i class="fas fa-map-marker-alt"></i> ${match.venue}
        </div>
      ` : ''}

      <div class="match-events">
        ${goals.length > 0 ? `
          <div class="events-section">
            <h3>Goals</h3>
            <ul class="events-list">
              ${goals.map(goal => `
                <li>
                  <span class="event-time">${goal.minute}'</span>
                  <span class="event-player">${goal.scorer.name}</span>
                  ${goal.assist ? `
                    <span class="event-assist">(assist: ${goal.assist.name})</span>
                  ` : ''}
                  <span class="event-team">${goal.team.shortName || goal.team.name}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        ${cards.length > 0 ? `
          <div class="events-section">
            <h3>Cards</h3>
            <ul class="events-list">
              ${cards.map(card => `
                <li>
                  <span class="event-time">${card.minute}'</span>
                  <span class="card-indicator ${card.card.toLowerCase()}"></span>
                  <span class="event-player">${card.player.name}</span>
                  <span class="event-team">${card.team.shortName || card.team.name}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Close button handler
  const closeButton = modal.querySelector('.modal-close');
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    modal.remove();
  });

  // Close on click outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  document.body.appendChild(modal);
} 
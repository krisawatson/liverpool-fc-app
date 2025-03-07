const axios = require('axios');
const config = require('../config/config');

// Add cache variables at the top of the file
let matchesCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

exports.getMatches = async () => {
  try {
    // Check if we have valid cached data
    if (matchesCache && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
      return matchesCache.allMatches;
    }

    // If no cache or expired, fetch new data
    const today = new Date();
    const currentYear = today.getFullYear();
    const seasonStart = new Date(currentYear, 7, 1); // August 1st
    const seasonEnd = new Date(currentYear + 1, 4, 31); // May 31st
    
    // If we're in June/July, use next season's dates
    if (today.getMonth() < 7) { // Before August
      seasonStart.setFullYear(currentYear - 1);
      seasonEnd.setFullYear(currentYear);
    }
    
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    // Adjust API call to use season dates
    const response = await axios.get('https://api.football-data.org/v4/teams/64/matches', {
      headers: {
        'X-Auth-Token': config.footballApiKey
      },
      params: {
        status: 'SCHEDULED,LIVE,IN_PLAY,PAUSED,FINISHED',
        dateFrom: formatDate(seasonStart),
        dateTo: formatDate(seasonEnd)
      }
    });
    
    // Group matches by month but also maintain a flat array
    const groupedMatches = response.data.matches.reduce((acc, match) => {
      const matchDate = new Date(match.utcDate);
      const monthKey = `${matchDate.getFullYear()}-${String(matchDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc.byMonth[monthKey]) {
        acc.byMonth[monthKey] = [];
      }
      
      const matchWithVenue = {
        ...match,
        venue: getVenueForTeam(match.homeTeam.id)
      };
      
      acc.byMonth[monthKey].push(matchWithVenue);
      acc.allMatches.push(matchWithVenue);
      
      return acc;
    }, { byMonth: {}, allMatches: [] });
    
    // Update cache
    matchesCache = groupedMatches;
    lastFetchTime = Date.now();
    
    return groupedMatches.allMatches;
  } catch (error) {
    // If there's an error but we have cached data, return it
    if (matchesCache) {
      console.warn('Error fetching fresh matches data, using cached data:', error);
      return matchesCache.allMatches;
    }
    
    // Otherwise throw the error
    console.error('Error fetching matches:', error);
    throw new Error('Failed to fetch matches');
  }
};

/**
 * Helper function to get venue for common teams
 * @param {number} teamId - Team ID
 * @returns {string|null} - Venue name or null if unknown
 */
function getVenueForTeam(teamId) {
  const venues = {
    64: 'Anfield, Liverpool',
    65: 'Etihad Stadium, Manchester',
    66: 'Old Trafford, Manchester',
    57: 'Emirates Stadium, London',
    61: 'Stamford Bridge, London',
    73: 'Tottenham Hotspur Stadium, London',
    63: 'Goodison Park, Liverpool',
    351: 'Villa Park, Birmingham',
    67: 'St James\' Park, Newcastle',
    76: 'Molineux Stadium, Wolverhampton',
    62: 'Selhurst Park, London',
    563: 'London Stadium, London',
    397: 'Amex Stadium, Brighton',
    402: 'Brentford Community Stadium, London',
    341: 'Elland Road, Leeds',
    338: 'King Power Stadium, Leicester',
    346: 'City Ground, Nottingham',
    356: 'St Mary\'s Stadium, Southampton',
    328: 'Turf Moor, Burnley',
    389: 'Craven Cottage, London',
    715: 'Kenilworth Road, Luton',
    1044: 'Bramall Lane, Sheffield'
  };
  
  return venues[teamId] || null;
} 
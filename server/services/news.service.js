const axios = require('axios');
const config = require('../config/config');

// Add cache variables
let newsCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

exports.getLatestNews = async () => {
  try {
    // Check cache first
    if (newsCache && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
      return newsCache;
    }

    const response = await axios.get('https://newsapi.org/v2/everything', {
      headers: {
        'X-Api-Key': config.newsApiKey
      },
      params: {
        q: 'Liverpool FC',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10
      }
    });

    // Cache the filtered news
    newsCache = response.data.articles;
    lastFetchTime = Date.now();

    return newsCache;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw new Error('Failed to fetch news');
  }
}; 
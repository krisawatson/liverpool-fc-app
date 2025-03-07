const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API routes
app.get('/api/news', async (req, res) => {
  try {
    // Using NewsAPI to get Liverpool FC news
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'Liverpool FC',
        language: 'en',
        sortBy: 'publishedAt',
        apiKey: process.env.NEWS_API_KEY
      }
    });
    
    res.json(response.data.articles.slice(0, 10)); // Return top 10 news items
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.get('/api/matches', async (req, res) => {
  try {
    // Using Football-data.org API to get Liverpool matches
    const response = await axios.get('https://api.football-data.org/v4/teams/64/matches', {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_API_KEY
      },
      params: {
        status: 'SCHEDULED,LIVE,IN_PLAY,PAUSED,FINISHED',
        limit: 5
      }
    });
    
    res.json(response.data.matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  newsApiKey: process.env.NEWS_API_KEY,
  footballApiKey: process.env.FOOTBALL_API_KEY
}; 
const express = require('express');
const router = express.Router();
const newsService = require('../services/news.service');

router.get('/', async (req, res) => {
  try {
    const news = await newsService.getLatestNews();
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const matchesService = require('../services/matches.service');

router.get('/', async (req, res) => {
  try {
    const matches = await matchesService.getMatches();
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
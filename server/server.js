const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const newsRoutes = require('./routes/news.routes');
const matchesRoutes = require('./routes/matches.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API routes
app.use('/api/news', newsRoutes);
app.use('/api/matches', matchesRoutes);

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
}); 
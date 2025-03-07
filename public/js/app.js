import { initTabs } from './components/tabs.js';
import { loadNews } from './components/news.js';
import { loadMatches } from './components/matches.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize tabs
  initTabs();
  
  // Load data
  loadNews();
  loadMatches();
}); 
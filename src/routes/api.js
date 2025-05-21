const express = require('express');
const router = express.Router();

// Import individual route files
const authRoutes = require('./auth');
const userRoutes = require('./user');
const chatRoutes = require('./chat');

// Mount the individual routers under specific API paths
router.use('/auth', authRoutes);

// Optional: A simple health check route for the API
router.get('/status', (req, res) => {
  res.status(200).json({ message: 'API is healthy' });
});

module.exports = router;
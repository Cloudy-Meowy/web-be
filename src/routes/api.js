const express = require('express');
const router = express.Router();

// Import individual route files
const authRoutes = require('./auth');
const chatRoutes = require('./chat');

const verifyFirebaseToken = require('../middlewares/authMiddleware');
// Apply the Firebase token verification middleware to all routes
router.use(verifyFirebaseToken);
// Mount the individual routers under specific API paths
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
// Optional: A simple health check route for the API
router.get('/status', (req, res) => {
  res.status(200).json({ message: 'API is healthy' });
});

module.exports = router;
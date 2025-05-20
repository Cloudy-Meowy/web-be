const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for user registration (email and password)
// POST /api/auth/register
router.post('/register', authController.register);

// Route for login using a Firebase ID Token.
// The frontend will send the ID token obtained from ANY Firebase client-side login method
// (email/password, Google, GitHub, etc.) to this endpoint.
// POST /api/auth/login
router.post('/login', authController.loginWithIdToken);

module.exports = router;
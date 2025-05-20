require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import your main API router
const apiRouter = require('./routes/api');

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use your API router for all routes prefixed with /api
app.use('/api', apiRouter);

// Basic root route
app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

module.exports = app; // Export app
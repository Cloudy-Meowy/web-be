const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.put('/profile', userController.updateUser);
router.get('/profile', userController.getUserProfile);

module.exports = router;
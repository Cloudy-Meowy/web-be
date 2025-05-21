const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/new', chatController.createChat);
router.post('/:id', chatController.sendQuestion);
router.get('/:id', chatController.getChat);
router.delete('/:id', chatController.deleteChat);
router.get('/history', chatController.getChatHistory);

module.exports = router;
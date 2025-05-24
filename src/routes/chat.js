const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/new', chatController.createChat);
router.post('/:id', chatController.sendQuestion);
router.get('/history', chatController.getChatHistory);
router.get('/:id', chatController.getChat);
router.delete('/:id', chatController.deleteChat);
module.exports = router;
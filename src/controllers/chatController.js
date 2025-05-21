const Chat = require('../db/schema').Chat;
const Message = require('../db/schema').Message;
const chatbotURL= require('../config/config.js').config.chatbotAPIUrl;
exports.createChat = async (req, res) => {
    const {chatbot_type, query} = req.body;

    if (!chatbot_type || !query) {
        return res.status(400).json({ message: 'Chatbot type and query are required.' });
    }

    try {
        const userId = req.user.id; // Lấy ID người dùng từ token đã xác thực

        const newChat = await Chat.create({
            user_id: userId,
            type: chatbot_type,
            title: query
        });

        if (newChat) {
            return res.status(201).json({ message: 'Chat created successfully.', chat: newChat });
        } else {
            return res.status(500).json({ message: 'Failed to create chat.' });
        }
    } catch (error) {
        console.error('Error creating chat:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

exports.getChat = async (req, res) => {
    const chatId = req.params.id;

    if (!chatId) {
        return res.status(400).json({ message: 'Chat ID is required.' });
    }

    try {
        const chat = await Chat.findOne({ where: { id: chatId } });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found.' });
        }

        const messages = await Message.findAll({ where: { chat_id: chatId } });

        return res.status(200).json({ chat, messages });
    } catch (error) {
        console.error('Error fetching chat:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}
exports.deleteChat = async (req, res) => {
    const chatId = req.params.id;

    if (!chatId) {
        return res.status(400).json({ message: 'Chat ID is required.' });
    }

    try {
        const chat = await Chat.findOne({ where: { id: chatId } });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found.' });
        }

        await Message.destroy({ where: { chat_id: chatId } });
        await Chat.destroy({ where: { id: chatId } });

        return res.status(200).json({ message: 'Chat deleted successfully.' });
    } catch (error) {
        console.error('Error deleting chat:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}
exports.sendQuestion = async (req, res) => {
   
    const chatId = req.params.id;
    const query = req.body.query;

    if (!query) {
        return res.status(400).json({ message: 'Query is required.' });
    }

    try {
        const chat = await Chat.findOne({ where: { id: chatId } });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found.' });
        }

        const response = await fetch(`${chatbotURL}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();

        if (response.ok) {
            const newMessage = await Message.create({
                chat_id: chatId,
                sender: 'user',
                content: query
            });

            await Message.create({
                chat_id: chatId,
                sender: 'bot',
                content: data.answer
            });

            return res.status(200).json({ message: 'Question sent successfully.', answer: data.answer });
        } else {
            return res.status(500).json({ message: 'Failed to get answer from chatbot.' });
        }
    } catch (error) {
        console.error('Error sending question:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }

}

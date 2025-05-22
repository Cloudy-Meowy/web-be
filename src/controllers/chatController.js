// chatController.js
const { v4: uuidv4 } = require('uuid');
const { eq } = require('drizzle-orm');
const { Chat, Message, Agent_profile } = require('../db/schema.js');
const chatbotURL = require('../config/config.js').config.chatbotAPIUrl;
const callApi = require('../utils/callApi.js').callApi;
const db = require('../db/db.js');

exports.createChat = async (req, res) => {
  const { type, question } = req.body;
  const userId = req.user?.id; // user ID từ auth middleware

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. User ID missing.' });
  }

  if (!type || !question) {
    return res.status(400).json({ message: 'Type and question are required.' });
  }

  try {
    const chatId = uuidv4();

    await db.insert(Chat).values({
      id: chatId,
      user_id: userId,
      type: type,
      title: question,
    });

    const agentProfile = await db.select()
      .from(Agent_profile)
      .where(eq(Agent_profile.name, type))
      .limit(1);

    if (agentProfile.length === 0) {
      return res.status(404).json({ message: 'Agent profile not found.' });
    }

    const profile = agentProfile[0];

    const response = await callApi(chatbotURL, {
      question,
      system_prompt: profile.system_prompt,
      es_cloud_id: profile.es_cloud_id,
      es_username: profile.es_username,
      es_password: profile.es_password,
      es_index: profile.es_index,
    });

    const ans = response.response;

    await db.insert(Message).values({
      chat_id: chatId,
      sender: 'user',
      content: question,
    });

    await db.insert(Message).values({
      chat_id: chatId,
      sender: 'bot',
      content: ans,
    });

    return res.status(201).json({ message: 'Chat created successfully.', chatId });
  } catch (error) {
    console.error('Error creating chat:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.sendQuestion = async (req, res) => {
  const chatId = req.params.id;
  const { question } = req.body;

  if (!chatId || !question) {
    return res.status(400).json({ message: 'Chat ID and question are required.' });
  }

  try {
    const chat = await db.select()
      .from(Chat)
      .where(eq(Chat.id, chatId))
      .limit(1);

    if (chat.length === 0) {
      return res.status(404).json({ message: 'Chat not found.' });
    }

    const chatData = chat[0];

    const agentProfile = await db.select()
      .from(Agent_profile)
      .where(eq(Agent_profile.name, chatData.type))
      .limit(1);

    if (agentProfile.length === 0) {
      return res.status(404).json({ message: 'Agent profile not found.' });
    }

    const profile = agentProfile[0];

    // Lấy lịch sử message (câu hỏi + trả lời) để làm history
    const msg_list = await fetchOldMessages(chatId);
    const msg_list_str = msg_list.map(msg => msg.content).join(' ');

    const response = await callApi(chatbotURL, {
      question,
      history: msg_list_str,
      system_prompt: profile.system_prompt,
      es_cloud_id: profile.es_cloud_id,
      es_username: profile.es_username,
      es_password: profile.es_password,
      es_index: profile.es_index,
    });

    const ans = response.response;

    await db.insert(Message).values({
      chat_id: chatId,
      sender: 'user',
      content: question,
    });

    await db.insert(Message).values({
      chat_id: chatId,
      sender: 'bot',
      content: ans,
    });

    return res.status(200).json({ message: 'Question sent successfully.', response });
  } catch (error) {
    console.error('Error sending question:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.getChat = async (req, res) => {
  const chatId = req.params.id;

  if (!chatId) {
    return res.status(400).json({ message: 'Chat ID is required.' });
  }

  try {
    const chat = await db.select()
      .from(Chat)
      .where(eq(Chat.id, chatId))
      .limit(1);

    if (chat.length === 0) {
      return res.status(404).json({ message: 'Chat not found.' });
    }

    const chatData = chat[0];

    const messages = await db.select()
      .from(Message)
      .where(eq(Message.chat_id, chatId))
      .orderBy(Message.timestamp, 'asc');

    const chatResponse = {
      chat_id: chatData.id,
      user_id: chatData.user_id,
      type: chatData.type,
      title: chatData.title,
      created_at: chatData.created_at,
      messages: messages.map(message => ({
        sender: message.sender,
        message: message.content,
        created_at: message.timestamp,
      })),
    };

    return res.status(200).json({ message: 'Chat retrieved successfully.', chat: chatResponse });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.deleteChat = async (req, res) => {
  const chatId = req.params.id;

  if (!chatId) {
    return res.status(400).json({ message: 'Chat ID is required.' });
  }

  try {
    const chat = await db.select()
      .from(Chat)
      .where(eq(Chat.id, chatId))
      .limit(1);

    if (chat.length === 0) {
      return res.status(404).json({ message: 'Chat not found.' });
    }

    await db.delete(Message).where(eq(Message.chat_id, chatId));
    await db.delete(Chat).where(eq(Chat.id, chatId));

    return res.status(200).json({ message: 'Chat deleted successfully.' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const chatbot_type = req.query.chatbot_type;

    if (!chatbot_type) {
      return res.status(400).json({ message: 'chatbot_type query parameter is required.' });
    }

    const chat_list = await db.select()
      .from(Chat)
      .where(eq(Chat.type, chatbot_type))
      .orderBy(Chat.created_at, 'desc');

    if (chat_list.length === 0) {
      return res.status(404).json({ message: 'No chat history found.' });
    }

    const result = chat_list.map(chat => ({
      chat_id: chat.id,
      title: chat.title,
      created_at: chat.created_at,
      type: chat.type,
    }));

    return res.status(200).json({ message: 'Chat history retrieved successfully.', chat_list: result });
  } catch (error) {
    console.error('Error getting chat history:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Hàm lấy lịch sử tin nhắn theo chatId
const fetchOldMessages = async (chatId) => {
  const messages = await db.select()
    .from(Message)
    .where(eq(Message.chat_id, chatId))
    .orderBy(Message.timestamp, 'asc');
  return messages;
};

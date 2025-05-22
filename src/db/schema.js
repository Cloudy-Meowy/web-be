const { defineModel, column } = require('drizzle-orm');
const db = require('./db.js'); // Kết nối MySQL thông qua Drizzle

// Định nghĩa schema cho bảng users
const User = defineModel('users', {
  id: column.int().primaryKey().autoIncrement(),
  email: column.string().notNull(),
  name: column.string().notNull(),
  password_hash: column.string().notNull(),
  created_at: column.dateTime().defaultNow()
});

// Định nghĩa schema cho bảng chats
const Chat = defineModel('chats', {
  id: column.string().primaryKey(), // id là kiểu varchar
  user_id: column.int(),
  type: column.string().notNull(),  // math, law
  title: column.string().notNull(),
  created_at: column.dateTime().defaultNow()
});

// Định nghĩa schema cho bảng messages
const Message = defineModel('messages', {
  id: column.int().primaryKey().autoIncrement(),
  chat_id: column.string().references(Chat.id), // Liên kết với bảng chats
  sender: column.string().notNull(), // bot, user
  content: column.text().notNull(),
  timestamp: column.dateTime().defaultNow()
});

const Agent_profile = defineModel('agent_profiles', {
  name: column.string().references(Chat.type),
  system_prompt: column.string(),
  es_cloud_id: column.string(),
  es_username: column.string(),
  es_password: column.string(),
  es_index: column.string(),
});
// Xuất các model để sử dụng trong các file khác
module.exports = { User, Chat, Message, Agent_profile };

// Tạo tất cả các bảng theo schema đã định nghĩa
async function syncDatabase() {
  await db.sync({ force: true });  // Đồng bộ các bảng với cơ sở dữ liệu
}

syncDatabase();

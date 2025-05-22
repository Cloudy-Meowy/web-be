const {
	mysqlTable,
	int,
	varchar,
	text,
	datetime,
} = require('drizzle-orm/mysql-core');
const { sql } = require('drizzle-orm');
const db = require('./db.js'); // Kết nối MySQL thông qua Drizzle

// Định nghĩa schema cho bảng users
exports.users = mysqlTable('users', {
	id: int('id').primaryKey().autoincrement(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	passwordHash: text('password_hash').notNull(),
	createdAt: datetime('created_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

// Định nghĩa schema cho bảng chats
exports.chats = mysqlTable('chats', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: int('user_id'),
	type: varchar('type', { length: 255 }).notNull(),
	title: varchar('title', { length: 255 }).notNull(),
	createdAt: datetime('created_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

// Định nghĩa schema cho bảng messages
exports.messages = mysqlTable('messages', {
	id: int('id').primaryKey().autoincrement(),
	chatId: varchar('chat_id', { length: 255 }).notNull(),
	sender: varchar('sender', { length: 255 }).notNull(),
	content: text('content').notNull(),
	timestamp: datetime('timestamp', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

exports.agentProfiles = mysqlTable('agent_profiles', {
	name: varchar('name', { length: 255 }).primaryKey(), 
	systemPrompt: text('system_prompt'),
	esCloudId: varchar('es_cloud_id', { length: 255 }), 
	esUsername: varchar('es_username', { length: 255 }),
	esPassword: varchar('es_password', { length: 255 }), 
	esIndex: varchar('es_index', { length: 255 }),
});

// Xuất các model để sử dụng trong các file khác
module.exports = {
  users: exports.users,
  chats: exports.chats,
  messages: exports.messages,
  agentProfiles: exports.agentProfiles,
};

// Tạo tất cả các bảng theo schema đã định nghĩa
async function syncDatabase() {
  console.log('Attempting to sync database schema...');
  try {
    await db.sync({ force: true }); // Đồng bộ các bảng với cơ sở dữ liệu
    console.log('Database schema synced successfully!');
  } catch (error) {
    console.error('Error syncing database schema:', error);
  }
} // CÁI NÀY ĐANG BỊ LỖI: db.sync is not a function

syncDatabase();
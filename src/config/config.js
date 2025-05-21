require('dotenv').config(); // Load environment variables from .env file

dotenv.config(); // Load environment variables from .env file

const mysqlUrl  = process.env.MYSQL_URL || 'mysql://root:password@localhost:3306/mydb'
const chatbotAPIUrl = process.env.CHATBOT_API_URL || 'http://localhost:5000/api/chatbot'
export const config = {
    mysqlUrl: mysqlUrl,
    chatbotAPIUrl: chatbotAPIUrl,
}
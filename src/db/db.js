
const {drizzle} = require("drizzle-orm/node-postgres");
import { config } from "../config/config.js";
const mysql = require("mysql2/promise");

const connection =  mysql.createPool({
    connectionString: config.mysqlUrl,
    waitForConnections: true,
});

const db = drizzle(connection);

// Xuất db để sử dụng trong các file khác
export default db;
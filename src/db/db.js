const {drizzle} = require("drizzle-orm/mysql2");
const { config, dbConfig } = require("../config/config.js");
const mysql = require("mysql2/promise");

// const connection =  mysql.createPool({
//     connectionString: config.mysqlUrl,
//     waitForConnections: true,
// });

const pool = mysql.createPool(dbConfig);

const db = drizzle(pool);

pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to MySQL database using mysql2 pool!');
        connection.release(); // Release the connection back to the pool
    })
    .catch(err => {
        console.error('Error connecting to MySQL database:', err.message);
        // Consider exiting the application if DB connection is critical
        // process.exit(1);
    });

// Xuất db để sử dụng trong các file khác
module.exports = db;
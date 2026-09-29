require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'dragonbound',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'dragonbound',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0
});

module.exports = pool;

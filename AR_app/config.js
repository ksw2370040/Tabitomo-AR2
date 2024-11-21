// config.js
const { Client } = require('pg');
require('dotenv').config();

const connection = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'tabitomodb.crgucea6c04o.us-east-1.rds.amazonaws.com',
    database: process.env.DB_NAME || 'tabitomo',
    password: process.env.DB_PASSWORD || 'kashi0001',
    port: process.env.DB_PORT || 5432,
    ssl: {
        rejectUnauthorized: false,  // SSL接続を有効にするための設定
    }
});

connection.connect()
    .then(() => console.log('PostgreSQLデータベースに接続しました'))
    .catch(err => console.error('データベース接続エラー:', err.stack));

module.exports = connection;

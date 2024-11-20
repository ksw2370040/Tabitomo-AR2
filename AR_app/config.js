// config.js
const { Client } = require('pg');
require('dotenv').config();

const connection = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'tabitomo',
    password: process.env.DB_PASSWORD || 'kashi0001',
    port: process.env.DB_PORT || 5432,
});

connection.connect()
    .then(() => console.log('PostgreSQLデータベースに接続しました'))
    .catch(err => console.error('データベース接続エラー:', err.stack));

module.exports = connection;

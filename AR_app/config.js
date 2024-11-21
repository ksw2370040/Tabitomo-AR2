// config.js
const { Client } = require('pg');
require('dotenv').config();

const connection = new Client({
    user: process.env.DB_USER || 'postgres',  // DB_USERの設定も確認
    host: process.env.DB_HOST || 'tabitomo.crgucea6c04o.us-east-1.rds.amazonaws.com', // RDSのホスト名
    database: process.env.DB_NAME || 'tabitomo',
    password: process.env.DB_PASSWORD || 'kashi0001',  // DB_PASSWORDの設定も確認
    port: process.env.DB_PORT || 5432,
});


connection.connect()
    .then(() => console.log('PostgreSQLデータベースに接続しました'))
    .catch(err => console.error('データベース接続エラー:', err.stack));

module.exports = connection;

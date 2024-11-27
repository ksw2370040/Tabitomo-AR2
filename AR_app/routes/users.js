// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const connection = require('../config');

// ログインエンドポイント
router.post('/userlogin', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE name = $1 AND password = $2;';
    connection.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('データベースエラー:', err);
            return res.status(500).send('サーバーエラー');
        }
        if (results.rows.length > 0) {
            res.redirect(`/AR_user/home.html?username=${encodeURIComponent(username)}`);
        } else {
            res.status(401).send('ユーザー名またはパスワードが間違っています');
        }
    });
});

module.exports = router;

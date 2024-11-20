// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const connection = require('../config');

// ログインエンドポイント
router.post('/login', (req, res) => {
    const { adminname, password } = req.body;
    const query = 'SELECT * FROM ADMIN WHERE name = $1 AND password = $2;';
    connection.query(query, [adminname, password], (err, results) => {
        if (err) {
            console.error('データベースエラー:', err);
            return res.status(500).send('サーバーエラー');
        }
        if (results.rows.length > 0) {
            res.redirect(`/AR_admin/menu.html?adminname=${encodeURIComponent(adminname)}`);
        } else {
            res.status(401).send('ユーザー名またはパスワードが間違っています');
        }
    });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const connection = require('../config');  // データベース接続

// データベースに関するエンドポイントの例
router.get('/markers', (req, res) => {
    const query = 'SELECT * FROM markers';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('データベースエラー:', err);
            return res.status(500).send('サーバーエラー');
        }
        res.json(results.rows);
    });
});

module.exports = router;

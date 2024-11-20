const express = require('express');
const router = express.Router();
const connection = require('../config'); // PostgreSQLの接続設定

// modellistエンドポイント - モデル情報をJSONとして返す
router.get('/', async (req, res) => {
    const query = 'SELECT mdlid FROM model_info';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('データベースエラー:', err);
            return res.status(500).send('サーバーエラー');
        }
        if (results.rows.length > 0) {
            res.json(results.rows);  // モデル情報をJSONとして返す
        } else {
            res.status(404).send('モデル情報が見つかりません');
        }
    });
});

module.exports = router;

// routes/markerRoutes.js
const express = require('express');
const router = express.Router();
const connection = require('../config'); // PostgreSQLの接続設定

// markerinfo2エンドポイント - マーカー情報をJSONとして返す
router.get('/markerinfo2', async (req, res) => {
    const query = 'SELECT mkid, mkname, patt, mkimage FROM marker';
    
    // クエリを実行して結果を取得
    connection.query(query, (err, results) => {
        if (err) {
            console.error('データベースエラー:', err);
            return res.status(500).send('サーバーエラー');
        }
        
        // 結果が1件以上返ってきた場合
        if (results.rows.length > 0) {
            res.json(results.rows); // マーカー情報をJSONとして返す
        } else {
            res.status(404).send('マーカー情報が見つかりません');
        }
    });
});

module.exports = router;

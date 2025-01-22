const express = require('express');
const router = express.Router();
const connection = require('../config'); // PostgreSQLの接続設定

// locationエンドポイント - モデル情報をJSONとして返す
router.get('/', async (req, res) => {
    const query = 'SELECT "locationid", "locationname", "address" FROM LOCATION';
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

// locationエンドポイント - 新規登録処理
router.post('/add', async (req, res) => {
    const { locationName, address } = req.body;

    if (!locationName || !address) {
        return res.status(400).send('場所名と住所は必須です');
    }

    // locationIDの最大値を取得し、新しいIDを生成
    const getMaxIdQuery = 'SELECT MAX(CAST(locationid AS INTEGER)) AS maxid FROM LOCATION';
    connection.query(getMaxIdQuery, (err, results) => {
        if (err) {
            console.error('ID生成エラー:', err);
            return res.status(500).send('サーバーエラー');
        }

        const maxId = results.rows[0].maxid || 0;
        const newId = String(maxId + 1).padStart(5, '0');

        const insertQuery = 'INSERT INTO LOCATION (locationid, locationname, address) VALUES ($1, $2, $3)';
        const values = [newId, locationName, address];

        connection.query(insertQuery, values, (err) => {
            if (err) {
                console.error('データ挿入エラー:', err);
                return res.status(500).send('サーバーエラー');
            }
            res.json({ locationID: newId });
        });
    });
});


module.exports = router;
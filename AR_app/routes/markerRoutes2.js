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

router.delete('/marker/:mkid', async (req, res) => {
    const mkid = req.params.mkid;  // URLパラメータから削除対象のモデルIDを取得
    const query = 'DELETE FROM marker WHERE mkid = $1';

    connection.query(query, [mkid], (err, results) => {
        if (err) {
            console.error('データベースエラー:', err);
            return res.status(500).send('サーバーエラー');
        }
        if (results.rowCount > 0) {
            res.status(200).send('削除成功');
        } else {
            res.status(404).send('モデルが見つかりません');
        }
    });
});

module.exports = router;
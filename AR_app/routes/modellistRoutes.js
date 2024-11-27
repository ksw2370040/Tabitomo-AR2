const express = require('express');
const router = express.Router();
const connection = require('../config'); // PostgreSQLの接続設定

// modellistエンドポイント - モデル情報をJSONとして返す
router.get('/', async (req, res) => {
    const query = 'SELECT mdlid, mkid, mdlname, mdlimage, mdlsound, mdltext FROM model_info';
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

router.delete('/:mdlid', async (req, res) => {
    const mdlid = req.params.mdlid;  // URLパラメータから削除対象のモデルIDを取得
    const query = 'DELETE FROM model_info WHERE mdlid = $1';

    connection.query(query, [mdlid], (err, results) => {
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
const express = require('express');
const router = express.Router();
const connection = require('../config'); // PostgreSQLの接続設定

// modellistエンドポイント - モデル情報をJSONとして返す
router.get('/', async (req, res) => {
    const query = 'SELECT mdlid, mdlsound FROM model2';
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

// 音声情報を削除するエンドポイント
router.delete('/:mdlsound/:languagename', async (req, res) => {
    const { mdlsound, languagename } = req.params;

    try {
        const result = await connection.query(
            'DELETE FROM sound WHERE mdlsound = $1 AND languagename = $2',
            [mdlsound, languagename]
        );

        if (result.rowCount > 0) {
            res.json({ message: `${mdlsound} : ${languagename} の音声情報を削除しました。` });
        } else {
            res.status(404).json({ error: `音声情報 (mdlsound: ${mdlsound}, languagename: ${languagename}) が見つかりません。` });
        }
    } catch (error) {
        console.error('削除中にエラーが発生しました:', error);
        res.status(500).json({ error: '削除中にエラーが発生しました。' });
    }
});

module.exports = router;
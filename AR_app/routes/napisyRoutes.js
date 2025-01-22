const express = require('express');
const router = express.Router();
const connection = require('../config'); // PostgreSQLの接続設定

// modellistエンドポイント - モデル情報をJSONとして返す
router.get('/', async (req, res) => {
    const query = 'SELECT mdlid, mdltext FROM model2';
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

router.delete('/:mdltext/:languagename', async (req, res) => {
    const { mdltext, languagename } = req.params;

    try {
        const result = await connection.query(
            'DELETE FROM napisy WHERE mdltext = $1 AND languagename = $2',
            [mdltext, languagename]
        );

        if (result.rowCount > 0) {
            res.json({ message: `${mdltext} : ${languagename} の字幕情報を削除しました。` });
        } else {
            res.status(404).json({ error: `字幕情報 (mdltext: ${mdltext}, languagename: ${languagename}) が見つかりません。` });
        }
    } catch (error) {
        console.error('削除中にエラーが発生しました:', error);
        res.status(500).json({ error: '削除中にエラーが発生しました。' });
    }
});

module.exports = router;
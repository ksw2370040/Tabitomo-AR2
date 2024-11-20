// napisylistRoutes.js
const express = require('express');
const router = express.Router();
const connection = require('../config'); // PostgreSQLの接続設定

// /api/napisylist エンドポイント
router.get('/napisylist', async (req, res) => {
    const mdlID = req.query.mdlID; // クエリから mdlID を取得

    try {
        // model_info テーブルから mdltext を取得
        const modelInfo = await connection.query('SELECT mdltext FROM model_info WHERE mdlid = $1', [mdlID]);

        if (modelInfo.rows.length > 0) {
            const mdltext = modelInfo.rows[0].mdltext;

            // mdltext を基に napisy テーブルから関連するデータを取得
            const result = await connection.query('SELECT mdltext, languagename, napisyfile FROM napisy WHERE mdltext = $1', [mdltext]);

            if (result.rows.length > 0) {
                res.json(result.rows); // 取得したデータをJSONとして返す
            } else {
                res.status(404).send('指定された字幕が見つかりません');
            }
        } else {
            res.status(404).send('指定されたモデルIDが見つかりません');
        }
    } catch (error) {
        console.error('モデル詳細の取得中にエラーが発生しました:', error);
        res.status(500).send('エラーが発生しました');
    }
});

module.exports = router;

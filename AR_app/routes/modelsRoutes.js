const express = require('express');
const router = express.Router();
const connection = require('../config');  // PostgreSQLの接続設定

// すべてのモデルデータを取得するエンドポイント
router.get('/models', async (req, res) => {
    try {
        const query = `
            SELECT 
                m.mdlname,
                m.mdlid,
                m.mdlimage,
                m.mkname,
                m.patt,
                m.mkimage,
                m.mdlsound,
                m.mdltext,
                s.languagename,
                s.soundfile,
                n.napisyfile
            FROM 
                model2 m
            LEFT JOIN  
                sound s ON m.mdlsound = s.mdlsound 
            LEFT JOIN  
                napisy n ON m.mdltext = n.mdltext AND s.languagename = n.languagename
            ORDER BY
                m.mdlid, s.languagename;
        `;
        const result = await connection.query(query);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'モデルデータが見つかりません。' });
        }

        res.json(result.rows);  // データをJSON形式で返す
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'データの取得中にエラーが発生しました。' });
    }
});

module.exports = router;

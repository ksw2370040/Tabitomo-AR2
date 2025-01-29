// multiAR.js
const express = require('express');
const router = express.Router();
const connection = require('../config'); // DB接続の設定

// 言語名を条件にデータを取得するエンドポイント
router.get('/', async (req, res) => {
    const languagename = req.query.languagename;  // URLパラメーターからlanguagenameを取得

    if (!languagename) {
        return res.status(400).json({ error: 'languagenameパラメーターが必要です' });
    }

    try {
        const query = `
            SELECT 
                m.mdlid,
                m.mdlimage,
                m.patt,
                COALESCE(s.soundfile, '') AS soundfile,  -- NULLの場合は空文字を設定
                COALESCE(n.napisyfile, '') AS napisyfile -- NULLの場合は空文字を設定
            FROM 
                model2 m
            LEFT JOIN  
                sound s ON m.mdlsound = s.mdlsound AND s.languagename = $1
            LEFT JOIN  
                napisy n ON m.mdltext = n.mdltext AND n.languagename = $1
            WHERE
                m.mdlsound IS NOT NULL OR m.mdltext IS NOT NULL
            ORDER BY
                m.mdlid;
        `;
        
        const result = await connection.query(query, [languagename]);

        const response = result.rows.map(data => {
            return {
                mdlid: data.mdlid,
                mdlimage: data.mdlimage,
                patt: data.patt,
                soundfile: data.soundfile,
                napisyfile: data.napisyfile
            };
        });

        res.json(response);  // フロントエンド用にデータを整形して返す
    } catch (error) {
        console.error('データの取得中にエラーが発生しました:', error);
        res.status(500).json({ error: 'データの取得中にエラーが発生しました。' });
    }
});

module.exports = router;

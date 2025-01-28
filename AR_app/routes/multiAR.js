const express = require('express');
const path = require('path');
const router = express.Router();
const connection = require('../config'); // DB接続の設定

// 静的ファイルの提供
const publicDirectory = path.join(__dirname, '..', 'public');

// ファイルへのパスを正しく設定
router.use('/Content', express.static(path.join(publicDirectory, 'Content')));

// 言語名を直接取得して、それを条件にデータを取得するエンドポイント
router.get('/', async (req, res) => {
    const languagename = req.query.languagename;  // URLパラメーターからlanguagenameを取得

    if (!languagename) {
        return res.status(400).json({ error: 'languagenameパラメーターが必要です' });
    }

    try {
        const query = `
            SELECT 
                m.mdlimage,
                m.patt,
                m.mkimage,
                s.soundfile,
                n.napisyfile
            FROM 
                model2 m
            LEFT JOIN  
                sound s ON m.mdlsound = s.mdlsound 
            LEFT JOIN  
                napisy n ON m.mdltext = n.mdltext AND s.languagename = n.languagename
            WHERE
                s.languagename = $1
            ORDER BY
                m.mdlid, s.languagename;
        `;
        
        const result = await connection.query(query, [languagename]);
        res.json(result.rows);
    } catch (error) {
        console.error('データの取得中にエラーが発生しました:', error);
        res.status(500).json({ error: 'データの取得中にエラーが発生しました。' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const connection = require('../config');

// 全てのモデルデータを取得するエンドポイント
router.get('/multiAR', async (req, res) => {
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
        res.json(result.rows);
    } catch (error) {
        console.error('データの取得中にエラーが発生しました:', error);
        res.status(500).json({ error: 'データの取得中にエラーが発生しました。' });
    }
});

module.exports = router;

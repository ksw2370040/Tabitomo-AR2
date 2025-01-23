const express = require('express');
const router = express.Router();
const connection = require('../config'); // DB接続の設定
const path = require('path'); // パスの操作に使用

// 全てのモデルデータを取得するエンドポイント
router.get('/multiAR', async (req, res) => {
    try {
        const query = `
            SELECT 
                m.mdlID,
                m.mdlname,
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
                MODEL2 m
            LEFT JOIN  
                sound s ON m.mdlsound = s.mdlsound 
            LEFT JOIN  
                napisy n ON m.mdltext = n.mdltext AND s.languagename = n.languagename
            ORDER BY
                m.mdlID, s.languagename;
        `;
        
        const result = await connection.query(query);

        // 結果を適切な形式で整形
        const formattedResults = result.rows.map(row => {
            return {
                mdlID: row.mdlid,
                mdlname: row.mdlname,
                mdlimage: row.mdlimage ? path.join('/Content/.glb', row.mdlimage) : '',  // nullチェックを追加
                mkname: row.mkname,
                patt: row.patt ? path.join('/Content/.patt', row.patt) : '',  // nullチェックを追加
                mkimage: row.mkimage,
                mdlsound: row.mdlsound,
                mdltext: row.mdltext,
                languagename: row.languagename,
                soundfile: row.soundfile ? path.join('/Content/sound', row.soundfile) : '',  // nullチェックを追加
                napisyfile: row.napisyfile ? path.join('/Content/subtitles', row.napisyfile) : ''  // nullチェックを追加
            };
        });

        // 整形したデータを返す
        res.json(formattedResults);
    } catch (error) {
        console.error('データの取得中にエラーが発生しました:', error);
        res.status(500).json({ error: 'データの取得中にエラーが発生しました。' });
    }
});

module.exports = router;

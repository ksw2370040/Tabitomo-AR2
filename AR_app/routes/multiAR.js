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
                mdlimage: path.join('/Content/.glb', row.mdlimage),  // モデル画像ファイルのパスをフルパスに変換
                mkname: row.mkname,
                patt: path.join('/Content/.patt', row.patt),  // マーカーパターンファイルのパスをフルパスに変換
                mkimage: row.mkimage,
                mdlsound: row.mdlsound,
                mdltext: row.mdltext,
                languagename: row.languagename,
                soundfile: path.join('/Content/sound', row.soundfile),  // 音声ファイルのパスをフルパスに変換
                napisyfile: path.join('/Content/subtitles', row.napisyfile)  // 字幕ファイルのパスをフルパスに変換
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

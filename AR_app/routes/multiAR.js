// multiAR.js (APIルート)
const express = require('express');
const router = express.Router();
const connection = require('../config'); // DB接続の設定

// 言語名を直接取得して、それを条件にデータを取得するエンドポイント
router.get('/multiAR', async (req, res) => {
    const languagename = req.query.languagename;  // URLパラメーターからlanguagenameを取得

    if (!languagename) {
        return res.status(400).json({ error: 'languagenameパラメーターが必要です' });
    }

    try {
        // モデル、サウンド、字幕を動的に取得するクエリ
        const query = `
            SELECT 
                m.mdlid,
                m.mdlimage,
                m.patt,
                m.mkimage,
                COALESCE(s.soundfile, '') AS soundfile,   -- 音声ファイルがnullの場合、空文字を返す
                COALESCE(n.napisyfile, '') AS napisyfile -- 字幕ファイルがnullの場合、空文字を返す
            FROM 
                model2 m
            LEFT JOIN  
                sound s ON m.mdlsound = s.mdlsound AND s.languagename = $1
            LEFT JOIN  
                napisy n ON m.mdltext = n.mdltext AND n.languagename = $1
            WHERE
                s.languagename = $1
            ORDER BY
                m.mdlid;
        `;
        
        const result = await connection.query(query, [languagename]);

        // 結果が存在しない場合のエラーハンドリング
        if (result.rows.length === 0) {
            return res.status(404).json({ error: '指定された言語のデータが見つかりません' });
        }

        res.json(result.rows); // クエリ結果をJSON形式で返却
    } catch (error) {
        console.error('データの取得中にエラーが発生しました:', error);
        res.status(500).json({ error: 'データの取得中にエラーが発生しました。' });
    }
});

module.exports = router;

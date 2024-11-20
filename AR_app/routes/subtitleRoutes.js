// routes/subtitleRoutes.js
const express = require('express');
const router = express.Router();
const connection = require('../config');

// モデル詳細エンドポイント
router.get('/model_detail', async (req, res) => {
    const mdlID = req.query.mdlID;
    try {
        const modelInfo = await connection.query('SELECT mdltext FROM model_info WHERE mdlid = $1', [mdlID]);
        if (modelInfo.rows.length > 0) {
            const mdltext = modelInfo.rows[0].mdltext;
            const result = await connection.query('SELECT mdltext, languagename, napisyfile FROM napisy WHERE mdltext = $1', [mdltext]);
            if (result.rows.length > 0) {
                const subtitlesList = result.rows.map(row => `
                  <li>
                    <p>字幕ID: ${row.mdltext}</p>
                    <p>言語名: ${row.languagename}</p>
                    <p>字幕ファイル: <a href="/path/to/subtitles/${row.napisyfile}">${row.napisyfile}</a></p>
                  </li>
                `).join('');
                res.send(`<html lang="ja">...<ul>${subtitlesList}</ul></html>`);
            } else {
                res.status(404).send('指定された字幕が見つかりません');
            }
        } else {
            res.status(404).send('指定されたモデルIDが見つかりません');
        }
    } catch (error) {
        console.error('Error fetching model details:', error);
        res.status(500).send('エラーが発生しました');
    }
});

module.exports = router;

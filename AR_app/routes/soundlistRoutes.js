// C:\Tabitomo-AR\AR_app\routes\soundlistRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const connection = require('../config');
const router = express.Router();
const fs = require('fs');  // fs モジュールをインポート

// ファイルアップロード設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // サウンドファイルの保存先ディレクトリ
    cb(null, '/home/ec2-user/Tabitomo-AR2/AR_app/public/Content/sound');
  },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now();
        const originalName = path.basename(file.originalname, path.extname(file.originalname));
        cb(null, `${originalName}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// GETルート：mdlsoundに基づいてデータを取得
router.get('/', async (req, res) => {
    const mdlsound = req.query.mdlsound;  // クエリパラメータからmdlsoundを取得

    if (!mdlsound) {
        return res.status(400).json({ error: 'mdlsoundが指定されていません。' });
    }

    try {
        // `mdlsound` に関連するデータを取得するSQL
        const result = await connection.query('SELECT * FROM sound WHERE mdlsound = $1', [mdlsound]);
        res.json(result.rows);  // 取得したデータを返す
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'データの取得中にエラーが発生しました' });
    }
});

// 言語リスト取得
router.get('/languages', async (req, res) => {
    try {
        const { mdlsound } = req.query;
        if (!mdlsound) {
            return res.status(400).json({ error: 'mdlsoundが指定されていません。' });
        }

        const result = await connection.query('SELECT languagename FROM sound WHERE mdlsound = $1', [mdlsound]);
        const existingLanguages = result.rows.map(row => row.languagename);
        const allLanguages = ['日本語', '英語', '韓国語', '中国語'];
        const availableLanguages = allLanguages.filter(lang => !existingLanguages.includes(lang));

        res.json(availableLanguages);
    } catch (error) {
        console.error('言語リスト取得エラー:', error);
        res.status(500).json({ error: '言語リスト取得に失敗しました' });
    }
});

// 音声ファイル追加
router.post('/add', upload.single('soundFile'), async (req, res) => {
    try {
        const { languagename, mdlsound } = req.body;
        const soundFile = req.file?.filename;

        if (!soundFile || !languagename || !mdlsound) {
            return res.status(400).json({ error: '必要なデータが不足しています' });
        }

        await connection.query(
            'INSERT INTO sound (mdlsound, languagename, soundfile) VALUES ($1, $2, $3)',
            [mdlsound, languagename, soundFile]
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('音声追加エラー:', error);
        res.status(500).json({ error: '音声データの挿入に失敗しました' });
    }
});

// 音声ファイル編集
router.post('/edit', upload.single('soundFile'), async (req, res) => {
    const { oldsoundfile, oldlanguagename, oldmdlsound, languagename } = req.body;
    const soundFile = req.file?.filename;

    if (!oldmdlsound || !oldlanguagename || !languagename) {
        return res.status(400).json({ error: '必要なデータが不足しています。' });
    }

    try {
        // ファイルがアップロードされた場合、古いファイルを削除
        if (soundFile) {
            const oldFilePath = path.join('/home/ec2-user/Tabitomo-AR2/AR_app/public/Content/sound', oldsoundfile);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        // SQLクエリを生成
        const updateQuery = `
            UPDATE sound
            SET languagename = $1, soundfile = $2
            WHERE mdlsound = $3 AND languagename = $4
        `;
        const values = [languagename, soundFile || oldsoundfile, oldmdlsound, oldlanguagename];

        await connection.query(updateQuery, values);

        res.json({ success: true });
    } catch (error) {
        console.error('音声編集エラー:', error);
        res.status(500).json({ error: '音声情報の更新に失敗しました。' });
    }
});
module.exports = router;  // ルーターをエクスポート

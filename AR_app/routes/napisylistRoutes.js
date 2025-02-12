// C:\Tabitomo-AR\AR_app\routes\napisylistRoutes.js
const express = require('express');  // expressモジュールのインポート
const router = express.Router();     // express.Router() でルーターを定義
const connection = require('../config');  // PostgreSQLの接続設定
const multer = require('multer');
const path = require('path');
const fs = require('fs');  // fs モジュールをインポート

// ファイルアップロード設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/home/ec2-user/Tabitomo-AR2/AR_app/public/Content/napisy');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now();
        const originalName = path.basename(file.originalname, path.extname(file.originalname));
        cb(null, `${originalName}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });


// ここでルートの設定
router.get('/', async (req, res) => {
    const mdltext = req.query.mdltext;  // クエリパラメータからmdltextを取得

    if (!mdltext) {
        return res.status(400).json({ error: 'mdltextが指定されていません。' });
    }

    try {
        // mdltext に関連するデータを取得するSQL
        const result = await connection.query('SELECT * FROM napisy WHERE mdltext = $1', [mdltext]);
        res.json(result.rows);  // 取得したデータを返す
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'データの取得中にエラーが発生しました' });
    }
});

// 言語リスト取得
router.get('/languages', async (req, res) => {
    try {
        const { mdltext } = req.query;
        if (!mdltext) {
            return res.status(400).json({ error: 'mdltextが指定されていません。' });
        }

        const result = await connection.query('SELECT languagename FROM napisy WHERE mdltext = $1', [mdltext]);
        const existingLanguages = result.rows.map(row => row.languagename);
        const allLanguages = ['日本語', '英語', '韓国語', '中国語'];
        const availableLanguages = allLanguages.filter(lang => !existingLanguages.includes(lang));

        res.json(availableLanguages);
    } catch (error) {
        console.error('言語リスト取得エラー:', error);
        res.status(500).json({ error: '言語リスト取得に失敗しました' });
    }
});

// 字幕ファイル追加
router.post('/add', upload.single('napisyFile'), async (req, res) => {
    try {
        const { languagename, mdltext } = req.body;
        const napisyFile = req.file?.filename;

        if (!napisyFile || !languagename || !mdltext) {
            return res.status(400).json({ error: '必要なデータが不足しています' });
        }

        await connection.query(
            'INSERT INTO napisy (mdltext, languagename, napisyfile) VALUES ($1, $2, $3)',
            [mdltext, languagename, napisyFile]
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('字幕追加エラー:', error);
        res.status(500).json({ error: '字幕データの挿入に失敗しました' });
    }
});


// // 編集ページ用のファイル内容取得
router.get('/edit', async (req, res) => {
    const { mdltext, napisyfile } = req.query;

    if (!mdltext || !napisyfile) {
        return res.status(400).json({ error: '必要なデータが不足しています。' });
    }

    try {
        const filePath = path.join('/home/ec2-user/Tabitomo-AR2/AR_app/public/Content/napisy', napisyfile);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.json({ content });
        } else {
            res.status(404).json({ error: 'ファイルが見つかりません。' });
        }
    } catch (error) {
        console.error('ファイルの読み込みエラー:', error);
        res.status(500).json({ error: 'ファイル内容の取得に失敗しました。' });
    }
});

// 編集内容保存
router.post('/edit', upload.single('napisyFile'), async (req, res) => {
    const { oldmdltext, oldlanguagename, oldnapisyfile, languagename, napisyfile, napisycontent } = req.body;
    const napisyFile = req.file?.filename || oldnapisyfile;

    if (!oldmdltext || !oldlanguagename || !languagename || !napisyfile || !napisycontent) {
        return res.status(400).json({ error: '必要なデータが不足しています。' });
    }

    try {
        // 古いファイルを削除
        const oldFilePath = path.join('/home/ec2-user/Tabitomo-AR2/AR_app/public/Content/napisy', oldnapisyfile);
        if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
        }

        // 新しいファイルに内容を保存
        const newFilePath = path.join('C/home/ec2-user/Tabitomo-AR2/AR_app/public/Content/napisy', napisyFile);
        fs.writeFileSync(newFilePath, napisycontent, 'utf-8');

        // DB更新
        await connection.query(
            'UPDATE napisy SET languagename = $1, napisyfile = $2 WHERE mdltext = $3 AND languagename = $4',
            [languagename, napisyFile, oldmdltext, oldlanguagename]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('字幕更新エラー:', error);
        res.status(500).json({ error: '字幕情報の更新に失敗しました。' });
    }
});

module.exports = router;

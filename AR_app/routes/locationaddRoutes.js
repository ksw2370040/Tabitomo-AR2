// C:\Tabitomo-AR\AR_app\routes\locationaddRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config');
const router = express.Router();

// ファイルアップロード設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // フィールド名に応じたアップロード先ディレクトリのマッピング
    const directoryMap = {
      'mdlimage': '/home/ec2-user/Tabitomo-AR2/AR_app/public/Content/.glb',
      'patt': '/home/ec2-user/Tabitomo-AR2/AR_app/public/Content/.patt',
      'mkimage': '/home/ec2-user/Tabitomo-AR2/AR_app/public/Content/markerimage',
      'sound': '/home/ec2-user/Tabitomo-AR2/AR_app/public/Content/sound',
      'subtitles': '/home/ec2-user/Tabitomo-AR2/AR_app/public/Content/napisy'
    };
    // マッピングされたディレクトリを使用。デフォルトは 'default/path'
    cb(null, directoryMap[file.fieldname] || 'default/path');
  },
  filename: (req, file, cb) => {
    // ファイル名にユニークなサフィックスを追加
    const uniqueSuffix = Date.now();
    const originalName = path.basename(file.originalname, path.extname(file.originalname));
    cb(null, `${originalName}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// 新規登録ルート
router.post('/add', upload.fields([
  { name: 'mdlimage', maxCount: 1 },
  { name: 'patt', maxCount: 1 },
  { name: 'mkimage', maxCount: 1 },
  { name: 'sound', maxCount: 1 },
  { name: 'subtitles', maxCount: 1 },
]), async (req, res) => {
  try {
    const { mdlname, mkname, languagename, locationName, address } = req.body;

    // 必須フィールドの検証
    if (!locationName || !address) {
      return res.status(400).send('場所名と住所は必須です');
    }

    // LOCATIONテーブルの最大IDを取得し、新しいIDを生成
    const { rows: locationRows } = await db.query('SELECT MAX(CAST(locationid AS INTEGER)) AS maxid FROM LOCATION');
    const newLocationID = String((locationRows[0].maxid || 0) + 1).padStart(5, '0');

    // LOCATIONテーブルにデータを挿入
    await db.query(
      'INSERT INTO LOCATION (locationid, locationname, address) VALUES ($1, $2, $3)',
      [newLocationID, locationName, address]
    );

    // MODEL2テーブルの最大IDを取得し、新しいIDを生成
    const { rows: modelRows } = await db.query(`
      SELECT MAX(CAST(SUBSTRING(mdlID FROM 4) AS INTEGER)) AS max_id,
             MAX(CAST(SUBSTRING(mdlsound FROM 2) AS INTEGER)) AS max_sound,
             MAX(CAST(SUBSTRING(mdltext FROM 2) AS INTEGER)) AS max_text
      FROM MODEL2
    `);
    const mdlID = `mdl${String(modelRows[0].max_id + 1).padStart(4, '0')}`;
    const mdlsound = `s${String(modelRows[0].max_sound + 1).padStart(2, '0')}`;
    const mdltext = `t${String(modelRows[0].max_text + 1).padStart(2, '0')}`;

    // ファイル情報の取得
    const mdlimage = req.files['mdlimage'][0].filename;
    const patt = req.files['patt'][0].filename;
    const mkimage = req.files['mkimage'][0].filename;
    const sound = req.files['sound'] ? req.files['sound'][0].filename : null;
    const subtitles = req.files['subtitles'] ? req.files['subtitles'][0].filename : null;

    // MODEL2テーブルにデータを挿入
    await db.query(`
      INSERT INTO MODEL2 (mdlID, locationID, mdlname, mdlimage, mkname, patt, mkimage, mdlsound, mdltext)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [mdlID, newLocationID, mdlname, mdlimage, mkname, patt, mkimage, mdlsound, mdltext]);

    // サウンドファイルの登録（存在する場合）
    if (sound) {
      await db.query(
        'INSERT INTO sound (mdlsound, languagename, soundfile) VALUES ($1, $2, $3)',
        [mdlsound, languagename, sound]
      );
    }

    // 字幕ファイルの登録（存在する場合）
    if (subtitles) {
      await db.query(
        'INSERT INTO napisy (mdltext, languagename, napisyfile) VALUES ($1, $2, $3)',
        [mdltext, languagename, subtitles]
      );
    }

    // 成功レスポンスを送信
    res.status(200).json({ mdlID });
  } catch (err) {
    // エラー処理
    console.error('Error occurred:', err);
    res.status(500).send('エラーが発生しました');
  }
});

module.exports = router;

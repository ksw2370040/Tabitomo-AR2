// routes/newmarker.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const connection = require('../config'); // PostgreSQLの接続設定

// 画像アップロードの設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // アップロード先ディレクトリ
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 一意のファイル名を生成
    }
});
const upload = multer({ storage: storage });

// 新規登録フォームの表示
router.get('/new', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/newMarker.html')); // 新規登録画面
});

// 確認画面の表示
router.get('/confirm', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/confirmMarker.html')); // 確認画面
});

// 完了画面の表示
router.get('/complete', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/completeMarker.html')); // 完了画面
});

// マーカー登録処理（POSTリクエスト）
router.post('/markerregister', upload.single('mkimage'), (req, res) => {
    const { mkid, mkname, patt } = req.body;
    const mkimage = req.file ? req.file.filename : null;  // 画像ファイルの名前を保存

    const query = 'INSERT INTO marker (mkid, mkname, patt, mkimage) VALUES ($1, $2, $3, $4)';
    const values = [mkid, mkname, patt, mkimage];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('データベースエラー:', err);
            return res.status(500).json({ success: false, message: 'サーバーエラー' });
        }
        res.json({ success: true, message: 'マーカーが正常に登録されました' });
    });
});

// 新規登録フォームの表示
router.get('/new', (req, res) => {
    // mkidの最大値を取得（例: 'M0010'）
    const query = 'SELECT MAX(mkid) AS max_mkid FROM marker';
    connection.query(query, (err, result) => {
        if (err) {
            console.error('データベースエラー:', err);
            return res.status(500).json({ success: false, message: 'サーバーエラー' });
        }

        let nextMkid = 'M0001'; // デフォルトの値（最初のmkid）
        if (result.rows[0].max_mkid) {
            // 最大mkid（例: 'M0010'）を取り出す
            const maxMkid = result.rows[0].max_mkid;
            // 数値部分を抽出してインクリメント
            const numPart = parseInt(maxMkid.slice(1)); // 'M'を取り除いて数値部分を取得
            const nextNum = numPart + 1; // 数値をインクリメント

            // 次のmkidを生成（例: 'M0011'）
            nextMkid = 'M' + String(nextNum).padStart(4, '0');
        }

        res.render('newMarkerForm', { nextMkid }); // `nextMkid`をテンプレートに渡して表示
    });
});


module.exports = router;

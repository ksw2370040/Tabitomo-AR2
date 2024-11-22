const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https'); // httpsモジュールをインポート
const app = express();

// SSL証明書の読み込み
const privateKey = fs.readFileSync(path.join(__dirname, 'private-key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'certificate.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

// ルートをインポート
const markerRoutes2 = require('./routes/markerRoutes2');
const adminlogin = require('./routes/admin');
const newadmin = require('./routes/newAdmin');
const modellistRoutes = require('./routes/modellistRoutes');
const napisyRoutes = require('./routes/napisyRoutes');
const soundRoutes = require('./routes/soundRoutes');
const napisylistRoutes = require('./routes/napisylistRoutes');

// ボディパーサー設定
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// public フォルダを静的ファイルの提供場所として指定
app.use(express.static(path.join(__dirname, 'public')));

// APIエンドポイントを設定
app.use('/api', markerRoutes2);
app.use('/api', adminlogin);
app.use('/api', newadmin);
app.use('/modellist', modellistRoutes);
app.use('/napisy', napisyRoutes);
app.use('/sound', soundRoutes);
app.use('/napisylist', napisylistRoutes);

// HTTPSサーバーの起動
const PORT = 3000;
https.createServer(credentials, app).listen(PORT, '0.0.0.0', () => {
  console.log(`サーバーが https://3.238.65.121:${PORT} で起動しました`);
});
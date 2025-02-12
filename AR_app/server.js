// C:\Tabitomo-AR2\AR_app\server.js
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
const markerRoutes2 = require('./routes/markerRoutes2'); // markerRoutesをインポート
const adminlogin = require('./routes/admin'); // adminログインルートをインポート
const user = require('./routes/users'); // userログインルートをインポート
const newadmin = require('./routes/newAdmin'); // 新規adminルートをインポート
const modellistRoutes = require('./routes/modellistRoutes'); // モデルリストのルートをインポート
const napisyRoutes = require('./routes/napisyRoutes');
const soundRoutes = require('./routes/soundRoutes');
const napisylistRoutes = require('./routes/napisylistRoutes');
const soundlistRoutes = require('./routes/soundlistRoutes');
const locationRoutes = require('./routes/locationRoutes');
const locationdetailRoutes = require('./routes/locationdetailRoutes');
const locationaddRoutes = require('./routes/locationaddRoutes');
const locationeditRoutes = require('./routes/locationeditRoutes');
const modelsRoutes = require('./routes/modelsRoutes');
const multiAR = require('./routes/multiAR');
const get_locations = require('./routes/get_locations');

// ボディパーサー設定
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// public フォルダを静的ファイルの提供場所として指定
app.use(express.static(path.join(__dirname, 'public')));


// APIエンドポイントを設定
app.use('/api', markerRoutes2);  // /api/markerinfo2 にアクセスできるように設定
app.use('/api', adminlogin);     // /api/login エンドポイントが有効になります
app.use('/api', user);     // /api/login エンドポイントが有効になります
app.use('/api', newadmin);       // /api/newAdmin エンドポイントが有効になります
app.use('/modellist', modellistRoutes); // /modellist エンドポイントが有効になります
app.use('/napisy', napisyRoutes);
app.use('/sound', soundRoutes);
app.use('/napisylist', napisylistRoutes);
app.use('/soundlist', soundlistRoutes);
app.use('/location', locationRoutes);
app.use('/locationdetail', locationdetailRoutes);
app.use('/locationadd', locationaddRoutes);
app.use('/locationedit', locationeditRoutes);
app.use('/modelsRoutes', modelsRoutes);
app.use('/multiAR', multiAR);
app.use('/api', get_locations);

// HTTPSサーバーの起動
const PORT = 3000;
https.createServer(credentials, app).listen(PORT, '0.0.0.0', () => {
  console.log(`サーバーが https://3.239.66.141:${PORT} で起動しました`);
});
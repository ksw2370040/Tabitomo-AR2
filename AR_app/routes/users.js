// C:\Tabitomo-AR\AR_app\routes\users.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const connection = require('../config');
 
// ログインエンドポイント
router.post('/userlogin', (req, res) => {
    const { username, password } = req.body;

    // ユーザー情報取得クエリ（パスワードハッシュ含む）
    const query = 'SELECT * FROM users WHERE name = $1;';
    connection.query(query, [username], async (err, results) => {
        if (err) {
            console.error('データベースエラー:', err);
            return res.status(500).send('サーバーエラー');
        }

        if (results.rows.length === 0) {
            // ユーザーが存在しない場合
            return res.status(401).send('認証に失敗しました');
        }


        const user = results.rows[0];
        if (user.delflag === true) {
            return res.status(400).json({ message: 'このアカウントは削除されました' });
        }
        // パスワードの照合
        try {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                // 認証成功、useridとlanguagenameも返す
                res.json({
                    username: user.name,
                    userid: user.userid,
                    languagename: user.languagename
                });
            } else {
                // パスワードが一致しない場合
                res.status(401).send('認証に失敗しました');
            }
        } catch (compareError) {
            console.error('パスワード比較エラー:', compareError);
            res.status(500).send('サーバーエラー');
        }
    });
});


// ユーザー名の重複チェック
router.post('/check-username', async (req, res) => {
    const { username } = req.body;
    try {
      const result = await connection.query('SELECT * FROM users WHERE name = $1', [username]);
      if (result.rows.length > 0) {
        return res.json({ available: false });
      } else {
        return res.json({ available: true });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('サーバーエラー');
    }
  });
  
  
// 新規管理者登録エンドポイント
router.post('/newUser', async (req, res) => {
    const { username, password, passwordConfirm, languagename } = req.body;
 
    // パスワード確認
    if (password !== passwordConfirm) {
        return res.status(400).send('パスワードが一致しません');
    }
 
    try {
        // ユーザーが既に存在するか確認
        const checkAdminQuery = 'SELECT * FROM users WHERE name = $1';
        const checkResult = await connection.query(checkAdminQuery, [username]);
        if (checkResult.rows.length > 0) {
            return res.status(400).send('このユーザー名は既に使用されています');
        }
 
        // 最大useridを取得して新しいIDを生成
        const getMaxIdQuery = 'SELECT MAX(CAST(userid AS INT)) AS max_id FROM users';
        const maxIdResult = await connection.query(getMaxIdQuery);
        const maxId = maxIdResult.rows[0]?.max_id || 0; // NULLチェック
        const newId = (maxId + 1).toString().padStart(2, '0'); // 2桁にゼロ埋め
 
        // パスワードをハッシュ化
        const hashedPassword = await bcrypt.hash(password, 10);
 
        // 新規管理者のデータを登録
        const insertAdminQuery = `
            INSERT INTO users (userid, name, password, languagename, delflag)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await connection.query(insertAdminQuery, [newId, username, hashedPassword, languagename, false]);
 
        res.status(200).send('新規登録が成功しました');
    } catch (err) {
        console.error('サーバーエラー:', err);
        res.status(500).send('サーバーエラーが発生しました');
    }
});
// ユーザーの言語設定を更新するエンドポイント
router.post('/updatelanguage', (req, res) => {
    const { username, language } = req.body;
 
    if (!username || !language) {
        return res.status(400).send('ユーザー名と言語は必須です');
    }
 
    const query = 'UPDATE users SET languagename = $1 WHERE name = $2';
    connection.query(query, [language, username], (err, result) => {
        if (err) {
            console.error('データベースエラー:', err);
            return res.status(500).send('サーバーエラー');
        }
 
        if (result.rowCount > 0) {
            res.status(200).send('言語設定が更新されました');
        } else {
            res.status(404).send('ユーザーが見つかりません');
        }
    });
});
 
// ユーザー名変更エンドポイント（重複チェック追加）
router.post('/updateusername', async (req, res) => {
    const { username, newusername } = req.body;

    try {
        // 新しいユーザー名の重複チェック
        const checkUserQuery = 'SELECT * FROM users WHERE name = $1';
        const checkResult = await connection.query(checkUserQuery, [newusername]);
        if (checkResult.rows.length > 0) {
            return res.status(400).send('このユーザー名は既に使用されています');
        }

        // ユーザー名を更新
        const query = 'UPDATE users SET name = $1 WHERE name = $2';
        const result = await connection.query(query, [newusername, username]);

        if (result.rowCount > 0) {
            res.status(200).send({ status: 'success' });
        } else {
            res.status(404).send({ status: 'fail', message: 'ユーザーが見つかりません' });
        }
    } catch (err) {
        console.error('データベースエラー:', err);
        res.status(500).send('サーバーエラー');
    }
});

// アカウント削除（delflagをtrueに更新）
router.post('/deleteaccount', async (req, res) => {
    const { username } = req.body;

    try {
        const query = 'UPDATE users SET delflag = true WHERE name = $1';
        const result = await connection.query(query, [username]);

        if (result.rowCount > 0) {
            res.status(200).send({ status: 'success', message: 'アカウントが削除されました' });
        } else {
            res.status(404).send({ status: 'fail', message: 'ユーザーが見つかりません' });
        }
    } catch (err) {
        console.error('データベースエラー:', err);
        res.status(500).send('サーバーエラー');
    }
});

 
// パスワード変更エンドポイント
router.post('/changepassword', async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    try {
        const query = 'SELECT * FROM users WHERE name = $1';
        const { rows } = await connection.query(query, [username]);
 
        if (rows.length === 0) {
            return res.status(404).send('ユーザーが見つかりません');
        }
 
        const user = rows[0];
        const match = await bcrypt.compare(currentPassword, user.password);
 
        if (!match) {
            return res.status(401).send('現在のパスワードが間違っています');
        }
 
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const updateQuery = 'UPDATE users SET password = $1 WHERE name = $2';
        await connection.query(updateQuery, [hashedNewPassword, username]);
 
        // パスワード変更完了後にリダイレクト
        res.redirect(`/AR_user/mypage/changepasswordsuccess.html?username=${encodeURIComponent(username)}`);
    } catch (err) {
        console.error('エラー:', err);
        res.status(500).send('サーバーエラー');
    }
});
 
module.exports = router;

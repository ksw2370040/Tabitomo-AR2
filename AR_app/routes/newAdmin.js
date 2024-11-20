// newadmin.js
const express = require('express');
const router = express.Router();
const connection = require('../config');

// 新規管理者登録エンドポイント
router.post('/newadmin', (req, res) => {
    const { adminname, password, passwordConfirm } = req.body;

    // パスワード確認
    if (password !== passwordConfirm) {
        return res.status(400).send('パスワードが一致しません');
    }

    // 管理者名が既に存在するか確認
    const checkAdminQuery = 'SELECT * FROM ADMIN WHERE name = $1';
    connection.query(checkAdminQuery, [adminname], (err, results) => {
        if (err) {
            console.error('データベースエラー:', err);
            return res.status(500).send('サーバーエラー');
        }

        if (results.rows.length > 0) {
            return res.status(400).send('この管理者名は既に使用されています');
        }

        const getMaxIdQuery = 'SELECT MAX(CAST(id AS INT)) AS max_id FROM admin';
        connection.query(getMaxIdQuery, (err, result) => {
            if (err) {
                console.error('データベースエラー:', err);
                return res.status(500).send('サーバーエラー');
            }
        
            // 最大IDを取得 (max_idがnullの場合は0)
            const maxId = result.rows[0].max_id || 0;
        
            // 新しいIDは最大ID + 1
            const newId = maxId + 1;
        
            // 新しいIDをCHAR型に変換（ゼロ埋めして2桁に）
            const newIdChar = newId.toString().padStart(2, '0'); // 2桁にゼロ埋め

            // 新規管理者のデータを登録
            const insertAdminQuery = 'INSERT INTO admin (id, name, password) VALUES ($1, $2, $3)';
            connection.query(insertAdminQuery, [newId, adminname, password], (err, result) => {
                if (err) {
                    console.error('データベースエラー:', err);
                    return res.status(500).send('登録に失敗しました');
                }

                res.status(200).send('新規管理者の登録が成功しました');
            });
        });
    });
});

module.exports = router;

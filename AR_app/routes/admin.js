const express = require('express');
const router = express.Router();
const connection = require('../config');

// ログインエンドポイント
router.post('/login', (req, res) => {
    const { adminname, password } = req.body;
    const query = 'SELECT * FROM ADMIN WHERE name = $1 AND password = $2;';
    connection.query(query, [adminname, password], (err, results) => {
        if (err) {
            console.error('データベースエラー:', err);
            return res.status(500).send('サーバーエラー');
        }
        if (results.rows.length > 0) {
            res.redirect(`/AR_admin/menu.html?adminname=${encodeURIComponent(adminname)}`);
        } else {
            res.status(401).send('ユーザー名またはパスワードが間違っています');
        }
    });
});

// 管理者情報を取得（名前をキーにする）
router.get('/admins', async (req, res) => {
    try {
        const adminname = req.query.adminname;
        if (!adminname) {
            return res.status(400).send('adminnameが指定されていません');
        }

        const result = await connection.query('SELECT * FROM admin WHERE name = $1', [adminname]);

        if (result.rows.length === 0) {
            return res.status(404).send('管理者が見つかりません');
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('データ取得エラー');
    }
});

// 管理者削除エンドポイント
router.post('/admins/delete', async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).send('削除する管理者の名前が指定されていません');
    }

    try {
        // 削除処理を実行
        const result = await connection.query(
            `DELETE FROM admin WHERE name = $1 RETURNING *`, [name]
        );

        if (result.rowCount > 0) {
            // 削除成功
            res.json({ message: '管理者が削除されました' });
        } else {
            // 管理者が見つからない場合
            res.status(404).json({ error: '管理者が見つかりません' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'サーバーエラー' });
    }
});
router.post('/admins/update', async (req, res) => {
    const { name, password ,currentname} = req.body;

    if (!name || !password) {
        return res.status(400).json({ success: false, message: '必要なパラメータが不足しています' });
    }

    try {

        // 名前またはパスワードが変更された場合のみ更新
        const updateQuery = `UPDATE admin SET name = $1, password = $2 WHERE name = $3 RETURNING *`;
        const updatedResult = await connection.query(updateQuery, [name, password, currentname]);

        if (updatedResult.rowCount > 0) {
            return res.json({ success: true });
        } else {
            return res.status(404).json({ success: false, message: '管理者の更新に失敗しました' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'サーバーエラー' });
    }
});

module.exports = router;

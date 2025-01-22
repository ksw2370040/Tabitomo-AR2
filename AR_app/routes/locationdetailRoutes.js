// C:\Tabitomo-AR\AR_app\routes\locationdetailRoutes.js
const express = require('express');  // expressモジュールのインポート
const router = express.Router();     // express.Router() でルーターを定義
const connection = require('../config');  // PostgreSQLの接続設定
const fs = require('fs');
const path = require('path');


router.get('/', async (req, res) => {
    const locationid = req.query.locationid;

    if (!locationid) {
        return res.status(400).json({ error: 'locationidが指定されていません。' });
    }

    try {
        // MODEL2, sound, napisyテーブルを結合してデータ取得
        const query = `
            SELECT 
                m.mdlname,
                m.mdlid,
                m.mdlimage,
                m.mkname,
                m.patt,
                m.mkimage,
                m.mdlsound,
                m.mdltext,
                s.languagename,
                s.soundfile,
                n.napisyfile
            FROM 
                model2 m
            LEFT JOIN  
                sound s ON m.mdlsound = s.mdlsound 
            LEFT JOIN  
                napisy n ON m.mdltext = n.mdltext AND s.languagename = n.languagename
            WHERE 
                m.locationid = $1
            ORDER BY
                m.mdlid, s.languagename;
        `;

        const result = await connection.query(query, [locationid]);

        // データをJSON形式で返す
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'データの取得中にエラーが発生しました。' });
    }
});


router.delete('/modeldel', async (req, res) => {
    const locationid = req.query.locationid; // モデルID
    if (!locationid) {
        return res.status(400).send('モデルIDが指定されていません。');
    }

    try {
        // トランザクションの開始
        await connection.query('BEGIN');

        // 1. model2テーブルから関連データを取得
        const modelDataResult = await connection.query('SELECT mdlsound, mdltext, mdlimage, patt, mkimage FROM model2 WHERE locationid = $1', [locationid]);

        if (modelDataResult.rows.length === 0) {
            return res.status(404).send('指定されたモデルIDのデータが見つかりません。');
        }

        const { mdlsound, mdltext, mdlimage, patt, mkimage } = modelDataResult.rows[0];

        // 2. soundテーブルの関連データを削除
        if (mdlsound) {
            // 音声ファイルを削除
            const soundFiles = await connection.query('SELECT soundfile FROM sound WHERE mdlsound = $1', [mdlsound]);
            soundFiles.rows.forEach(file => {
                const soundFilePath = path.join(__dirname, '..', 'public', 'Content', 'sound', file.soundfile);
                if (fs.existsSync(soundFilePath)) {
                    fs.unlinkSync(soundFilePath); // ファイル削除
                    console.log(`音声ファイル削除: ${soundFilePath}`);
                }
            });
            const soundDeleteResult = await connection.query('DELETE FROM sound WHERE mdlsound = $1', [mdlsound]);
            console.log(`sound 削除: ${soundDeleteResult.rowCount} 件`);
        }


        // 3. napisyテーブルの関連データを削除
        if (mdltext) {
            // モデルテキストファイルを削除
            const textFiles = await connection.query('SELECT napisyfile FROM napisy WHERE mdltext = $1', [mdltext]);
            textFiles.rows.forEach(file => {
                const textFilePath = path.join(__dirname, '..', 'public', 'Content', 'napisy', file.napisyfile);
                if (fs.existsSync(textFilePath)) {
                    fs.unlinkSync(textFilePath); // ファイル削除
                    console.log(`モデルテキストファイル削除: ${textFilePath}`);
                }
            });
            const napisyDeleteResult = await connection.query('DELETE FROM napisy WHERE mdltext = $1', [mdltext]);
            console.log(`napisy 削除: ${napisyDeleteResult.rowCount} 件`);
        }

        // 4. model2テーブルからデータを削除
        const modelDeleteResult = await connection.query('DELETE FROM model2 WHERE locationid = $1', [locationid]);
        console.log(`model2 削除: ${modelDeleteResult.rowCount} 件`);

        // 5. 画像ファイルの削除
        if (mdlimage) {
            const mdlImagePath = path.join(__dirname, '..', 'public', 'Content', '.glb', mdlimage);
            if (fs.existsSync(mdlImagePath)) {
                fs.unlinkSync(mdlImagePath); // 画像ファイル削除
                console.log(`モデル画像削除: ${mdlImagePath}`);
            }
        }

        // 6. パターンファイルの削除
        if (patt) {
            const pattFilePath = path.join(__dirname, '..', 'public', 'Content', '.patt', patt);
            if (fs.existsSync(pattFilePath)) {
                fs.unlinkSync(pattFilePath); // パターンファイル削除
                console.log(`パターンファイル削除: ${pattFilePath}`);
            }
        }

        // 7. マーカー画像の削除
        if (mkimage) {
            const mkImagePath = path.join(__dirname, '..', 'public', 'Content', 'markerimage', mkimage);
            if (fs.existsSync(mkImagePath)) {
                fs.unlinkSync(mkImagePath); // マーカー画像削除
                console.log(`マーカー画像削除: ${mkImagePath}`);
            }
        }

        // 8. locationテーブルから関連データを削除
        await connection.query('DELETE FROM location WHERE locationid = $1', [locationid]);
        console.log(`location 削除`);

        // トランザクションのコミット
        await connection.query('COMMIT');

        res.status(200).json({ message: '関連データの削除が完了しました。' });
    } catch (error) {
        // エラーが発生した場合、ロールバック
        await connection.query('ROLLBACK');
        console.error('削除中にエラーが発生しました:', error);
        res.status(500).json({ message: '削除中にエラーが発生しました。' });
    }
});

module.exports = router;  // ルーターをエクスポート

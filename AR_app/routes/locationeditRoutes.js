const express = require('express');
const router = express.Router();
const connection = require('../config');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// ファイルアップロード設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const directoryMap = {
            'mdlimage': '/home/ec2-user/Tabitomo-AR2/AR_app/public/Content/.glb',
            'patt': '/home/ec2-user/Tabitomo-AR2/AR_app/public/Content/.patt',
            'mkimage': '/home/ec2-user/Tabitomo-AR2/AR_app/public/Content/markerimage'
            };
        cb(null, directoryMap[file.fieldname] || 'default/path');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now();
        const originalName = path.basename(file.originalname, path.extname(file.originalname));
        cb(null, `${originalName}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
    const mdlid = req.query.mdlid;
    if (!mdlid) {
        return res.status(400).json({ error: 'mdlIDが指定されていません。' });
    }

    try {
        const query = `
            SELECT 
                l.locationname, 
                l.address, 
                m.mdlname, 
                m.mdlimage, 
                m.mkname, 
                m.patt, 
                m.mkimage, 
                m.mdlid
            FROM model2 m
            JOIN location l ON m.locationid = l.locationid
            WHERE m.mdlid = $1;
        `;
        const result = await connection.query(query, [mdlid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '指定されたモデルIDが見つかりません。' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'データの取得中にエラーが発生しました。' });
    }
});

router.post('/edit', upload.fields([
    { name: 'mdlimage', maxCount: 1 },
    { name: 'patt', maxCount: 1 },
    { name: 'mkimage', maxCount: 1 }
]), async (req, res) => {
    const { mdlid, locationname, address, mdlname, mkname } = req.body;

    if (!mdlid || !locationname || !address || !mdlname || !mkname) {
        return res.status(400).json({ error: '必要な情報が不足しています。' });
    }

    try {
        // 既存のモデルデータを取得
        const existingModelQuery = `SELECT mdlimage, mkimage, patt FROM model2 WHERE mdlid = $1`;
        const existingModelResult = await connection.query(existingModelQuery, [mdlid]);
        const existingModel = existingModelResult.rows[0];

        // 画像やマーカー画像が変更されている場合、古いファイルを削除
        if (req.files['mdlimage']) {
            const oldMdlImagePath = path.join(__dirname, '..', 'public', 'Content', '.glb', existingModel.mdlimage);
            if (fs.existsSync(oldMdlImagePath)) {
                fs.unlinkSync(oldMdlImagePath); // 古い画像を削除
            }
        }

        if (req.files['mkimage']) {
            const oldMkImagePath = path.join(__dirname, '..', 'public', 'Content', 'markerimage', existingModel.mkimage);
            if (fs.existsSync(oldMkImagePath)) {
                fs.unlinkSync(oldMkImagePath); // 古いマーカー画像を削除
            }
        }

        if (req.files['patt']) {
            const oldPattFilePath = path.join(__dirname, '..', 'public', 'Content', '.patt', existingModel.patt);
            if (fs.existsSync(oldPattFilePath)) {
                fs.unlinkSync(oldPattFilePath); // 古いパターンファイルを削除
            }
        }

        // 新しいファイル名を取得
        const mdlimage = req.files['mdlimage'] ? req.files['mdlimage'][0].filename : existingModel.mdlimage;
        const mkimage = req.files['mkimage'] ? req.files['mkimage'][0].filename : existingModel.mkimage;
        const patt = req.files['patt'] ? req.files['patt'][0].filename : existingModel.patt;

        // モデル情報の更新
        const updateModelQuery = `
            UPDATE model2
            SET mdlname = $1, mdlimage = $2, mkname = $3, patt = $4, mkimage = $5
            WHERE mdlid = $6;
        `;
        await connection.query(updateModelQuery, [mdlname, mdlimage, mkname, patt, mkimage, mdlid]);

        // 場所情報の更新
        const updateLocationQuery = `
            UPDATE location
            SET locationname = $1, address = $2
            WHERE locationid = (SELECT locationid FROM model2 WHERE mdlid = $3);
        `;
        await connection.query(updateLocationQuery, [locationname, address, mdlid]);

        res.status(200).json({ message: 'データが更新されました。' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'データの更新中にエラーが発生しました。' });
    }
});

module.exports = router;

const express = require('express');
const axios = require('axios');  // Geocoding API用
const router = express.Router();
const connection = require('../config');  // データベース接続

// Geocoding.jp APIで住所を座標に変換する関数
async function getCoordinates(address) {
    try {
        const url = `https://www.geocoding.jp/api/?q=${encodeURIComponent(address)}`;
        const response = await axios.get(url, { timeout: 5000 }); // 5秒のタイムアウト
        const xml = response.data;

        // XMLをパース
        const latMatch = xml.match(/<lat>(.*?)<\/lat>/);
        const lonMatch = xml.match(/<lng>(.*?)<\/lng>/);

        if (latMatch && lonMatch) {
            return {
                latitude: parseFloat(latMatch[1]),
                longitude: parseFloat(lonMatch[1])
            };
        } else {
            console.warn(`座標取得失敗: ${address}`);
            return null;
        }
    } catch (error) {
        console.error(`Geocoding API エラー: ${address}`, error.message);
        return null;
    }
}

// 10秒ごとのリクエスト制限用
let lastRequestTime = 0;

// /get_locationsエンドポイント
router.get('/get_locations', async (req, res) => {
    try {
        const query = 'SELECT locationid,locationname, address FROM location';  // locationテーブルから住所を取得

        // データベースから情報を取得
        connection.query(query, async (err, result) => {
            if (err) {
                console.error('データベースエラー:', err);
                return res.status(500).json({ error: 'データベースから情報を取得できませんでした' });
            }

            const locations = [];

            for (const location of result.rows) {
                const now = Date.now();
                if (now - lastRequestTime < 10000) { // 10秒待機
                    await new Promise(resolve => setTimeout(resolve, 10000 - (now - lastRequestTime)));
                }

                lastRequestTime = Date.now(); // リクエスト時刻を更新

                const coords = await getCoordinates(location.address);
                if (coords) {
                    locations.push({
                        locationid: location.locationid,
                        locationNAME: location.locationname,
                        address: location.address,
                        latitude: coords.latitude,
                        longitude: coords.longitude
                    });
                }
            }

            res.json(locations);
        });
    } catch (error) {
        console.error('サーバーエラー:', error);
        res.status(500).json({ error: 'データ取得中にエラーが発生しました' });
    }
});

module.exports = router;

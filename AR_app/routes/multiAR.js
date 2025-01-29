const express = require('express');
const path = require('path');
const router = express.Router();
const connection = require('../config'); // DB接続設定

// 静的ファイルの提供
const publicDirectory = path.join(__dirname, '..', 'public');
router.use('/Content', express.static(path.join(publicDirectory, 'Content')));

// ARコンテンツを返すエンドポイント
router.get('/', async (req, res) => {
    const languagename = req.query.languagename || '日本語';  // パラメーターが無ければデフォルトを設定

    try {
        const query = `
            SELECT 
                m.mdlid,           -- 3DモデルID
                m.mdlimage,        -- 3Dモデルファイル名（.glb）
                m.patt,            -- マーカーパターンファイル名（.patt）
                s.soundfile,       -- 音声ファイル
                n.napisyfile       -- 字幕ファイル
            FROM 
                model2 m
            LEFT JOIN  
                sound s ON m.mdlsound = s.mdlsound AND s.languagename = $1
            LEFT JOIN  
                napisy n ON m.mdltext = n.mdltext AND n.languagename = $1
            ORDER BY
                m.mdlid;
        `;
        
        const result = await connection.query(query, [languagename]);

        const modelHtml = [];
        const markerHtml = [];
        const audioHtml = [];
        const subtitleHtml = [];

        result.rows.forEach((data, index) => {
            // モデルとマーカーのHTMLを生成
            modelHtml.push(`<a-asset-item id="animated-asset-${index}" src="../Content/.glb/${data.mdlimage}" onerror="console.error('Failed to load GLB file: ${data.mdlimage}');"></a-asset-item>`);
            markerHtml.push(`
                <a-marker id="animated-marker-${index}" type="pattern" preset="custom" url="../Content/.patt/${data.patt}"
                          raycaster="objects: .clickable" emitevents="true" cursor="fuse: false; rayOrigin: mouse;">
                    <a-entity id="model-${index}" scale="1 1 1" animation-mixer="loop: repeat" gltf-model="#animated-asset-${index}" class="clickable"
                              animation="property: rotation; to: 0 360 0; dur: 3600; easing: linear; loop: true" gesture-handler
                              visible="false"></a-entity>
                </a-marker>
            `);

            // 音声があれば追加
            if (data.soundfile) {
                audioHtml.push(`../Content/sound/${data.soundfile}`);
            }

            // 字幕があれば追加
            if (data.napisyfile) {
                subtitleHtml.push(`../Content/zimaku/${data.napisyfile}`);
            }
        });

        res.json({ modelHtml, markerHtml, audioHtml, subtitleHtml });

    } catch (error) {
        console.error('ARコンテンツ取得エラー:', error);
        res.status(500).send('Error retrieving AR content.');
    }
});

module.exports = router;

const express = require('express');
const path = require('path');
const router = express.Router();
const connection = require('../config'); // DB接続の設定

// 静的ファイルの提供
const publicDirectory = path.join(__dirname, '..', 'public');

// ファイルへのパスを正しく設定
router.use('/Content', express.static(path.join(publicDirectory, 'Content')));

// 言語名を直接取得して、それを条件にデータを取得するエンドポイント
router.get('/', async (req, res) => {
    const languagename = req.query.languagename;  // URLパラメーターからlanguagenameを取得

    if (!languagename) {
        return res.status(400).json({ error: 'languagenameパラメーターが必要です' });
    }

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

        // 生成したHTMLコードを格納する変数
        let modelHtml = '';
        let markerHtml = '';
        let audioHtml = '';
        let subtitleHtml = '';

        // 結果を元にHTMLを生成
        result.rows.forEach(data => {
            // モデルのHTMLを生成 (a-assets内に格納)
            modelHtml += `<a-asset-item id="${data.mdlid}" src="../Content/.glb/${data.mdlimage}"></a-asset-item>`;
            
            // マーカーのHTMLを生成
            markerHtml += `
                <a-marker id="animated-marker-${data.mdlid}" type="pattern" preset="custom" url="../Content/.patt/${data.patt}"
                          raycaster="objects: .clickable" emitevents="true" cursor="fuse: false; rayOrigin: mouse;">
                    <a-entity id="model-${data.mdlid}" scale="1 1 1" animation-mixer="loop: repeat" gltf-model="#${data.mdlid}" class="clickable"
                              animation="property: rotation; to: 0 360 0; dur: 3600; easing: linear; loop: true" gesture-handler
                              visible="false"></a-entity>
                </a-marker>
            `;

            // 音声ファイルが存在する場合、audio要素を作成
            if (data.soundfile) {
                audioHtml += `<audio id="audio-${data.mdlid}" src="../Content/.mp3/${data.soundfile}" preload="auto"></audio>`;
            }
            
            // 字幕ファイルが存在する場合、字幕のHTMLを作成
            if (data.napisyfile) {
                subtitleHtml += `<div id="subtitle-${data.mdlid}" class="subtitle">${data.napisyfile}</div>`;
            }
        });

        // モデルHTML、マーカーHTML、音声、字幕HTMLをレスポンスとして返す
        res.json({
            modelHtml,
            markerHtml,
            audioHtml: audioHtml || null,  // 音声がない場合はnullを返す
            subtitleHtml: subtitleHtml || null  // 字幕がない場合はnullを返す
        });
    } catch (error) {
        console.error('データの取得中にエラーが発生しました:', error);
        res.status(500).json({ error: 'データの取得中にエラーが発生しました。' });
    }
});

module.exports = router;

const express = require('express');
const path = require('path');
const router = express.Router();
const connection = require('../config');

router.use('/Content', express.static(path.join(__dirname, '..', 'public', 'Content')));

router.get('/', async (req, res) => {
    const languagename = req.query.languagename || '日本語';

    try {
        const query = `
            SELECT m.mdlid, m.mdlimage, m.patt, s.soundfile, n.napisyfile
            FROM model2 m
            LEFT JOIN sound s ON m.mdlsound = s.mdlsound AND s.languagename = $1
            LEFT JOIN napisy n ON m.mdltext = n.mdltext AND n.languagename = $1
            ORDER BY m.mdlid;
        `;
        
        const result = await connection.query(query, [languagename]);

        const modelHtml = result.rows.map(data => 
            `<a-asset-item id="animated-asset-${data.mdlid}" src="../Content/.glb/${data.mdlimage}"></a-asset-item>`
        );

        const markerHtml = result.rows.map(data => `
            <a-marker id="animated-marker-${data.mdlid}" type="pattern" preset="custom" url="../Content/.patt/${data.patt}">
                <a-entity id="model-${data.mdlid}" scale="1 1 1" gltf-model="#animated-asset-${data.mdlid}" visible="false"></a-entity>
            </a-marker>
        `);

        const audioHtml = result.rows.map(data => data.soundfile ? `../Content/sound/${data.soundfile}` : null).filter(Boolean);
        const subtitleHtml = result.rows.map(data => data.napisyfile ? `../Content/zimaku/${data.napisyfile}` : null).filter(Boolean);

        res.json({ modelHtml, markerHtml, audioHtml, subtitleHtml });
    } catch (error) {
        console.error('ARコンテンツ取得エラー:', error);
        res.status(500).send('Error retrieving AR content.');
    }
});

module.exports = router;

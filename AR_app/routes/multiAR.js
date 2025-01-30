// routes/multiAR.js
const express = require('express');
const router = express.Router();
const connection = require('../config');  // データベース接続設定

router.get('/', async (req, res) => {
    const languagename = req.query.languagename || '日本語';

  try {
    const query = `
    SELECT 
      mdl2.mdlID, mdl2.mkname, mdl2.patt, mdl2.mkimage, mdl2.mdlname, mdl2.mdlimage, 
      sound.mdlsound, napisy.mdltext
    FROM MODEL2 mdl2
    JOIN sound ON mdl2.mdlsound = sound.mdlsound
    JOIN napisy ON mdl2.mdltext = napisy.mdltext
    WHERE sound.languagename = $1 AND napisy.languagename = $1
  `;
  
    const result = await connection.query(query, [languagename]);

    const markers = result.rows.map(row => ({
      id: row.mkname,
      patt: `/Content/.patt/${row.patt}`,            // パターンファイルのパス
      model: `/Content/.glb/${row.mdlimage}`,        // 3Dモデルのファイルパス
      audio: `/Content/sound/${row.mdlsound}`,   // 音声ファイルのパス
      subtitle: `/Content/napisy/${row.mdltext}`, // 字幕ファイルのパス
      audioId: `audio-${row.mkname}`,
      subtitleId: `subtitle-${row.mkname}`
    }));

    res.json(markers);
  } catch (err) {
    console.error('Error fetching markers:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;

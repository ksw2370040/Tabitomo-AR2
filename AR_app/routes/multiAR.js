const express = require('express');
const router = express.Router();
const connection = require('../config');  // データベース接続設定

router.get('/', async (req, res) => {
  const languagename = req.query.languagename || '日本語';

  try {
    const query = `
      SELECT 
        mdl2.mdlID, mdl2.mkname, mdl2.patt, mdl2.mkimage, mdl2.mdlname, mdl2.mdlimage, 
        sound.mdlsound, sound.soundfile, 
        napisy.mdltext, napisy.napisyfile
      FROM MODEL2 mdl2
      LEFT JOIN sound ON mdl2.mdlsound = sound.mdlsound
      LEFT JOIN napisy ON mdl2.mdltext = napisy.mdltext
      WHERE sound.languagename = $1 AND napisy.languagename = $1
    `;
    
    const result = await connection.query(query, [languagename]);

    const markers = result.rows.map(row => ({
      id: row.mkname,
      patt: `/Content/.patt/${row.patt}`,            // パターンファイルのパス
      model: `/Content/.glb/${row.mdlimage}`,        // 3Dモデルのファイルパス
      audio: row.soundfile ? `/Content/sound/${row.soundfile}` : null,   // 音声ファイルのパス（存在しない場合はnull）
      subtitle: row.napisyfile ? `/Content/napisy/${row.napisyfile}` : null, // 字幕ファイルのパス（存在しない場合はnull）
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

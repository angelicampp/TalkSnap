import { Router } from 'express'
import path from 'path'

import upload from '../middlewares/upload.middleware.js'
import convertVideotoMp3 from '../utils/convertToAudio.js';
import convertToScript from '../utils/convertToScript.js';
import { summarize } from '../utils/deepseek.js';

const router = Router()

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Archivo no válido. Solo se aceptan .mp3 y .mp4' });
  }

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked");

  let mp3File = req.file.path

  const ext = path.extname(req.file.filename)
  if (ext === '.mp4' || ext === '.avi' || ext === '.mov') {
    res.write("Convirtiendo archivo a .mp3/n")
    mp3File = await convertVideotoMp3(req.file)
  }

  res.write("Extrayendo transcripción/n")
  const transcript = await convertToScript(mp3File, req.body.lang)
  res.write(transcript + '/n')

  res.write("Resumiendo transcripción/n")
  const summary = await summarize(req.body.lang, transcript)
  res.write(summary + '/n')

  res.end()
});

export default router

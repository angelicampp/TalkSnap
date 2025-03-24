import { Router } from 'express'
import path from 'path'

import upload from '../middlewares/upload.middleware.js'
import convertVideotoMp3 from '../utils/convertToAudio.js';
import convertToScript from '../utils/convertToScript.js';

const router = Router()

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Archivo no válido. Solo se aceptan .mp3 y .mp4' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Enviar los encabezados inmediatamente

  let mp3File = req.file

  const ext = path.extname(req.file.filename)
  if (ext === '.mp4' || ext === '.avi' || ext === '.mov') {
    res.write("Convirtiendo archivo a .mp3")
    mp3File = convertVideotoMp3(req.file)
  }

  const transcript = await convertToScript(mp3File, req.body.lang)
  console.log(transcript)

  res.write("Transcripcion")
  res.end()
});

router.get('/history', (req, res) => {
  res.json({ message: 'Lista de productos' });
});

export default router

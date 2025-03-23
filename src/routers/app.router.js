import { Router } from 'express'
import upload from '../middlewares/upload.middleware.js'

const router = Router()

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Archivo no válido. Solo se aceptan .mp3 y .mp4' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Enviar los encabezados inmediatamente

  res.write("Iniciando procesamiento")
  console.log(req.file.filename)

  res.write("Transcripcion")
  res.end()
});

router.get('/history', (req, res) => {
  res.json({ message: 'Lista de productos' });
});

export default router

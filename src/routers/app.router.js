import { Router } from 'express'
import path from 'path'

import upload from '../middlewares/upload.middleware.js'
import convertVideotoMp3 from '../utils/convertToAudio.js';
import convertToScript from '../utils/convertToScript.js';
import { summarize } from '../utils/deepseek.js';
import { connectToDatabase } from '../utils/Mongodb.js';
import { saveHistory } from '../utils/UploadHistory.js';
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
  // Guardar en la base de datos
  const transcriptionData = {
    Titulo: req.file.filename,
    Resumen:summary,
    Idioma: req.body.lang,
    Fecha: new Date().toISOString()
    };
  const save=saveHistory(transcriptionData)
  res.write(save.message + '/n')
  res.end()
});

// Obtener todas las transcripciones
router.get('/transcripciones', async (req, res) => {
  try {
    // Conectar a la base de datos
    const { db } = await connectToDatabase();
    const collection = db.collection('History');

    // Obtener todos los documentos
    const transcripciones = await collection.find({}).toArray();

    res.status(200).json({ data: transcripciones });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las transcripciones' });
  }
});
export default router

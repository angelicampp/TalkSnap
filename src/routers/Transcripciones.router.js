import express from 'express';
import { connectToDatabase } from '../utils/Mongodb.js';

const router = express.Router();

// Guardar una nueva transcripción
router.post('/transcripciones', async (req, res) => {
  try {
    const { Titulo, Fecha, Idioma, Resumen } = req.body;

    // Conectar a la base de datos
    const { db } = await connectToDatabase();
    const collection = db.collection('History');

    // Insertar el documento
    const result = await collection.insertOne({ Titulo, Fecha, Idioma, Resumen });

    res.status(201).json({ message: 'Transcripción guardada', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar la transcripción' });
  }
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

export default router;
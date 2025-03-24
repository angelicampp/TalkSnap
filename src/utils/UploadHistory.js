import { connectToDatabase } from './Mongodb.js';

//subir historial
export async function saveHistory(transcriptionData) {
  try {
    // Conectar a la base de datos
    const { db } = await connectToDatabase();
    const collection = db.collection('History');
    //insertar un documento
    const result = await collection.insertOne(transcriptionData);
    
    return {
      success: true,
      message: 'Transcripción guardada exitosamente',
      insertedId: result.insertedId
    };
  } catch (error) {
    console.error('Error al guardar transcripción:', error);
    return {
      success: false,
      message: 'Error al guardar la transcripción',
      error: error.message
    };
  }
}
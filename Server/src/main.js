import express from 'express'
import appRouter from './routers/app.router.js'
import cors from 'cors'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Habilita CORS
app.use(express.json()); // Habilita JSON parsing en las solicitudes
app.use('/', appRouter); // Habilita las rutas de la API

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

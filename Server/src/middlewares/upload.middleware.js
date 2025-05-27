import multer from 'multer';
import path from 'path';
import { fileURLToPath } from "url";

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads')); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para evitar duplicados
  }
});

// Validar tipo de archivo
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.mp3', '.mp4'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos .mp3 y .mp4'), false);
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // Limite de 50MB
});

export default upload

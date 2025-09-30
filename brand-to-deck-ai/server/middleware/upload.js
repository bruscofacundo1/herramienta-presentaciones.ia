// server/middleware/upload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const createError = require('../utils/create-error');

const UPLOAD_DIR = path.join(__dirname, '../uploads/brand-manuals');
fs.ensureDirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${uuidv4().split('-')[0]}`;
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(createError('Formato de archivo no válido. Solo se permiten archivos PDF.', 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // Límite de 50MB
  }
});

const uploadBrandManual = upload.single('brandManual');

const validateUpload = (req, res, next) => {
  if (!req.file) {
    return next(createError('No se ha subido ningún archivo.', 400));
  }
  req.uploadInfo = {
    uploadTimestamp: new Date().toISOString()
  };
  next();
};

const cleanupOnError = (err, req, res, next) => {
  if (req.file && req.file.path) {
    fs.unlink(req.file.path, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Error al limpiar el archivo después de un error:', unlinkErr);
      }
    });
  }
  next(err);
};

module.exports = {
  uploadBrandManual,
  validateUpload,
  cleanupOnError
};
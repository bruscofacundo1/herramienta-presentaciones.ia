// server/routes/upload.js

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { uploadBrandManual, validateUpload, cleanupOnError } = require('../middleware/upload');
const { getFileInfo } = require('../utils/file-utils');
const createError = require('../utils/create-error');
const pdfParser = require('../services/pdfParser');
const brandExtractor = require('../services/brandExtractor');

router.post('/brand-manual', 
  uploadBrandManual, // Aseguramos que multer procese el archivo primero
  validateUpload,
  asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) {
      // Esto debería ser capturado por validateUpload, pero es una doble verificación
      throw createError('No se encontró archivo para procesar después de la subida.', 400);
    }

    const fileInfo = getFileInfo(file);
    
    console.log(`📄 Parseando PDF (info básica): ${file.filename}`);
    console.log(`Debug: Ruta del archivo en upload.js: ${file.path}`); // Añadir log para depuración
    const parsedData = await pdfParser.parsePDF(file.path);
    
    console.log('🎨 Extrayendo configuración de marca con Gemini...');
    const brandConfigResult = await brandExtractor.extractBrandConfiguration(parsedData.data, file.path);
    
    res.status(200).json({
      success: true,
      message: 'Manual de marca procesado exitosamente con IA',
      data: {
        file: fileInfo,
        parsing: {
            pages: parsedData.data.totalPages,
            words: parsedData.data.statistics.totalWords
        },
        brandConfig: brandConfigResult.brandConfig,
        confidence: brandConfigResult.confidence
      }
    });
  }),
  cleanupOnError
);

module.exports = router;


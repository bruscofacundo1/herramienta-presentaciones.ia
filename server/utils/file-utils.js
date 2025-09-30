// server/utils/file-utils.js

const path = require('path');

/**
 * Extrae y formatea la información relevante de un archivo subido por Multer.
 * @param {object} file - El objeto 'file' de Multer.
 * @returns {object} Un objeto con la información formateada del archivo.
 */
const getFileInfo = (file) => {
  if (!file) {
    return null;
  }

  const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);

  return {
    originalName: file.originalname,
    mimetype: file.mimetype,
    filename: file.filename,
    size: file.size,
    sizeInMB: `${fileSizeInMB} MB`,
    path: file.path,
    extension: path.extname(file.originalname).toLowerCase(),
  };
};

module.exports = {
  getFileInfo,
};
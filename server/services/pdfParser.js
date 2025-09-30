// server/services/pdfParser.js

const fs = require("fs").promises;
const pdf = require("pdf-parse");

/**
 * Parsea un archivo PDF y extrae su contenido de texto y metadatos.
 * @param {string} filePath - La ruta al archivo PDF.
 * @returns {Promise<object>} Una promesa que se resuelve con los datos parseados del PDF.
 */
const parsePDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);

    // Estructuramos la salida para que sea consistente con lo que el resto de la app espera
    return {
      success: true,
      data: {
        totalPages: data.numpages,
        text: data.text,
        metadata: data.metadata,
        // Añadimos estadísticas para mantener la compatibilidad con el resto del código
        statistics: {
          totalPages: data.numpages,
          totalWords: data.text.split(/\s+/).length,
          uniqueColors: [], // pdf-parse no extrae colores
          uniqueFonts: [], // pdf-parse no extrae fuentes directamente
        },
      },
    };
  } catch (error) {
    console.error("Error al parsear el PDF:", error);
    // Lanzamos el error para que sea capturado por el manejador de errores de Express
    throw new Error(`Error al procesar el archivo PDF: ${error.message}`);
  }
};

module.exports = {
  parsePDF,
};

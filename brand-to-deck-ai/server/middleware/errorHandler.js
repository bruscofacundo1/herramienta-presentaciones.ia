// server/middleware/errorHandler.js

/**
 * Middleware de manejo de errores centralizado.
 * Captura todos los errores que ocurren en la aplicación.
 */
const errorHandler = (err, req, res, next) => {
  // Si el error tiene un código de estado definido, úsalo. Si no, es un error interno (500).
  const statusCode = err.statusCode || 500;

  // Loguear el error en la consola del servidor para depuración
  console.error(`❌ [ERROR] ${statusCode} - ${err.message}\n`, err.stack);

  // Crear una respuesta de error estandarizada para el cliente
  const errorResponse = {
    error: true,
    message: err.message || 'Ocurrió un error inesperado en el servidor.',
  };

  // Enviar la respuesta de error
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
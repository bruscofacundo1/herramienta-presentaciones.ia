// server/utils/create-error.js

/**
 * Crea un objeto de error estandarizado.
 * @param {string} message - El mensaje de error.
 * @param {number} statusCode - El código de estado HTTP.
 * @returns {Error} Un objeto de error con el mensaje y el código de estado.
 */
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = createError;
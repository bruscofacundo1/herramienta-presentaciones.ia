// server/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Importar rutas y middlewares locales
const uploadRoutes = require('./routes/upload');
const brandRoutes = require('./routes/brand');
const presentationRoutes = require('./routes/presentation');
const errorHandler = require('./middleware/errorHandler'); // Ahora sí exporta una función

// Inicializar la aplicación Express
const app = express();

// --- Middlewares Esenciales ---
app.use(cors());
app.use(helmet());
app.use(express.json());

// --- Definición de Rutas ---
app.get('/api', (req, res) => {
  res.json({ message: '¡Bienvenido a la API de Brand-to-Deck AI!' });
});

// Usar las rutas importadas
app.use('/api/upload', uploadRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/presentation', presentationRoutes);

// --- Manejo de Errores ---
app.use(errorHandler); // Ahora sí es una función de middleware válida

// --- Iniciar el Servidor ---
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`🔗 URL local: http://localhost:${PORT}`);
});

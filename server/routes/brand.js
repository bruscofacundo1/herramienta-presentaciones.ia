// server/routes/brand.js

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const createError = require('../utils/create-error');

// Simulamos una base de datos en memoria para las configuraciones de marca
let brandConfigs = new Map();
let configIdCounter = 1;

/**
 * Crear o actualizar configuración de marca
 */
router.post('/config', asyncHandler(async (req, res) => {
  const { brandConfig, source = 'manual' } = req.body;
  
  if (!brandConfig) {
    throw createError('Se requiere configuración de marca', 400);
  }

  const configId = configIdCounter++;
  const config = {
    id: configId,
    brandConfig,
    source,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  brandConfigs.set(configId, config);

  res.status(201).json({
    success: true,
    message: 'Configuración de marca creada exitosamente',
    data: {
      configId,
      config
    }
  });
}));

/**
 * Obtener configuración de marca por ID
 */
router.get('/config/:configId', asyncHandler(async (req, res) => {
  const configId = parseInt(req.params.configId);
  const config = brandConfigs.get(configId);

  if (!config) {
    throw createError('Configuración de marca no encontrada', 404);
  }

  res.json({
    success: true,
    data: config
  });
}));

/**
 * Actualizar configuración de marca
 */
router.put('/config/:configId', asyncHandler(async (req, res) => {
  const configId = parseInt(req.params.configId);
  const { brandConfig } = req.body;
  
  const existingConfig = brandConfigs.get(configId);
  if (!existingConfig) {
    throw createError('Configuración de marca no encontrada', 404);
  }

  const updatedConfig = {
    ...existingConfig,
    brandConfig,
    updatedAt: new Date().toISOString()
  };

  brandConfigs.set(configId, updatedConfig);

  res.json({
    success: true,
    message: 'Configuración de marca actualizada exitosamente',
    data: updatedConfig
  });
}));

/**
 * Eliminar configuración de marca
 */
router.delete('/config/:configId', asyncHandler(async (req, res) => {
  const configId = parseInt(req.params.configId);
  
  if (!brandConfigs.has(configId)) {
    throw createError('Configuración de marca no encontrada', 404);
  }

  brandConfigs.delete(configId);

  res.json({
    success: true,
    message: 'Configuración de marca eliminada exitosamente'
  });
}));

/**
 * Listar todas las configuraciones de marca
 */
router.get('/configs', asyncHandler(async (req, res) => {
  const configs = Array.from(brandConfigs.values());

  res.json({
    success: true,
    data: {
      configs,
      total: configs.length
    }
  });
}));

/**
 * Validar configuración de marca
 */
router.post('/validate', asyncHandler(async (req, res) => {
  const { brandConfig } = req.body;
  
  if (!brandConfig) {
    throw createError('Se requiere configuración de marca para validar', 400);
  }

  // Validaciones básicas
  const errors = [];
  
  if (!brandConfig.brand_name) {
    errors.push('Nombre de marca es requerido');
  }
  
  if (!brandConfig.colors || brandConfig.colors.length === 0) {
    errors.push('Al menos un color es requerido');
  }
  
  if (!brandConfig.typography || brandConfig.typography.length === 0) {
    errors.push('Al menos una tipografía es requerida');
  }

  const isValid = errors.length === 0;

  res.json({
    success: true,
    data: {
      isValid,
      errors,
      warnings: []
    }
  });
}));

/**
 * Obtener plantillas de marca predefinidas
 */
router.get('/templates', asyncHandler(async (req, res) => {
  const templates = [
    {
      id: 'corporate',
      name: 'Corporativo',
      description: 'Plantilla para empresas corporativas',
      colors: [
        { name: 'Primario', hex: '#2c3e50', type: 'primary' },
        { name: 'Acento', hex: '#3498db', type: 'accent' }
      ],
      typography: [
        { element: 'title', font_family: 'Arial', font_style: 'Bold' }
      ]
    },
    {
      id: 'modern',
      name: 'Moderno',
      description: 'Plantilla con diseño moderno y minimalista',
      colors: [
        { name: 'Primario', hex: '#1a1a1a', type: 'primary' },
        { name: 'Acento', hex: '#ff6b6b', type: 'accent' }
      ],
      typography: [
        { element: 'title', font_family: 'Helvetica', font_style: 'Light' }
      ]
    }
  ];

  res.json({
    success: true,
    data: templates
  });
}));

module.exports = router;
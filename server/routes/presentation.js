// server/routes/presentation.js

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { PPTXGeneratorService } = require('../services/pptxGenerator');
const createError = require('../utils/create-error');

// Instancia del generador de presentaciones
const pptxGenerator = new PPTXGeneratorService();

// Ruta para generar una presentación
router.post('/generate', asyncHandler(async (req, res) => {
  const { content, brandConfig, options = {} } = req.body;

  // Validar datos requeridos
  if (!brandConfig) {
    throw createError('Configuración de marca requerida', 400);
  }

  console.log('🎨 Generando presentación PPTX...');
  
  let parsedContent;
  
  // Si hay contenido, parsearlo
  if (content) {
    parsedContent = pptxGenerator.parseStructuredContent(content);
  }
  // Si hay un prompt en las opciones, usarlo
  else if (options.prompt) {
    parsedContent = pptxGenerator.parseStructuredContent(options.prompt);
  }
  // Si no hay contenido ni prompt, error
  else {
    throw createError('Contenido o prompt requerido para generar presentación', 400);
  }

  // Generar presentación
  const result = await pptxGenerator.generatePresentation(parsedContent, brandConfig);

  res.status(200).json({
    success: true,
    message: 'Presentación generada exitosamente',
    ...result
  });
}));

// Ruta para obtener vista previa de presentación
router.post('/preview', asyncHandler(async (req, res) => {
  const { content, brandConfig } = req.body;

  if (!content) {
    throw createError('Contenido requerido para vista previa', 400);
  }

  // Parsear contenido para vista previa
  const parsedContent = pptxGenerator.parseStructuredContent(content);

  res.status(200).json({
    success: true,
    preview: parsedContent,
    slideCount: parsedContent.slides?.length || 0
  });
}));

// Ruta para parsear contenido estructurado
router.post('/parse-content', asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw createError('Contenido requerido para parsear', 400);
  }

  const parsedContent = pptxGenerator.parseStructuredContent(content);

  res.status(200).json({
    success: true,
    parsed: parsedContent
  });
}));

// Ruta para obtener plantillas de contenido
router.get('/templates', asyncHandler(async (req, res) => {
  const templates = [
    {
      id: 'business-proposal',
      name: 'Propuesta de Negocio',
      description: 'Plantilla para propuestas comerciales',
      content: `# Propuesta de Negocio
## Resumen Ejecutivo
Descripción general de la propuesta y objetivos principales.

## Problema
- Identificación del problema o necesidad
- Impacto en el mercado
- Oportunidad de mejora

## Solución Propuesta
Descripción detallada de la solución que ofrecemos.

## Beneficios
- Beneficio principal 1
- Beneficio principal 2
- Beneficio principal 3

## Implementación
Plan de implementación y cronograma.

## Inversión
Detalles de la inversión requerida y retorno esperado.`
    },
    {
      id: 'company-overview',
      name: 'Presentación Corporativa',
      description: 'Plantilla para presentaciones institucionales',
      content: `# Nuestra Empresa
## Quiénes Somos
Misión, visión y valores de la organización.

## Historia
Breve reseña histórica y hitos importantes.

## Servicios
- Servicio principal 1
- Servicio principal 2
- Servicio principal 3

## Equipo
Presentación del equipo directivo y colaboradores clave.

## Logros
Principales logros y reconocimientos obtenidos.

## Contacto
Información de contacto y próximos pasos.`
    }
  ];

  res.status(200).json({
    success: true,
    templates
  });
}));

// Ruta para prueba simple de generación
router.post('/test-simple', asyncHandler(async (req, res) => {
  try {
    console.log("🧪 Iniciando prueba simple de generación...");
    
    const PptxGenJS = require("pptxgenjs");
    let pptx = new PptxGenJS();
    
    console.log("✅ PptxGenJS inicializado para prueba");
    
    pptx.addSlide().addText("Hola Mundo! - Prueba Exitosa", { 
      x: 1.5, 
      y: 1.5, 
      fontSize: 18, 
      color: "363636" 
    });
    
    console.log("✅ Diapositiva de prueba creada");
    
    const fileName = `test-simple-${Date.now()}.pptx`;
    const filePath = `./generated/${fileName}`;
    
    // Asegurar directorio
    const fs = require("fs-extra");
    await fs.ensureDir("./generated");
    
    await pptx.writeFile({ fileName: filePath });
    
    console.log("✅ Archivo de prueba guardado en:", filePath);
    
    // Verificar archivo
    const exists = await fs.pathExists(filePath);
    if (!exists) {
      throw new Error('No se pudo crear el archivo de prueba');
    }
    
    const stats = await fs.stat(filePath);
    
    res.status(200).json({
      success: true,
      message: "Test simple completado exitosamente",
      filePath: filePath,
      fileName: fileName,
      fileSize: stats.size,
      fileSizeFormatted: `${(stats.size / 1024).toFixed(2)} KB`
    });
    
  } catch (error) {
    console.error("❌ Error en test simple:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
}));

module.exports = router;
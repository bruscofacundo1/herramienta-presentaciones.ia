// server/routes/presentation.js

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { PPTXGeneratorService } = require('../services/pptxGenerator');
const { AIContentGenerator } = require('../services/aiContentGenerator');
const createError = require('../utils/create-error');

// Instancia del generador de presentaciones
const pptxGenerator = new PPTXGeneratorService();
// Instancia del generador de contenido con IA
const aiContentGenerator = new AIContentGenerator();

// Ruta para generar una presentación
router.post('/generate', asyncHandler(async (req, res) => {
  const { content, brandConfig, options = {} } = req.body;

  console.log('🚀 Recibida petición de generación de presentación');
  console.log('📝 Contenido recibido:', typeof content, content ? 'presente' : 'ausente');
  console.log('🎯 Configuración de marca:', typeof brandConfig, brandConfig ? 'presente' : 'ausente');
  console.log('📋 Datos del body completo:', JSON.stringify({ 
    contentLength: content?.length || 0, 
    brandConfigKeys: brandConfig ? Object.keys(brandConfig) : [],
    options 
  }, null, 2));

  // Validar datos requeridos
  if (!content && !options.prompt) {
    console.error('❌ Error: Contenido o prompt requerido para generar presentación');
    return res.status(400).json({
      success: false,
      error: 'Contenido o prompt requerido para generar presentación'
    });
  }

  if (!brandConfig) {
    console.error('❌ Error: Configuración de marca requerida');
    return res.status(400).json({
      success: false,
      error: 'Configuración de marca requerida'
    });
  }

  console.log('🎨 Iniciando generación de presentación PPTX...');
  console.log('🔍 Verificando instancia del generador:', pptxGenerator ? 'OK' : 'ERROR');
  
  try {
    let presentationContent = content;
    let useAI = false;
    
    // Si no hay contenido pero hay prompt en options, usar el prompt como contenido para IA
    if (!content && options.prompt) {
      console.log('🤖 Detectado prompt en options, usando para generación con IA...');
      presentationContent = options.prompt;
      useAI = true;
    }
    // Si el contenido es un string (prompt), usar IA para generar contenido estructurado
    else if (typeof content === 'string' && options.useAI !== false) {
      console.log('🤖 Detectado prompt de texto, iniciando generación de contenido con IA...');
      console.log('🔍 Paso 1: Analizando prompt...');
      useAI = true;
    } else {
      console.log('📄 Usando contenido estructurado proporcionado');
    }
    
    // Si se debe usar IA, generar contenido estructurado
    if (useAI) {
      try {
        // Generar contenido estructurado con IA
        presentationContent = await aiContentGenerator.generatePresentationContent(presentationContent);
        console.log('✅ Contenido generado con IA exitosamente');
        console.log('📊 Estructura generada:', {
          title: presentationContent.title,
          slidesCount: presentationContent.slides?.length || 0
        });
      } catch (aiError) {
        console.error('❌ Error en generación de contenido con IA:', aiError.message);
        console.log('🔄 Continuando con contenido original...');
        // Si falla la IA, continuar con el contenido original
        presentationContent = {
          title: presentationContent,
          slides: [
            {
              type: 'title',
              title: presentationContent,
              subtitle: 'Generado automáticamente'
            }
          ]
        };
      }
    }
    
    console.log('📞 Llamando a pptxGenerator.generatePresentation...');
    
    // Agregar timeout para evitar colgado infinito
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: La generación tardó más de 30 segundos')), 30000);
    });
    
    const generationPromise = pptxGenerator.generatePresentation(presentationContent, brandConfig);
    
    console.log('⏳ Esperando resultado de la generación...');
    const result = await Promise.race([generationPromise, timeoutPromise]);
    
    console.log('✅ Presentación generada exitosamente');
    console.log('📊 Resultado:', JSON.stringify(result, null, 2));
    
    res.status(200).json({
      success: true,
      message: 'Presentación generada exitosamente',
      aiGenerated: useAI,
      ...result
    });
    
  } catch (error) {
    console.error('❌ Error en la generación:', error.message);
    console.error('📍 Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
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

module.exports = router;
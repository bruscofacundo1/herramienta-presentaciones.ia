/**
 * Servicio de Generación de Contenido con IA - Versión Híbrida Corregida
 * 
 * Utiliza Gemini API y ZAI SDK para generar contenido estructurado para presentaciones.
 * Si Gemini falla por restricciones geográficas, usa ZAI como alternativa.
 * 
 * @author Brand-to-Deck AI
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const createError = require('../utils/create-error');
const fs = require('fs');
const path = require('path');

// Configuración de logging
const logToFile = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  try {
    fs.appendFileSync(path.join(__dirname, '../../ai-logs.log'), logMessage);
  } catch (error) {
    console.error('Error escribiendo log:', error);
  }
};

/**
 * Clase para generar contenido con IA
 */
class AIContentGenerator {
  constructor() {
    // Inicializar Gemini API
    try {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key');
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      logToFile('✅ Gemini API inicializada');
    } catch (error) {
      logToFile(`⚠️ Error inicializando Gemini API: ${error.message}`);
      this.model = null;
    }
    
    // Inicializar ZAI SDK
    this.zai = null;
    this.zaiAvailable = false;
  }

  /**
   * Inicializar ZAI SDK cuando sea necesario
   */
  async initializeZAI() {
    if (this.zaiAvailable && this.zai) return this.zai;
    
    try {
      // Importar ZAI y usar el método estático create
      const ZAI = require('z-ai-web-dev-sdk').default;
      this.zai = await ZAI.create();
      this.zaiAvailable = true;
      logToFile('✅ ZAI SDK inicializado correctamente');
      return this.zai;
    } catch (error) {
      logToFile(`❌ Error inicializando ZAI SDK: ${error.message}`);
      this.zaiAvailable = false;
      return null;
    }
  }

  /**
   * Generar contenido usando ZAI SDK
   */
  async generateWithZAI(prompt) {
    logToFile('🤖 Intentando generar contenido con ZAI SDK...');
    
    try {
      const zai = await this.initializeZAI();
      if (!zai) {
        throw new Error('ZAI SDK no disponible');
      }

      const zaiPrompt = `
      Genera una estructura de presentación profesional sobre el siguiente tema: "${prompt}"
      
      La presentación debe tener 6 diapositivas con la siguiente estructura:
      1. Título: Título principal y subtítulo descriptivo
      2. Introducción: Contexto y objetivos
      3. Características principales: Puntos clave del tema
      4. Aplicaciones prácticas: Casos de uso y ejemplos
      5. Beneficios: Ventajas y ROI
      6. Conclusiones: Hallazgos principales y recomendaciones
      
      Responde ÚNICAMENTE en formato JSON sin texto adicional:
      {
        "title": "Título de la presentación",
        "subtitle": "Subtítulo descriptivo",
        "slides": [
          {
            "type": "title",
            "title": "Título principal",
            "subtitle": "Subtítulo"
          },
          {
            "type": "bullets",
            "title": "Introducción",
            "bullets": ["Punto 1", "Punto 2", "Punto 3"]
          },
          {
            "type": "bullets",
            "title": "Características principales",
            "bullets": ["Característica 1", "Característica 2", "Característica 3"]
          },
          {
            "type": "bullets",
            "title": "Aplicaciones prácticas",
            "bullets": ["Aplicación 1", "Aplicación 2", "Aplicación 3"]
          },
          {
            "type": "bullets",
            "title": "Beneficios",
            "bullets": ["Beneficio 1", "Beneficio 2", "Beneficio 3"]
          },
          {
            "type": "bullets",
            "title": "Conclusiones",
            "bullets": ["Conclusión 1", "Conclusión 2", "Conclusión 3"]
          }
        ]
      }
      `;

      // Usar el método createChatCompletion
      const completion = await zai.createChatCompletion({
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en creación de presentaciones profesionales. Genera contenido estructurado en formato JSON.'
          },
          {
            role: 'user',
            content: zaiPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const responseText = completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content;
      if (!responseText) {
        throw new Error('No se recibió respuesta de ZAI');
      }

      logToFile(`✅ Contenido generado con ZAI: ${responseText.substring(0, 100)}...`);
      
      // Extraer JSON de la respuesta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const presentationStructure = JSON.parse(jsonMatch[0]);
        logToFile('✅ Estructura de presentación generada exitosamente con ZAI');
        return presentationStructure;
      }
      
      throw new Error('No se encontró JSON válido en la respuesta de ZAI');
      
    } catch (error) {
      logToFile(`❌ Error generando contenido con ZAI: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generar contenido completo para presentación con múltiples fallbacks
   */
  async generatePresentationContent(prompt) {
    logToFile('🚀 Iniciando generación de contenido con IA (versión híbrida)...');
    logToFile(`📝 Prompt: ${prompt}`);
    
    // Estrategia 1: Intentar con Gemini API
    if (this.model) {
      try {
        logToFile('🔍 Intentando con Gemini API...');
        
        const structurePrompt = `
        Genera una estructura de presentación profesional sobre el siguiente tema: "${prompt}"
        
        La presentación debe tener 6 diapositivas con la siguiente estructura:
        1. Título: Título principal y subtítulo descriptivo
        2. Introducción: Contexto y objetivos
        3. Características principales: Puntos clave del tema
        4. Aplicaciones prácticas: Casos de uso y ejemplos
        5. Beneficios: Ventajas y ROI
        6. Conclusiones: Hallazgos principales y recomendaciones
        
        Responde ÚNICAMENTE en formato JSON sin texto adicional:
        {
          "title": "Título de la presentación",
          "subtitle": "Subtítulo descriptivo",
          "slides": [
            {
              "type": "title",
              "title": "Título principal",
              "subtitle": "Subtítulo"
            },
            {
              "type": "bullets",
              "title": "Introducción",
              "bullets": ["Punto 1", "Punto 2", "Punto 3"]
            },
            {
              "type": "bullets",
              "title": "Características principales",
              "bullets": ["Característica 1", "Característica 2", "Característica 3"]
            },
            {
              "type": "bullets",
              "title": "Aplicaciones prácticas",
              "bullets": ["Aplicación 1", "Aplicación 2", "Aplicación 3"]
            },
            {
              "type": "bullets",
              "title": "Beneficios",
              "bullets": ["Beneficio 1", "Beneficio 2", "Beneficio 3"]
            },
            {
              "type": "bullets",
              "title": "Conclusiones",
              "bullets": ["Conclusión 1", "Conclusión 2", "Conclusión 3"]
            }
          ]
        }
        `;

        logToFile('⏳ Generando estructura con Gemini API...');
        
        const result = await this.model.generateContent(structurePrompt);
        const response = await result.response;
        const text = response.text();
        
        logToFile(`📄 Respuesta recibida de Gemini: ${text.substring(0, 200)}...`);
        
        // Extraer JSON de la respuesta
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const presentationStructure = JSON.parse(jsonMatch[0]);
          logToFile('✅ Estructura de presentación generada exitosamente con Gemini');
          logToFile(`📊 Número de diapositivas: ${presentationStructure.slides?.length || 0}`);
          return presentationStructure;
        }
        
        logToFile('⚠️ No se encontró JSON en la respuesta de Gemini');
        
      } catch (error) {
        logToFile(`❌ Error con Gemini API: ${error.message}`);
        
        // Si es error de restricción geográfica, intentar con ZAI
        if (error.message.includes('location is not supported')) {
          logToFile('🌍 Detectada restricción geográfica, intentando con ZAI SDK...');
          try {
            return await this.generateWithZAI(prompt);
          } catch (zaiError) {
            logToFile(`❌ ZAI SDK también falló: ${zaiError.message}`);
          }
        }
      }
    }
    
    // Estrategia 2: Intentar directamente con ZAI SDK
    try {
      logToFile('🔄 Intentando directamente con ZAI SDK...');
      return await this.generateWithZAI(prompt);
    } catch (error) {
      logToFile(`❌ ZAI SDK falló: ${error.message}`);
    }
    
    // Estrategia 3: Generar estructura básica como último recurso
    logToFile('📋 Generando estructura básica como fallback final...');
    return this.generateBasicStructure(prompt);
  }

  /**
   * Generar estructura básica cuando fallan todas las IAs
   */
  generateBasicStructure(prompt) {
    logToFile('📋 Generando estructura básica...');
    
    return {
      title: prompt,
      subtitle: "Presentación generada automáticamente",
      slides: [
        {
          type: "title",
          title: prompt,
          subtitle: "Presentación generada automáticamente"
        },
        {
          type: "bullets",
          title: "Introducción",
          bullets: [
            "Contexto del tema",
            "Objetivos de la presentación",
            "Importancia actual"
          ]
        },
        {
          type: "bullets",
          title: "Características principales",
          bullets: [
            "Característica principal 1",
            "Característica principal 2",
            "Característica principal 3"
          ]
        },
        {
          type: "bullets",
          title: "Aplicaciones prácticas",
          bullets: [
            "Aplicación práctica 1",
            "Aplicación práctica 2",
            "Aplicación práctica 3"
          ]
        },
        {
          type: "bullets",
          title: "Beneficios",
          bullets: [
            "Beneficio clave 1",
            "Beneficio clave 2",
            "Beneficio clave 3"
          ]
        },
        {
          type: "bullets",
          title: "Conclusiones",
          bullets: [
            "Hallazgos principales",
            "Recomendaciones",
            "Próximos pasos"
          ]
        }
      ]
    };
  }
}

module.exports = { AIContentGenerator };
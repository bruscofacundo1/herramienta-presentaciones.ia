/**
 * Servicio de Generación de Archivos PPTX
 * 
 * Utiliza PptxGenJS para crear presentaciones de PowerPoint con formato
 * corporativo basado en configuración de marca extraída.
 * 
 * @author Manus AI
 */

const PptxGenJS = require("pptxgenjs");
const fs = require("fs-extra");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const createError = require("../utils/create-error");

/**
 * Clase para generar presentaciones PPTX
 */
class PPTXGeneratorService {
  constructor() {
    this.outputDir = process.env.GENERATED_DIR || "./generated";
    this.defaultSlideSize = "LAYOUT_16x9";
  }

  /**
   * Generar presentación completa
   */
  async generatePresentation(contentData, brandConfig) {
    try {
      // Crear nueva presentación
      const pptx = new PptxGenJS();
      
      // Configurar presentación
      this.configurePresentationSettings(pptx, brandConfig);
      
      // Definir Slide Master personalizado
      this.defineBrandSlideMaster(pptx, brandConfig);
      
      // Generar diapositivas basadas en contenido
      await this.generateSlides(pptx, contentData, brandConfig);
      
      // Guardar archivo
      const filePath = await this.savePresentation(pptx, contentData.title || "Presentación");
      
      return {
        success: true,
        filePath,
        fileName: path.basename(filePath),
        downloadUrl: `/downloads/${path.basename(filePath)}`,
        metadata: {
          slides: contentData.slides?.length || 0,
          generatedAt: new Date().toISOString(),
          brandConfig: brandConfig.brand_name || "Configuración personalizada"
        }
      };

    } catch (error) {
      console.error("Error al generar presentación:", error);
      throw createError(`Error en generación PPTX: ${error.message}`, 500);
    }
  }

  /**
   * Configurar ajustes generales de la presentación
   */
  configurePresentationSettings(pptx, brandConfig) {
    // Configurar tamaño de diapositiva
    pptx.layout = this.defaultSlideSize;
    
    // Configurar propiedades del documento
    pptx.author = "Brand-to-Deck AI";
    pptx.company = brandConfig.brand_name || "Empresa";
    pptx.title = "Presentación Corporativa";
    pptx.subject = "Generada automáticamente con Brand-to-Deck AI";
  }

  /**
   * Definir Slide Master personalizado basado en la marca
   */
  defineBrandSlideMaster(pptx, brandConfig) {
    const primaryColor = brandConfig.colors.find(c => c.type === 'primary')?.hex || "0066CC";
    const accentColor = brandConfig.colors.find(c => c.type === 'accent')?.hex || "FF6600";
    const backgroundColor = brandConfig.colors.find(c => c.type === 'background')?.hex || "FFFFFF";
    const textColor = brandConfig.colors.find(c => c.type === 'text')?.hex || "333333";

    const headingFont = brandConfig.typography.find(t => t.element === 'title')?.font_family || "Arial";
    const bodyFont = brandConfig.typography.find(t => t.element === 'paragraph')?.font_family || "Arial";

    // Master principal para diapositivas de contenido
    pptx.defineSlideMaster({
      title: "BRAND_MASTER",
      background: { color: backgroundColor },
      margin: [0.5, 0.5, 0.5, 0.5],
      objects: [
        // Línea decorativa superior
        {
          line: {
            x: 0.5,
            y: 0.4,
            w: 9,
            line: { 
              color: primaryColor,
              width: 4 
            }
          }
        },
        // Área de pie de página sutil
        {
          rect: {
            x: 0,
            y: 6.8,
            w: "100%",
            h: 0.4,
            fill: { 
              color: accentColor,
              transparency: 30
            }
          }
        }
      ],
      slideNumber: {
        x: 9.2,
        y: 6.85,
        w: 0.5,
        h: 0.3,
        color: textColor,
        fontFace: bodyFont,
        fontSize: 10
      }
    });

    // Master para diapositivas de título/sección
    pptx.defineSlideMaster({
      title: "BRAND_TITLE_MASTER",
      background: { 
        color: primaryColor
      },
      objects: [
        // Elemento decorativo
        {
          rect: {
            x: 0,
            y: 0,
            w: "100%",
            h: 1.5,
            fill: { 
              color: accentColor,
              transparency: 20
            }
          }
        },
        // Placeholder para título principal
        {
          placeholder: {
            options: { 
              name: "title", 
              type: "title", 
              x: 1, 
              y: 2.5, 
              w: 8, 
              h: 2 
            },
            text: "Título de Sección"
          }
        },
        // Placeholder para subtítulo
        {
          placeholder: {
            options: { 
              name: "subtitle", 
              type: "body", 
              x: 1, 
              y: 4.5, 
              w: 8, 
              h: 1 
            },
            text: "Subtítulo o descripción"
          }
        }
      ]
    });
  }

  /**
   * Generar diapositivas basadas en el contenido
   */
  async generateSlides(pptx, contentData, brandConfig) {
    const slides = contentData.slides || [];
    
    for (let i = 0; i < slides.length; i++) {
      const slideData = slides[i];
      
      switch (slideData.type) {
        case 'title':
          this.createTitleSlide(pptx, slideData, brandConfig);
          break;
        case 'section':
          this.createSectionSlide(pptx, slideData, brandConfig);
          break;
        case 'content':
          this.createContentSlide(pptx, slideData, brandConfig);
          break;
        case 'bullets':
          this.createBulletSlide(pptx, slideData, brandConfig);
          break;
        case 'image':
          this.createImageSlide(pptx, slideData, brandConfig);
          break;
        default:
          this.createContentSlide(pptx, slideData, brandConfig);
      }
    }
  }

  /**
   * Crear diapositiva de título principal
   */
  createTitleSlide(pptx, slideData, brandConfig) {
    const slide = pptx.addSlide({ masterName: "BRAND_TITLE_MASTER" });
    const backgroundColor = brandConfig.colors.find(c => c.type === 'background')?.hex || "FFFFFF";
    const headingFont = brandConfig.typography.find(t => t.element === 'title');
    const subtitleFont = brandConfig.typography.find(t => t.element === 'subtitle');

    // Título principal
    slide.addText(slideData.title || "Título Principal", {
      placeholder: "title",
      fontSize: parseInt(headingFont?.size) || 36,
      bold: headingFont?.font_style?.includes('Bold') || true,
      color: backgroundColor,
      fontFace: headingFont?.font_family || "Arial"
    });

    // Subtítulo
    if (slideData.subtitle) {
      slide.addText(slideData.subtitle, {
        placeholder: "subtitle",
        fontSize: parseInt(subtitleFont?.size) || 18,
        color: backgroundColor,
        fontFace: subtitleFont?.font_family || "Arial"
      });
    }
  }

  /**
   * Crear diapositiva de sección
   */
  createSectionSlide(pptx, slideData, brandConfig) {
    const slide = pptx.addSlide({ masterName: "BRAND_TITLE_MASTER" });
    const backgroundColor = brandConfig.colors.find(c => c.type === 'background')?.hex || "FFFFFF";
    const headingFont = brandConfig.typography.find(t => t.element === 'title');
    const paragraphFont = brandConfig.typography.find(t => t.element === 'paragraph');

    // Título de sección
    slide.addText(slideData.title || "Nueva Sección", {
      placeholder: "title",
      fontSize: parseInt(headingFont?.size) || 32,
      bold: headingFont?.font_style?.includes('Bold') || true,
      color: backgroundColor,
      fontFace: headingFont?.font_family || "Arial"
    });

    // Descripción de sección
    if (slideData.description) {
      slide.addText(slideData.description, {
        placeholder: "subtitle",
        fontSize: parseInt(paragraphFont?.size) || 16,
        color: backgroundColor,
        fontFace: paragraphFont?.font_family || "Arial"
      });
    }
  }

  /**
   * Crear diapositiva de contenido general
   */
  createContentSlide(pptx, slideData, brandConfig) {
    const slide = pptx.addSlide({ masterName: "BRAND_MASTER" });
    const primaryColor = brandConfig.colors.find(c => c.type === 'primary')?.hex || "0066CC";
    const textColor = brandConfig.colors.find(c => c.type === 'text')?.hex || "333333";
    const headingFont = brandConfig.typography.find(t => t.element === 'title');
    const paragraphFont = brandConfig.typography.find(t => t.element === 'paragraph');

    // Título de la diapositiva
    slide.addText(slideData.title || "Contenido", {
      x: 0.5,
      y: 0.8,
      w: 9,
      h: 0.8,
      fontSize: parseInt(headingFont?.size) || 24,
      bold: headingFont?.font_style?.includes('Bold') || true,
      color: primaryColor,
      fontFace: headingFont?.font_family || "Arial"
    });

    // Contenido principal
    if (slideData.content) {
      slide.addText(slideData.content, {
        x: 0.5,
        y: 1.8,
        w: 9,
        h: 4.5,
        fontSize: parseInt(paragraphFont?.size) || 14,
        color: textColor,
        fontFace: paragraphFont?.font_family || "Arial",
        valign: 'top'
      });
    }
  }

  /**
   * Crear diapositiva con viñetas
   */
  createBulletSlide(pptx, slideData, brandConfig) {
    const slide = pptx.addSlide({ masterName: "BRAND_MASTER" });
    const primaryColor = brandConfig.colors.find(c => c.type === 'primary')?.hex || "0066CC";
    const textColor = brandConfig.colors.find(c => c.type === 'text')?.hex || "333333";
    const headingFont = brandConfig.typography.find(t => t.element === 'title');
    const paragraphFont = brandConfig.typography.find(t => t.element === 'paragraph');

    // Título
    slide.addText(slideData.title || "Puntos Clave", {
      x: 0.5,
      y: 0.8,
      w: 9,
      h: 0.8,
      fontSize: parseInt(headingFont?.size) || 24,
      bold: headingFont?.font_style?.includes('Bold') || true,
      color: primaryColor,
      fontFace: headingFont?.font_family || "Arial"
    });

    // Lista de viñetas
    if (slideData.bullets && Array.isArray(slideData.bullets)) {
      const bulletText = slideData.bullets.map(bullet => `• ${bullet}`).join('\n');
      
      slide.addText(bulletText, {
        x: 0.5,
        y: 1.8,
        w: 9,
        h: 4.5,
        fontSize: parseInt(paragraphFont?.size) || 16,
        color: textColor,
        fontFace: paragraphFont?.font_family || "Arial",
        valign: 'top'
      });
    }
  }

  /**
   * Crear diapositiva con imagen
   */
  createImageSlide(pptx, slideData, brandConfig) {
    const slide = pptx.addSlide({ masterName: "BRAND_MASTER" });
    const primaryColor = brandConfig.colors.find(c => c.type === 'primary')?.hex || "0066CC";
    const secondaryColor = brandConfig.colors.find(c => c.type === 'secondary')?.hex || "F5F5F5";
    const textColor = brandConfig.colors.find(c => c.type === 'text')?.hex || "666666";
    const headingFont = brandConfig.typography.find(t => t.element === 'title');
    const paragraphFont = brandConfig.typography.find(t => t.element === 'paragraph');

    // Título
    slide.addText(slideData.title || "Imagen", {
      x: 0.5,
      y: 0.8,
      w: 9,
      h: 0.8,
      fontSize: parseInt(headingFont?.size) || 24,
      bold: headingFont?.font_style?.includes('Bold') || true,
      color: primaryColor,
      fontFace: headingFont?.font_family || "Arial"
    });

    // Placeholder para imagen (en implementación real se cargaría la imagen)
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 2,
      y: 2,
      w: 6,
      h: 3.5,
      fill: { color: secondaryColor },
      line: { color: primaryColor, width: 2 }
    });

    // Texto de placeholder
    slide.addText("Imagen aquí", {
      x: 2,
      y: 3.5,
      w: 6,
      h: 0.5,
      fontSize: parseInt(paragraphFont?.size) || 14,
      align: 'center',
      color: textColor,
      fontFace: paragraphFont?.font_family || "Arial"
    });

    // Descripción de imagen
    if (slideData.description) {
      slide.addText(slideData.description, {
        x: 0.5,
        y: 5.8,
        w: 9,
        h: 0.8,
        fontSize: parseInt(paragraphFont?.size) || 12,
        align: 'center',
        color: textColor,
        fontFace: paragraphFont?.font_family || "Arial"
      });
    }
  }

  /**
   * Guardar presentación en archivo
   */
  async savePresentation(pptx, title) {
    // Asegurar que existe el directorio de salida
    await fs.ensureDir(this.outputDir);
    
    // Generar nombre de archivo único
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const uniqueId = uuidv4().substring(0, 8);
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const fileName = `${timestamp}_${uniqueId}_${sanitizedTitle}.pptx`;
    const filePath = path.join(this.outputDir, fileName);

    // Guardar archivo
    await pptx.writeFile({ fileName: filePath });
    
    // Verificar que el archivo se creó correctamente
    const exists = await fs.pathExists(filePath);
    if (!exists) {
      throw createError('Error al guardar el archivo PPTX', 500);
    }

    return filePath;
  }

  /**
   * Parsear contenido estructurado de texto o prompt natural
   */
  parseStructuredContent(textContent) {
    // Si el contenido parece ser un prompt natural (no tiene estructura de markdown)
    if (!textContent.includes('#') && !textContent.includes('-') && !textContent.includes('*')) {
      return this.parseNaturalPrompt(textContent);
    }

    // Parsear contenido estructurado tradicional
    const lines = textContent.split('\n').filter(line => line.trim());
    const slides = [];
    let currentSlide = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Detectar títulos de diapositiva (líneas que empiezan con #)
      if (trimmedLine.startsWith('#')) {
        if (currentSlide) {
          slides.push(currentSlide);
        }
        
        const title = trimmedLine.replace(/^#+\s*/, '');
        const level = (trimmedLine.match(/^#+/) || [''])[0].length;
        
        currentSlide = {
          type: level === 1 ? 'title' : level === 2 ? 'section' : 'content',
          title: title,
          content: '',
          bullets: []
        };
      }
      // Detectar viñetas
      else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        if (currentSlide) {
          const bulletText = trimmedLine.replace(/^[-*]\s*/, '');
          currentSlide.bullets.push(bulletText);
          currentSlide.type = 'bullets';
        }
      }
      // Contenido regular
      else if (trimmedLine.length > 0) {
        if (currentSlide) {
          currentSlide.content += (currentSlide.content ? '\n' : '') + trimmedLine;
        }
      }
    }

    // Agregar última diapositiva
    if (currentSlide) {
      slides.push(currentSlide);
    }

    return {
      title: slides[0]?.title || 'Presentación',
      slides: slides
    };
  }

  /**
   * Parsear prompt natural y convertirlo en estructura de presentación
   */
  parseNaturalPrompt(prompt) {
    // Extraer información del prompt
    const title = this.extractTitleFromPrompt(prompt);
    const slideCount = this.extractSlideCountFromPrompt(prompt);
    const topic = this.extractTopicFromPrompt(prompt);
    
    // Generar estructura básica de diapositivas
    const slides = [];
    
    // Diapositiva de título
    slides.push({
      type: 'title',
      title: title,
      content: `Presentación sobre ${topic}`,
      bullets: []
    });

    // Generar diapositivas de contenido basadas en el tema
    const contentSlides = this.generateContentSlidesFromTopic(topic, slideCount - 1);
    slides.push(...contentSlides);

    return {
      title: title,
      slides: slides,
      originalPrompt: prompt
    };
  }

  /**
   * Extraer título del prompt
   */
  extractTitleFromPrompt(prompt) {
    // Buscar patrones comunes para títulos
    const titlePatterns = [
      /(?:crea|genera|haz).*presentaci[óo]n.*sobre\s+(.+?)(?:\s+con|\s*$)/i,
      /presentaci[óo]n.*de\s+(.+?)(?:\s+con|\s*$)/i,
      /presentaci[óo]n.*sobre\s+(.+?)(?:\s+con|\s*$)/i,
      /(.+?)(?:\s+presentaci[óo]n|\s*$)/i
    ];

    for (const pattern of titlePatterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        return this.capitalizeTitle(match[1].trim());
      }
    }

    return 'Presentación Corporativa';
  }

  /**
   * Extraer número de diapositivas del prompt
   */
  extractSlideCountFromPrompt(prompt) {
    const countMatch = prompt.match(/(\d+)\s*diapositivas?/i);
    if (countMatch) {
      return Math.min(parseInt(countMatch[1]), 10); // Máximo 10 diapositivas
    }
    return 5; // Por defecto 5 diapositivas
  }

  /**
   * Extraer tema principal del prompt
   */
  extractTopicFromPrompt(prompt) {
    // Buscar palabras clave del tema
    const topicPatterns = [
      /sobre\s+(.+?)(?:\s+con|\s*$)/i,
      /de\s+(.+?)(?:\s+con|\s*$)/i,
      /presentaci[óo]n.*(.+?)(?:\s+con|\s*$)/i
    ];

    for (const pattern of topicPatterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return 'tema corporativo';
  }

  /**
   * Generar diapositivas de contenido basadas en el tema
   */
  generateContentSlidesFromTopic(topic, slideCount) {
    const slides = [];
    
    // Plantillas de contenido genéricas
    const contentTemplates = [
      {
        title: 'Introducción',
        content: `Presentación sobre ${topic}`,
        bullets: [
          'Objetivos de la presentación',
          'Alcance del tema',
          'Puntos clave a tratar'
        ]
      },
      {
        title: 'Características Principales',
        content: `Aspectos destacados de ${topic}`,
        bullets: [
          'Característica principal 1',
          'Característica principal 2',
          'Característica principal 3'
        ]
      },
      {
        title: 'Beneficios',
        content: `Ventajas y beneficios de ${topic}`,
        bullets: [
          'Beneficio clave 1',
          'Beneficio clave 2',
          'Beneficio clave 3'
        ]
      },
      {
        title: 'Especificaciones',
        content: `Detalles técnicos de ${topic}`,
        bullets: [
          'Especificación técnica 1',
          'Especificación técnica 2',
          'Especificación técnica 3'
        ]
      },
      {
        title: 'Conclusiones',
        content: `Resumen y próximos pasos`,
        bullets: [
          'Puntos clave resumidos',
          'Recomendaciones',
          'Próximos pasos'
        ]
      }
    ];

    // Seleccionar plantillas según el número de diapositivas solicitadas
    for (let i = 0; i < Math.min(slideCount, contentTemplates.length); i++) {
      slides.push({
        type: 'bullets',
        ...contentTemplates[i]
      });
    }

    return slides;
  }

  /**
   * Capitalizar título
   */
  capitalizeTitle(title) {
    return title.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Obtener información de archivo generado
   */
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        sizeFormatted: this.formatFileSize(stats.size)
      };
    } catch (error) {
      return { exists: false };
    }
  }

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = { PPTXGeneratorService };


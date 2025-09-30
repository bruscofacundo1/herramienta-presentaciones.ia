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
      console.log('🎨 Iniciando generación de presentación PPTX...');
      console.log('📊 Datos de contenido:', {
        title: contentData.title,
        slidesCount: contentData.slides?.length || 0,
        hasSlides: !!contentData.slides
      });
      console.log('🎯 Configuración de marca:', {
        brandName: brandConfig.brand_name,
        colorsCount: brandConfig.colors?.length || 0,
        typographyCount: brandConfig.typography?.length || 0
      });

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
      
      const result = {
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

      console.log('✅ Presentación generada exitosamente:', result.fileName);
      return result;

    } catch (error) {
      console.error("❌ Error al generar presentación:", error);
      console.error("Stack trace:", error.stack);
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
    console.log('📊 Iniciando generación de diapositivas...');
    const slides = contentData.slides || [];
    console.log(`📋 Total de diapositivas a generar: ${slides.length}`);
    
    if (slides.length === 0) {
      console.log('⚠️ No hay diapositivas para generar');
      return;
    }
    
    for (let i = 0; i < slides.length; i++) {
      const slideData = slides[i];
      console.log(`🔄 Generando diapositiva ${i + 1}/${slides.length} - Tipo: ${slideData.type}`);
      
      try {
        switch (slideData.type) {
          case 'title':
            console.log('📄 Creando diapositiva de título...');
            this.createTitleSlide(pptx, slideData, brandConfig);
            break;
          case 'section':
            console.log('📑 Creando diapositiva de sección...');
            this.createSectionSlide(pptx, slideData, brandConfig);
            break;
          case 'content':
            console.log('📝 Creando diapositiva de contenido...');
            this.createContentSlide(pptx, slideData, brandConfig);
            break;
          case 'bullets':
            console.log('📌 Creando diapositiva con viñetas...');
            this.createBulletSlide(pptx, slideData, brandConfig);
            break;
          case 'image':
            console.log('🖼️ Creando diapositiva con imagen...');
            this.createImageSlide(pptx, slideData, brandConfig);
            break;
          default:
            console.log(`📝 Tipo desconocido "${slideData.type}", usando contenido por defecto...`);
            this.createContentSlide(pptx, slideData, brandConfig);
        }
        console.log(`✅ Diapositiva ${i + 1} generada exitosamente`);
      } catch (error) {
        console.error(`❌ Error generando diapositiva ${i + 1}:`, error);
        throw error;
      }
    }
    
    console.log('✅ Todas las diapositivas generadas exitosamente');
  }

  /**
   * Crear diapositiva de título principal
   */
  createTitleSlide(pptx, slideData, brandConfig) {
    console.log('📄 Creando diapositiva de título:', slideData.title);
    
    try {
      const slide = pptx.addSlide();
      
      // Usar colores seguros por defecto
      const primaryColor = "0066CC";
      const textColor = "FFFFFF";
      
      // Título principal con configuración simple
      slide.addText(slideData.title || "Título Principal", {
        x: 1,
        y: 2.5,
        w: 8,
        h: 2,
        fontSize: 36,
        bold: true,
        color: primaryColor,
        fontFace: "Arial",
        align: 'center'
      });

      // Subtítulo si existe
      if (slideData.subtitle) {
        slide.addText(slideData.subtitle, {
          x: 1,
          y: 4.5,
          w: 8,
          h: 1,
          fontSize: 18,
          color: textColor,
          fontFace: "Arial",
          align: 'center'
        });
      }
      
      console.log('✅ Diapositiva de título creada exitosamente');
    } catch (error) {
      console.error('❌ Error creando diapositiva de título:', error);
      throw error;
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
   * Crear diapositiva de contenido gene  /**
   * Crear diapositiva de contenido
   */
  createContentSlide(pptx, slideData, brandConfig) {
    console.log('📝 Creando diapositiva de contenido:', slideData.title);
    
    try {
      const slide = pptx.addSlide();
      
      // Usar colores seguros por defecto
      const primaryColor = "0066CC";
      const textColor = "333333";
      
      // Título de la diapositiva
      slide.addText(slideData.title || "Contenido", {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 24,
        bold: true,
        color: primaryColor,
        fontFace: "Arial"
      });

      // Contenido principal
      if (slideData.content) {
        slide.addText(slideData.content, {
          x: 0.5,
          y: 1.5,
          w: 9,
          h: 4,
          fontSize: 14,
          color: textColor,
          fontFace: "Arial",
          valign: 'top'
        });
      }
      
      console.log('✅ Diapositiva de contenido creada exitosamente');
    } catch (error) {
      console.error('❌ Error creando diapositiva de contenido:', error);
      throw error;
    }
  }

  /**
   * Crear diapositiva con viñetas
   */
  createBulletSlide(pptx, slideData, brandConfig) {
    console.log('📌 Creando diapositiva con viñetas:', slideData.title);
    
    try {
      const slide = pptx.addSlide();
      
      // Usar colores seguros por defecto
      const primaryColor = "0066CC";
      const textColor = "333333";
      
      // Título
      slide.addText(slideData.title || "Lista", {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 24,
        bold: true,
        color: primaryColor,
        fontFace: "Arial"
      });

      // Viñetas
      if (slideData.bullets && slideData.bullets.length > 0) {
        const bulletText = slideData.bullets.map(bullet => `• ${bullet}`).join('\n');
        slide.addText(bulletText, {
          x: 0.5,
          y: 1.5,
          w: 9,
          h: 4,
          fontSize: 16,
          color: textColor,
          fontFace: "Arial",
          valign: 'top'
        });
      }
      
      console.log('✅ Diapositiva con viñetas creada exitosamente');
    } catch (error) {
      console.error('❌ Error creando diapositiva con viñetas:', error);
      throw error;
    }
  }

  /**
   * Crear diapositiva de sección
   */
  createSectionSlide(pptx, slideData, brandConfig) {
    console.log('📑 Creando diapositiva de sección:', slideData.title);
    
    try {
      const slide = pptx.addSlide();
      
      // Usar colores seguros por defecto
      const primaryColor = "0066CC";
      const textColor = "333333";
      
      // Título de sección grande
      slide.addText(slideData.title || "Sección", {
        x: 1,
        y: 2.5,
        w: 8,
        h: 2,
        fontSize: 32,
        bold: true,
        color: primaryColor,
        fontFace: "Arial",
        align: 'center'
      });

      // Contenido adicional si existe
      if (slideData.content) {
        slide.addText(slideData.content, {
          x: 1,
          y: 4.5,
          w: 8,
          h: 1,
          fontSize: 16,
          color: textColor,
          fontFace: "Arial",
          align: 'center'
        });
      }
      
      console.log('✅ Diapositiva de sección creada exitosamente');
    } catch (error) {
      console.error('❌ Error creando diapositiva de sección:', error);
      throw error;
    }
  }

  /**
   * Crear diapositiva con imagen
   */
  createImageSlide(pptx, slideData, brandConfig) {
    console.log('🖼️ Creando diapositiva con imagen:', slideData.title);
    
    try {
      const slide = pptx.addSlide();
      
      // Usar colores seguros por defecto
      const primaryColor = "0066CC";
      const textColor = "333333";
      
      // Título
      slide.addText(slideData.title || "Imagen", {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 24,
        bold: true,
        color: primaryColor,
        fontFace: "Arial"
      });

      // Placeholder para imagen
      slide.addText("[ Imagen aquí ]", {
        x: 2,
        y: 2,
        w: 6,
        h: 3,
        fontSize: 18,
        color: textColor,
        fontFace: "Arial",
        align: 'center',
        valign: 'middle'
      });

      // Descripción si existe
      if (slideData.description || slideData.content) {
        slide.addText(slideData.description || slideData.content, {
          x: 0.5,
          y: 5.5,
          w: 9,
          h: 1,
          fontSize: 14,
          color: textColor,
          fontFace: "Arial",
          align: 'center'
        });
      }
      
      console.log('✅ Diapositiva con imagen creada exitosamente');
    } catch (error) {
      console.error('❌ Error creando diapositiva con imagen:', error);
      throw error;
    }
  }

  /**
   * Guardar presentación en archivo
   */
  async savePresentation(pptx, title) {
    try {
      console.log(`📁 Asegurando directorio de salida: ${this.outputDir}`);
      
      // Asegurar que existe el directorio de salida
      await fs.ensureDir(this.outputDir);
      
      // Generar nombre de archivo único
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const uniqueId = uuidv4().substring(0, 8);
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      const fileName = `${timestamp}_${uniqueId}_${sanitizedTitle}.pptx`;
      const filePath = path.join(this.outputDir, fileName);

      console.log(`💾 Guardando archivo PPTX en: ${filePath}`);

      // Guardar archivo
      await pptx.writeFile({ fileName: filePath });
      
      // Verificar que el archivo se creó correctamente
      const exists = await fs.pathExists(filePath);
      if (!exists) {
        throw createError('Error al guardar el archivo PPTX - archivo no encontrado después de escritura', 500);
      }

      // Verificar tamaño del archivo
      const stats = await fs.stat(filePath);
      console.log(`✅ Archivo PPTX guardado exitosamente. Tamaño: ${stats.size} bytes`);

      return filePath;
    } catch (error) {
      console.error(`❌ Error al guardar presentación:`, error);
      throw createError(`Error al guardar archivo PPTX: ${error.message}`, 500);
    }
  }

  /**
   * Parsear contenido estructurado de texto
   */
  parseStructuredContent(textContent) {
    console.log('📝 Parseando contenido estructurado...');
    console.log('📄 Contenido recibido:', textContent ? `${textContent.length} caracteres` : 'vacío');
    
    if (!textContent || textContent.trim().length === 0) {
      console.log('⚠️ Contenido vacío, generando diapositiva por defecto');
      return {
        title: 'Presentación',
        slides: [{
          type: 'title',
          title: 'Presentación',
          content: '',
          bullets: []
        }]
      };
    }
    
    const lines = textContent.split('\n').filter(line => line.trim());
    console.log(`📋 Líneas a procesar: ${lines.length}`);
    
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
        console.log(`📑 Nueva diapositiva: "${title}" (tipo: ${currentSlide.type})`);
      }
      // Detectar viñetas
      else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        if (currentSlide) {
          const bulletText = trimmedLine.replace(/^[-*]\s*/, '');
          currentSlide.bullets.push(bulletText);
          currentSlide.type = 'bullets';
          console.log(`📌 Viñeta añadida: "${bulletText}"`);
        }
      }
      // Contenido regular
      else if (trimmedLine.length > 0) {
        if (currentSlide) {
          currentSlide.content += (currentSlide.content ? '\n' : '') + trimmedLine;
          console.log(`📝 Contenido añadido a diapositiva actual`);
        }
      }
    }

    // Agregar última diapositiva
    if (currentSlide) {
      slides.push(currentSlide);
    }

    const result = {
      title: slides[0]?.title || 'Presentación',
      slides: slides
    };
    
    console.log(`✅ Parsing completado: ${slides.length} diapositivas generadas`);
    console.log('📊 Resumen de diapositivas:', slides.map((s, i) => `${i+1}. ${s.type}: "${s.title}"`));
    
    return result;
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


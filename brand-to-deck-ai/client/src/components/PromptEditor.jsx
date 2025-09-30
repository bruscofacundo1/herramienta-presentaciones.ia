/**
 * Componente PromptEditor
 * 
 * Editor para generar y personalizar prompts basados en la configuración de marca
 * y el contenido estructurado del usuario.
 * 
 * @author Manus AI
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wand2, 
  Eye, 
  Download, 
  Copy,
  Check,
  RefreshCw,
  FileText,
  Palette,
  Type,
  Layout
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

function PromptEditor({ 
  content, 
  brandConfig, 
  onGeneratePresentation,
  isGenerating = false 
}) {
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('generated');
  const [copied, setCopied] = useState(false);
  const [parsedContent, setParsedContent] = useState(null);

  // Generar prompt automáticamente cuando se carga el componente
  useEffect(() => {
    if (content && brandConfig) {
      generatePrompt();
      parseContent();
    }
  }, [content, brandConfig]);

  /**
   * Parsear contenido estructurado
   */
  const parseContent = () => {
    const lines = content.split('\n').filter(line => line.trim());
    const slides = [];
    let currentSlide = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
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
      } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        if (currentSlide) {
          const bulletText = trimmedLine.replace(/^[-*]\s*/, '');
          currentSlide.bullets.push(bulletText);
          currentSlide.type = 'bullets';
        }
      } else if (trimmedLine.length > 0) {
        if (currentSlide) {
          currentSlide.content += (currentSlide.content ? '\n' : '') + trimmedLine;
        }
      }
    }

    if (currentSlide) {
      slides.push(currentSlide);
    }

    setParsedContent({
      title: slides[0]?.title || 'Presentación',
      slides: slides
    });
  };

  /**
   * Generar prompt basado en la configuración de marca y contenido
   */
  const generatePrompt = () => {
    const primaryColor = brandConfig.colors?.find(c => c.type === 'primary');
    const accentColor = brandConfig.colors?.find(c => c.type === 'accent');
    const titleFont = brandConfig.typography?.find(t => t.element === 'title');
    const bodyFont = brandConfig.typography?.find(t => t.element === 'paragraph');

    const prompt = `Genera una presentación de PowerPoint profesional con las siguientes especificaciones de marca:

CONFIGURACIÓN DE MARCA:
- Marca: ${brandConfig.brand_name || 'Empresa'}
- Color principal: ${primaryColor?.hex || '#0066CC'} (${primaryColor?.name || 'Azul corporativo'})
- Color de acento: ${accentColor?.hex || '#FF6600'} (${accentColor?.name || 'Naranja'})
- Tipografía títulos: ${titleFont?.font_family || 'Arial'} ${titleFont?.font_style || 'Bold'}
- Tipografía contenido: ${bodyFont?.font_family || 'Arial'} ${bodyFont?.font_style || 'Regular'}

CONTENIDO A INCLUIR:
${content}

INSTRUCCIONES DE DISEÑO:
1. Usar la paleta de colores corporativos especificada
2. Aplicar las tipografías según la jerarquía establecida
3. Mantener consistencia visual en todas las diapositivas
4. Incluir elementos gráficos sutiles que refuercen la identidad de marca
5. Asegurar legibilidad y profesionalismo en el diseño

ESTRUCTURA REQUERIDA:
- Diapositiva de título principal
- Diapositivas de contenido con jerarquía clara
- Uso apropiado de viñetas y espaciado
- Elementos visuales que complementen el contenido

Genera un archivo PPTX que cumpla estrictamente con estas especificaciones de marca.`;

    setGeneratedPrompt(prompt);
  };

  /**
   * Copiar prompt al portapapeles
   */
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
    }
  };

  /**
   * Regenerar prompt
   */
  const regeneratePrompt = () => {
    generatePrompt();
  };

  /**
   * Manejar generación de presentación
   */
  const handleGeneratePresentation = () => {
    const finalPrompt = activeTab === 'generated' ? generatedPrompt : customPrompt;
    onGeneratePresentation(finalPrompt, parsedContent);
  };

  return (
    <div className="space-y-6">
      {/* Título y descripción */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Generar Presentación
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Revisa el prompt generado automáticamente o personalízalo según tus necesidades. 
          El prompt incluye toda la configuración de marca extraída.
        </p>
      </div>

      {/* Resumen de configuración */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Configuración de Marca Aplicada</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Colores */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Colores</span>
              </h4>
              <div className="space-y-1">
                {brandConfig.colors?.slice(0, 3).map((color, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    <span>{color.name || color.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tipografía */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center space-x-1">
                <Type className="w-3 h-3" />
                <span>Tipografía</span>
              </h4>
              <div className="space-y-1">
                {brandConfig.typography?.slice(0, 3).map((font, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{font.element}:</span> {font.font_family}
                  </div>
                ))}
              </div>
            </div>

            {/* Contenido */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center space-x-1">
                <Layout className="w-3 h-3" />
                <span>Contenido</span>
              </h4>
              <div className="space-y-1 text-sm">
                <div>Diapositivas: {parsedContent?.slides?.length || 0}</div>
                <div>Título: {parsedContent?.title || 'Sin título'}</div>
                <div>Marca: {brandConfig.brand_name || 'Configuración personalizada'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor de prompts */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-6 pt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generated" className="flex items-center space-x-2">
                  <Wand2 className="w-4 h-4" />
                  <span>Prompt Generado</span>
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Prompt Personalizado</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Prompt generado automáticamente */}
            <TabsContent value="generated" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Prompt Generado Automáticamente</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regeneratePrompt}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedPrompt)}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Textarea
                value={generatedPrompt}
                readOnly
                className="min-h-[300px] font-mono text-sm bg-slate-50"
              />

              <Alert>
                <Wand2 className="h-4 w-4" />
                <AlertDescription>
                  Este prompt ha sido generado automáticamente basándose en tu configuración de marca 
                  y contenido. Incluye todos los elementos necesarios para crear una presentación 
                  consistente con tu identidad corporativa.
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Prompt personalizado */}
            <TabsContent value="custom" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Prompt Personalizado</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(customPrompt)}
                  disabled={!customPrompt}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Escribe tu prompt personalizado aquí...

Puedes usar el prompt generado como base y modificarlo según tus necesidades específicas."
                className="min-h-[300px] font-mono text-sm"
              />

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Personaliza el prompt según tus necesidades específicas. Asegúrate de incluir 
                  la información de marca y las instrucciones de diseño necesarias.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Vista previa del contenido */}
      {parsedContent && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Vista Previa del Contenido</span>
            </CardTitle>
            <CardDescription>
              {parsedContent.slides.length} diapositivas serán generadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {parsedContent.slides.slice(0, 5).map((slide, index) => (
                <div key={index} className="border rounded-lg p-3 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={slide.type === 'title' ? 'default' : 'secondary'}>
                      Diapositiva {index + 1}
                    </Badge>
                    <Badge variant="outline">{slide.type}</Badge>
                  </div>
                  <h4 className="font-semibold text-sm">{slide.title}</h4>
                  {slide.content && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {slide.content}
                    </p>
                  )}
                  {slide.bullets && slide.bullets.length > 0 && (
                    <div className="text-xs text-slate-600 mt-1">
                      {slide.bullets.length} viñetas
                    </div>
                  )}
                </div>
              ))}
              {parsedContent.slides.length > 5 && (
                <div className="text-center text-sm text-slate-500">
                  ... y {parsedContent.slides.length - 5} diapositivas más
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón de generación */}
      <div className="text-center">
        <Button
          onClick={handleGeneratePresentation}
          disabled={isGenerating || (!generatedPrompt && !customPrompt)}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generando Presentación...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Generar Presentación PPTX
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default PromptEditor;


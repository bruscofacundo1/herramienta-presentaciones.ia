/**
 * Componente ContentEditor
 * 
 * Editor de contenido estructurado para crear presentaciones.
 * 
 * @author Manus AI
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Eye, 
  Download, 
  Lightbulb, 
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { debounce } from '../lib/utils';

const CONTENT_TEMPLATES = [
  {
    id: 'business-proposal',
    name: 'Propuesta de Negocio',
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
  },
  {
    id: 'project-status',
    name: 'Estado de Proyecto',
    content: `# Reporte de Proyecto
## Resumen
Estado general del proyecto y avances principales.

## Objetivos
- Objetivo 1: Estado actual
- Objetivo 2: Estado actual
- Objetivo 3: Estado actual

## Avances
Descripción detallada de los avances realizados.

## Desafíos
- Desafío identificado 1
- Desafío identificado 2
- Plan de mitigación

## Próximos Pasos
Actividades planificadas para el siguiente período.

## Recursos
Estado de recursos y necesidades adicionales.`
  }
];

function ContentEditor({ 
  content, 
  onChange, 
  parsedContent, 
  brandConfig, 
  onPreview, 
  canProceed 
}) {
  const [activeTab, setActiveTab] = useState('editor');
  const [wordCount, setWordCount] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [copied, setCopied] = useState(false);

  // Debounced onChange para evitar demasiadas actualizaciones
  const debouncedOnChange = debounce(onChange, 300);

  // Actualizar estadísticas cuando cambie el contenido
  useEffect(() => {
    if (content) {
      const words = content.split(/\s+/).filter(word => word.length > 0).length;
      setWordCount(words);
      setEstimatedTime(Math.ceil(words / 150)); // ~150 palabras por minuto de lectura
    } else {
      setWordCount(0);
      setEstimatedTime(0);
    }
  }, [content]);

  /**
   * Manejar cambio de contenido
   */
  const handleContentChange = (newContent) => {
    debouncedOnChange(newContent);
  };

  /**
   * Cargar plantilla
   */
  const loadTemplate = (templateId) => {
    const template = CONTENT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      onChange(template.content);
    }
  };

  /**
   * Copiar contenido al portapapeles
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
    }
  };

  /**
   * Limpiar contenido
   */
  const clearContent = () => {
    onChange('');
  };

  return (
    <div className="space-y-6">
      {/* Título y descripción */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Crear Contenido
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Escribe el contenido de tu presentación usando texto estructurado. 
          Usa # para títulos, ## para secciones y - para viñetas.
        </p>
      </div>

      {/* Estadísticas y acciones */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{wordCount}</div>
                <div className="text-sm text-slate-600">Palabras</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {parsedContent?.slides?.length || 0}
                </div>
                <div className="text-sm text-slate-600">Diapositivas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{estimatedTime}</div>
                <div className="text-sm text-slate-600">Min. lectura</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Select onValueChange={loadTemplate}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Cargar plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!content}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={clearContent}
                disabled={!content}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor principal */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-6 pt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Editor</span>
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Vista Previa</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Editor de texto */}
            <TabsContent value="editor" className="p-6 space-y-4">
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Escribe tu contenido aquí...

Ejemplo:
# Título Principal
## Sección 1
Contenido de la primera sección.

## Sección 2
- Punto importante 1
- Punto importante 2
- Punto importante 3

## Conclusión
Resumen y próximos pasos."
                className="min-h-[400px] font-mono text-sm resize-none"
              />

              {/* Guía de formato */}
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>Guía de formato:</strong> Usa # para títulos principales, ## para secciones, 
                  ### para subsecciones, y - o * para viñetas. Cada línea vacía separará el contenido.
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Vista previa estructurada */}
            <TabsContent value="preview" className="p-6">
              {parsedContent && parsedContent.slides ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">
                      {parsedContent.title}
                    </h3>
                    <Badge variant="outline">
                      {parsedContent.slides.length} diapositivas
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {parsedContent.slides.map((slide, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border rounded-lg p-4 bg-slate-50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={slide.type === 'title' ? 'default' : 'secondary'}
                            >
                              Diapositiva {index + 1}
                            </Badge>
                            <Badge variant="outline">
                              {slide.type}
                            </Badge>
                          </div>
                        </div>

                        <h4 
                          className="font-semibold mb-2"
                          style={{ 
                            color: brandConfig?.colors?.primary || '#0066CC',
                            fontFamily: brandConfig?.fonts?.heading || 'Arial'
                          }}
                        >
                          {slide.title}
                        </h4>

                        {slide.content && (
                          <p 
                            className="text-sm mb-2"
                            style={{ 
                              color: brandConfig?.colors?.text || '#333333',
                              fontFamily: brandConfig?.fonts?.body || 'Arial'
                            }}
                          >
                            {slide.content}
                          </p>
                        )}

                        {slide.bullets && slide.bullets.length > 0 && (
                          <ul className="text-sm space-y-1">
                            {slide.bullets.map((bullet, bulletIndex) => (
                              <li 
                                key={bulletIndex} 
                                className="flex items-start space-x-2"
                                style={{ 
                                  color: brandConfig?.colors?.text || '#333333',
                                  fontFamily: brandConfig?.fonts?.body || 'Arial'
                                }}
                              >
                                <span 
                                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                                  style={{ 
                                    backgroundColor: brandConfig?.colors?.accent || '#FF6600'
                                  }}
                                />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Escribe contenido en el editor para ver la vista previa</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="text-center space-x-4">
        <Button
          onClick={() => onPreview(content, parsedContent)}
          disabled={!canProceed}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Eye className="w-4 h-4 mr-2" />
          Continuar al Prompt
        </Button>
      </div>
    </div>
  );
}

export default ContentEditor;

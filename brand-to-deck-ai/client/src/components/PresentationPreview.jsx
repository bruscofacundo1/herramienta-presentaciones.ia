/**
 * Componente PresentationPreview
 * 
 * Vista previa de la presentación antes de generar el archivo final.
 * 
 * @author Manus AI
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Download, 
  ArrowLeft, 
  ArrowRight, 
  Maximize2,
  Clock,
  FileText,
  Palette
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { getTextColor } from '../lib/utils';

function PresentationPreview({ 
  preview, 
  brandConfig, 
  onGenerate, 
  onBack, 
  canProceed 
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (!preview || !preview.slides) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-600">Generando vista previa...</p>
      </div>
    );
  }

  /**
   * Navegar entre diapositivas
   */
  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, preview.slides.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  /**
   * Renderizar diapositiva actual
   */
  const renderSlide = (slide, index) => {
    const colors = brandConfig?.colors || {};
    const fonts = brandConfig?.fonts || {};

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full h-full flex flex-col justify-center p-8 rounded-lg shadow-lg"
        style={{ 
          backgroundColor: colors.background || '#FFFFFF',
          minHeight: '400px'
        }}
      >
        {/* Título de la diapositiva */}
        <h2 
          className="text-3xl font-bold mb-6"
          style={{ 
            color: slide.type === 'title' || slide.type === 'section' 
              ? getTextColor(colors.primary || '#0066CC')
              : colors.primary || '#0066CC',
            fontFamily: fonts.heading || 'Arial',
            backgroundColor: slide.type === 'title' || slide.type === 'section' 
              ? colors.primary || '#0066CC' 
              : 'transparent',
            padding: slide.type === 'title' || slide.type === 'section' ? '1rem' : '0',
            borderRadius: slide.type === 'title' || slide.type === 'section' ? '0.5rem' : '0'
          }}
        >
          {slide.title}
        </h2>

        {/* Contenido de la diapositiva */}
        {slide.hasContent && slide.bulletCount === 0 && (
          <div 
            className="text-lg leading-relaxed"
            style={{ 
              color: colors.text || '#333333',
              fontFamily: fonts.body || 'Arial'
            }}
          >
            <p>Contenido de la diapositiva...</p>
          </div>
        )}

        {/* Viñetas */}
        {slide.bulletCount > 0 && (
          <div className="space-y-3">
            {Array.from({ length: slide.bulletCount }, (_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div 
                  className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: colors.accent || '#FF6600' }}
                />
                <span 
                  className="text-lg"
                  style={{ 
                    color: colors.text || '#333333',
                    fontFamily: fonts.body || 'Arial'
                  }}
                >
                  Punto importante {i + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Indicador de tipo de diapositiva */}
        <div className="mt-auto pt-6">
          <Badge 
            variant="outline"
            className="text-xs"
            style={{ 
              borderColor: colors.secondary || '#666666',
              color: colors.secondary || '#666666'
            }}
          >
            {slide.type}
          </Badge>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Título y descripción */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Vista Previa de Presentación
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Revisa cómo se verá tu presentación con el formato de marca aplicado. 
          Navega entre las diapositivas para verificar el contenido.
        </p>
      </div>

      {/* Información de la presentación */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{preview.title}</CardTitle>
              <CardDescription>
                {preview.totalSlides} diapositivas • {preview.estimatedDuration?.range || '5-10 minutos'}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{preview.totalSlides}</div>
                <div className="text-sm text-slate-600">Diapositivas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {preview.estimatedDuration?.minutes || 0}
                </div>
                <div className="text-sm text-slate-600">Minutos</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Visor de diapositivas */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          {/* Controles superiores */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                disabled={currentSlide === 0}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-600">
                {currentSlide + 1} de {preview.slides.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={nextSlide}
                disabled={currentSlide === preview.slides.length - 1}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFullscreen(!fullscreen)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Barra de progreso */}
          <Progress 
            value={((currentSlide + 1) / preview.slides.length) * 100} 
            className="mb-6"
          />

          {/* Diapositiva actual */}
          <div className="relative">
            {renderSlide(preview.slides[currentSlide], currentSlide)}
          </div>

          {/* Navegación por miniaturas */}
          <div className="mt-6 flex space-x-2 overflow-x-auto pb-2">
            {preview.slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`
                  flex-shrink-0 w-24 h-16 rounded border-2 p-2 text-xs transition-all
                  ${index === currentSlide 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'
                  }
                `}
                style={{ backgroundColor: brandConfig?.colors?.background || '#FFFFFF' }}
              >
                <div className="w-full h-full flex flex-col justify-center">
                  <div 
                    className="font-semibold truncate"
                    style={{ 
                      color: brandConfig?.colors?.primary || '#0066CC',
                      fontSize: '8px'
                    }}
                  >
                    {slide.title}
                  </div>
                  <Badge 
                    variant="outline" 
                    className="text-xs mt-1"
                    style={{ fontSize: '6px' }}
                  >
                    {slide.type}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Información de marca aplicada */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Configuración de Marca Aplicada</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colores */}
            <div>
              <h4 className="font-medium mb-3">Colores</h4>
              <div className="space-y-2">
                {Object.entries(brandConfig?.colors || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: value }}
                    />
                    <span className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fuentes */}
            <div>
              <h4 className="font-medium mb-3">Fuentes</h4>
              <div className="space-y-2">
                {Object.entries(brandConfig?.fonts || {}).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="capitalize">{key}:</span>
                    <span className="ml-2 font-medium" style={{ fontFamily: value }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Estadísticas */}
            <div>
              <h4 className="font-medium mb-3">Estadísticas</h4>
              <div className="space-y-2 text-sm">
                <div>Total de diapositivas: {preview.totalSlides}</div>
                <div>Tiempo estimado: {preview.estimatedDuration?.minutes || 0} min</div>
                <div>Tipos de diapositiva: {new Set(preview.slides.map(s => s.type)).size}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={onBack}
          size="lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Editar Contenido
        </Button>

        <Button
          onClick={onGenerate}
          disabled={!canProceed}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Generar Presentación
        </Button>
      </div>
    </div>
  );
}

export default PresentationPreview;

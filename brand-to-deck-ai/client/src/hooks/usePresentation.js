/**
 * Hook para Manejo de Presentaciones
 * 
 * Gestiona la generación de presentaciones PPTX con progreso y manejo de errores.
 * 
 * @author Manus AI
 */

import { useState, useCallback } from 'react';
import { presentationAPI } from '../lib/api';

/**
 * Hook personalizado para manejo de presentaciones
 */
export function usePresentation() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  /**
   * Generar presentación
   */
  const generatePresentation = useCallback(async (content, brandConfig, options = {}) => {
    console.log('🚀 Iniciando generación de presentación desde frontend');
    console.log('📊 Datos:', { content: !!content, brandConfig: !!brandConfig, options });
    
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      // Simular progreso durante la generación
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      console.log('📡 Enviando petición al backend...');
      const response = await presentationAPI.generate(content, brandConfig, options);

      clearInterval(progressInterval);
      setProgress(100);

      console.log('✅ Respuesta recibida del backend:', response);

      if (response.success) {
        setResult(response);
        return response;
      } else {
        const errorMessage = response.message || 'Error al generar presentación';
        console.error('❌ Error en respuesta del backend:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error en generatePresentation:', error);
      const errorMessage = error.message || 'Error desconocido al generar presentación';
      setError(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Obtener vista previa de presentación
   */
  const previewPresentation = useCallback(async (content, brandConfig) => {
    try {
      const response = await presentationAPI.preview(content, brandConfig);
      return response;
    } catch (error) {
      console.error('Error obteniendo vista previa:', error);
      throw error;
    }
  }, []);

  /**
   * Parsear contenido estructurado
   */
  const parseContent = useCallback(async (content) => {
    try {
      const response = await presentationAPI.parseContent(content);
      return response;
    } catch (error) {
      console.error('Error parseando contenido:', error);
      throw error;
    }
  }, []);

  /**
   * Obtener plantillas de contenido
   */
  const getContentTemplates = useCallback(async () => {
    try {
      const response = await presentationAPI.templates();
      return response;
    } catch (error) {
      console.error('Error obteniendo plantillas:', error);
      throw error;
    }
  }, []);

  /**
   * Resetear estado
   */
  const reset = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  /**
   * Verificar si se puede generar
   */
  const canGenerate = useCallback(() => {
    return !isGenerating;
  }, [isGenerating]);

  /**
   * Obtener mensaje de estado
   */
  const getStatusMessage = useCallback(() => {
    if (isGenerating) {
      return `Generando presentación... ${progress}%`;
    }
    if (error) {
      return `Error: ${error}`;
    }
    if (result) {
      return 'Presentación generada exitosamente';
    }
    return 'Listo para generar presentación';
  }, [isGenerating, progress, error, result]);

  return {
    // Estado
    isGenerating,
    progress,
    error,
    result,

    // Acciones
    generatePresentation,
    previewPresentation,
    parseContent,
    getContentTemplates,
    reset,

    // Verificaciones
    canGenerate,

    // Utilidades
    getStatusMessage
  };
}


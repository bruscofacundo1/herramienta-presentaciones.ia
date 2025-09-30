/**
 * Hook para Generación de Presentaciones
 * 
 * Gestiona la creación, vista previa y descarga de presentaciones PPTX.
 * 
 * @author Manus AI
 */

import { useState, useCallback } from 'react';
import { presentationAPI } from '../lib/api';
import { PROCESSING_STATES, STORAGE_KEYS } from '../lib/constants';
import { downloadFile } from '../lib/utils';

/**
 * Hook personalizado para generación de presentaciones
 */
export function usePresentationGenerator() {
  const [generationState, setGenerationState] = useState(PROCESSING_STATES.IDLE);
  const [error, setError] = useState(null);
  const [generatedPresentation, setGeneratedPresentation] = useState(null);
  const [preview, setPreview] = useState(null);
  const [recentPresentations, setRecentPresentations] = useState([]);

  /**
   * Cargar presentaciones recientes desde localStorage
   */
  const loadRecentPresentations = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECENT_PRESENTATIONS);
      if (saved) {
        const presentations = JSON.parse(saved);
        setRecentPresentations(presentations);
        return presentations;
      }
    } catch (error) {
      console.error('Error cargando presentaciones recientes:', error);
    }
    return [];
  }, []);

  /**
   * Guardar presentación en lista de recientes
   */
  const saveToRecent = useCallback((presentation) => {
    try {
      const current = loadRecentPresentations();
      const updated = [presentation, ...current.slice(0, 9)]; // Mantener solo 10 recientes
      localStorage.setItem(STORAGE_KEYS.RECENT_PRESENTATIONS, JSON.stringify(updated));
      setRecentPresentations(updated);
    } catch (error) {
      console.error('Error guardando en recientes:', error);
    }
  }, [loadRecentPresentations]);

  /**
   * Generar presentación PPTX
   */
  const generatePresentation = useCallback(async (content, brandConfig, options = {}) => {
    setGenerationState(PROCESSING_STATES.PROCESSING);
    setError(null);

    try {
      const response = await presentationAPI.generate(content, brandConfig, options);

      if (response.success) {
        setGenerationState(PROCESSING_STATES.COMPLETED);
        setGeneratedPresentation(response.data);
        
        // Guardar en recientes
        saveToRecent({
          id: response.data.presentationId,
          fileName: response.data.fileName,
          generatedAt: new Date().toISOString(),
          slides: response.data.metadata.slides
        });

        return response.data;
      } else {
        throw new Error(response.message || 'Error al generar presentación');
      }
    } catch (error) {
      setGenerationState(PROCESSING_STATES.ERROR);
      setError(error.message);
      throw error;
    }
  }, [saveToRecent]);

  /**
   * Generar vista previa de presentación
   */
  const generatePreview = useCallback(async (content, brandConfig) => {
    setError(null);

    try {
      const response = await presentationAPI.preview(content, brandConfig);

      if (response.success) {
        setPreview(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Error al generar vista previa');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  /**
   * Parsear contenido estructurado
   */
  const parseContent = useCallback(async (textContent) => {
    setError(null);

    try {
      const response = await presentationAPI.parseContent(textContent);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Error al parsear contenido');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  /**
   * Descargar presentación generada
   */
  const downloadPresentation = useCallback(async (presentationId, fileName) => {
    try {
      const downloadUrl = presentationAPI.downloadUrl(presentationId);
      downloadFile(downloadUrl, fileName);
      return true;
    } catch (error) {
      setError('Error al descargar presentación');
      throw error;
    }
  }, []);

  /**
   * Obtener información de presentación
   */
  const getPresentationInfo = useCallback(async (presentationId) => {
    try {
      const response = await presentationAPI.get(presentationId);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Presentación no encontrada');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  /**
   * Eliminar presentación
   */
  const deletePresentation = useCallback(async (presentationId) => {
    try {
      const response = await presentationAPI.delete(presentationId);

      if (response.success) {
        // Remover de recientes si existe
        const updated = recentPresentations.filter(p => p.id !== presentationId);
        setRecentPresentations(updated);
        localStorage.setItem(STORAGE_KEYS.RECENT_PRESENTATIONS, JSON.stringify(updated));
        
        return true;
      } else {
        throw new Error(response.message || 'Error al eliminar presentación');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [recentPresentations]);

  /**
   * Listar todas las presentaciones
   */
  const listPresentations = useCallback(async () => {
    try {
      const response = await presentationAPI.list();

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Error al obtener lista de presentaciones');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  /**
   * Obtener plantillas de contenido
   */
  const getContentTemplates = useCallback(async () => {
    try {
      const response = await presentationAPI.templates();

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Error al obtener plantillas');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  /**
   * Resetear estado de generación
   */
  const resetGeneration = useCallback(() => {
    setGenerationState(PROCESSING_STATES.IDLE);
    setError(null);
    setGeneratedPresentation(null);
    setPreview(null);
  }, []);

  /**
   * Verificar si se puede generar
   */
  const canGenerate = useCallback(() => {
    return generationState === PROCESSING_STATES.IDLE || generationState === PROCESSING_STATES.ERROR;
  }, [generationState]);

  /**
   * Verificar si está generando
   */
  const isGenerating = useCallback(() => {
    return generationState === PROCESSING_STATES.PROCESSING;
  }, [generationState]);

  /**
   * Verificar si la generación se completó
   */
  const isCompleted = useCallback(() => {
    return generationState === PROCESSING_STATES.COMPLETED;
  }, [generationState]);

  /**
   * Verificar si hay error
   */
  const hasError = useCallback(() => {
    return generationState === PROCESSING_STATES.ERROR || error !== null;
  }, [generationState, error]);

  /**
   * Obtener mensaje de estado
   */
  const getStatusMessage = useCallback(() => {
    switch (generationState) {
      case PROCESSING_STATES.IDLE:
        return 'Listo para generar presentación';
      case PROCESSING_STATES.PROCESSING:
        return 'Generando presentación...';
      case PROCESSING_STATES.COMPLETED:
        return 'Presentación generada exitosamente';
      case PROCESSING_STATES.ERROR:
        return error || 'Error en la generación';
      default:
        return 'Estado desconocido';
    }
  }, [generationState, error]);

  /**
   * Estimar tiempo de generación basado en contenido
   */
  const estimateGenerationTime = useCallback((content) => {
    if (typeof content === 'string') {
      const words = content.split(/\s+/).length;
      const estimatedSlides = Math.ceil(words / 100); // ~100 palabras por slide
      return Math.max(5, estimatedSlides * 2); // Mínimo 5 segundos, 2 segundos por slide
    } else if (content.slides) {
      return Math.max(5, content.slides.length * 2);
    }
    return 10; // Tiempo por defecto
  }, []);

  return {
    // Estado
    generationState,
    error,
    generatedPresentation,
    preview,
    recentPresentations,

    // Acciones principales
    generatePresentation,
    generatePreview,
    parseContent,
    downloadPresentation,

    // Gestión de presentaciones
    getPresentationInfo,
    deletePresentation,
    listPresentations,

    // Utilidades
    getContentTemplates,
    loadRecentPresentations,
    resetGeneration,

    // Verificaciones de estado
    canGenerate,
    isGenerating,
    isCompleted,
    hasError,

    // Información de estado
    getStatusMessage,
    estimateGenerationTime
  };
}

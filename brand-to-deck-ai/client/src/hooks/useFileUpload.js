/**
 * Hook para Manejo de Uploads de Archivos
 * 
 * Gestiona la carga de archivos con validación, progreso y manejo de errores.
 * 
 * @author Manus AI
 */

import { useState, useCallback } from 'react';
import { uploadAPI } from '../lib/api';
import { FILE_CONFIG, PROCESSING_STATES } from '../lib/constants';
import { validateFileType, validateFileSize, formatFileSize } from '../lib/utils';

/**
 * Hook personalizado para upload de archivos
 */
export function useFileUpload() {
  console.log("Valor de VITE_MAX_FILE_SIZE en frontend:", import.meta.env.VITE_MAX_FILE_SIZE);
  const [uploadState, setUploadState] = useState(PROCESSING_STATES.IDLE);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  /**
   * Validar archivo antes del upload
   */
  const validateFile = useCallback((file) => {
    const errors = [];

    // Validar tipo de archivo
    if (!validateFileType(file, FILE_CONFIG.ALLOWED_TYPES)) {
      errors.push(`Tipo de archivo no válido. Solo se permiten: ${FILE_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`);
    }

    // Validar tamaño
    if (!validateFileSize(file, FILE_CONFIG.MAX_SIZE)) {
      errors.push(`Archivo demasiado grande. Tamaño máximo: ${formatFileSize(FILE_CONFIG.MAX_SIZE)}`);
    }

    // Validar nombre
    if (!file.name || file.name.length < 1) {
      errors.push('Nombre de archivo inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  /**
   * Subir manual de marca
   */
  const uploadBrandManual = useCallback(async (file) => {
    // Validar archivo
    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return null;
    }

    setUploadState(PROCESSING_STATES.UPLOADING);
    setProgress(0);
    setError(null);
    setUploadedFile(file);

    try {
      // Callback para progreso
      const onProgress = (progressValue) => {
        setProgress(progressValue);
        if (progressValue === 100) {
          setUploadState(PROCESSING_STATES.PROCESSING);
        }
      };

      // Realizar upload
      const result = await uploadAPI.uploadBrandManual(file, onProgress);

      if (result.success) {
        setUploadResult(result); // Asegurar que uploadResult contenga el objeto de respuesta completo
        setUploadState(PROCESSING_STATES.COMPLETED); // Asegurar que el estado se actualice a COMPLETED aquí
        return result;
      } else {
        throw new Error(result.message || 'Error al subir archivo');
      }
    } catch (error) {
      setUploadState(PROCESSING_STATES.ERROR);
      setError(error.message);
      throw error;
    }
  }, [validateFile]);

  /**
   * Validar archivo en el servidor antes del upload
   */
  const validateFileOnServer = useCallback(async (file) => {
    try {
      const response = await uploadAPI.validateFile(file.name, file.size, file.type);
      return response.validation;
    } catch (error) {
      console.error('Error validando archivo en servidor:', error);
      return { valid: false, errors: [error.message] };
    }
  }, []);

  /**
   * Obtener información de límites de upload
   */
  const getUploadInfo = useCallback(async () => {
    try {
      const response = await uploadAPI.getUploadInfo();
      return response.uploadLimits;
    } catch (error) {
      console.error('Error obteniendo información de upload:', error);
      return null;
    }
  }, []);

  /**
   * Resetear estado del upload
   */
  const resetUpload = useCallback(() => {
    setUploadState(PROCESSING_STATES.IDLE);
    setProgress(0);
    setError(null);
    setUploadedFile(null);
    setUploadResult(null);
  }, []);

  /**
   * Cancelar upload (si es posible)
   */
  const cancelUpload = useCallback(() => {
    // En una implementación real, aquí se cancelaría la petición XMLHttpRequest
    setUploadState(PROCESSING_STATES.IDLE);
    setProgress(0);
    setError('Upload cancelado por el usuario');
  }, []);

  /**
   * Verificar si se puede subir un archivo
   */
  const canUpload = useCallback(() => {
    return uploadState === PROCESSING_STATES.IDLE || uploadState === PROCESSING_STATES.ERROR;
  }, [uploadState]);

  /**
   * Verificar si el upload está en progreso
   */
  const isUploading = useCallback(() => {
    return uploadState === PROCESSING_STATES.UPLOADING || uploadState === PROCESSING_STATES.PROCESSING;
  }, [uploadState]);

  /**
   * Verificar si el upload se completó exitosamente
   */
  const isCompleted = useCallback(() => {
    return uploadState === PROCESSING_STATES.COMPLETED;
  }, [uploadState]);

  /**
   * Verificar si hay error
   */
  const hasError = useCallback(() => {
    return uploadState === PROCESSING_STATES.ERROR || error !== null;
  }, [uploadState, error]);

  /**
   * Obtener mensaje de estado actual
   */
  const getStatusMessage = useCallback(() => {
    switch (uploadState) {
      case PROCESSING_STATES.IDLE:
        return 'Listo para subir archivo';
      case PROCESSING_STATES.UPLOADING:
        return `Subiendo archivo... ${progress}%`;
      case PROCESSING_STATES.PROCESSING:
        return 'Procesando archivo...';
      case PROCESSING_STATES.COMPLETED:
        return 'Archivo procesado exitosamente';
      case PROCESSING_STATES.ERROR:
        return error || 'Error en el upload';
      default:
        return 'Estado desconocido';
    }
  }, [uploadState, progress, error]);

  /**
   * Obtener información del archivo subido
   */
  const getFileInfo = useCallback(() => {
    if (!uploadedFile) return null;

    return {
      name: uploadedFile.name,
      size: uploadedFile.size,
      sizeFormatted: formatFileSize(uploadedFile.size),
      type: uploadedFile.type,
      lastModified: new Date(uploadedFile.lastModified)
    };
  }, [uploadedFile]);

  return {
    // Estado
    uploadState,
    progress,
    error,
    uploadedFile,
    uploadResult,

    // Acciones
    uploadBrandManual,
    validateFile,
    validateFileOnServer,
    getUploadInfo,
    resetUpload,
    cancelUpload,

    // Verificaciones de estado
    canUpload,
    isUploading,
    isCompleted,
    hasError,

    // Utilidades
    getStatusMessage,
    getFileInfo
  };
}

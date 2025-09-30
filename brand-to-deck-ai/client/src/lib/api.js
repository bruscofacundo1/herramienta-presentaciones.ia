/**
 * Cliente API para Brand-to-Deck AI
 * 
 * Maneja todas las comunicaciones con el backend API.
 * 
 * @author Manus AI
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Clase principal del cliente API
 */
class ApiClient {
  constructor( ) {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Realizar petición HTTP genérica
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      signal: AbortSignal.timeout(600000), // 10 minutos de timeout para solicitudes largas

      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Si hay FormData, remover Content-Type para que el browser lo configure automáticamente
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Intentar parsear como JSON
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en petición API:', error);
      throw error;
    }
  }

  /**
   * Métodos HTTP específicos
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ==================== MÉTODOS DE UPLOAD ====================

  /**
   * Subir manual de marca
   */
  async uploadBrandManual(file, onProgress = null) {
    const formData = new FormData();
    formData.append('brandManual', file);

    // Si se proporciona callback de progreso, usar XMLHttpRequest
    if (onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (onProgress) onProgress(100); // Asegurar que el progreso llegue a 100% al completar
              resolve(response);
            } catch (error) {
              reject(new Error("Error al parsear respuesta"));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Error de red'));
        });

        xhr.open('POST', `${this.baseURL}/upload/brand-manual`);
        xhr.send(formData);
      });
    }

    // Usar fetch normal si no hay callback de progreso
    return this.post('/upload/brand-manual', formData);
  }

  /**
   * Validar archivo antes de subir
   */
  async validateFile(fileName, fileSize, fileType) {
    return this.post('/upload/validate', {
      fileName,
      fileSize,
      fileType
    });
  }

  /**
   * Obtener información de límites de upload
   */
  async getUploadInfo() {
    return this.get('/upload/info');
  }

  // ==================== MÉTODOS DE MARCA ====================

  /**
   * Crear configuración de marca
   */
  async createBrandConfig(brandConfig, source = 'manual') {
    return this.post('/brand/config', { brandConfig, source });
  }

  /**
   * Obtener configuración de marca
   */
  async getBrandConfig(configId) {
    return this.get(`/brand/config/${configId}`);
  }

  /**
   * Actualizar configuración de marca
   */
  async updateBrandConfig(configId, brandConfig) {
    return this.put(`/brand/config/${configId}`, { brandConfig });
  }

  /**
   * Eliminar configuración de marca
   */
  async deleteBrandConfig(configId) {
    return this.delete(`/brand/config/${configId}`);
  }

  /**
   * Listar configuraciones de marca
   */
  async listBrandConfigs() {
    return this.get('/brand/configs');
  }

  /**
   * Obtener vista previa de configuración de marca
   */
  async getBrandPreview(configId) {
    return this.get(`/brand/preview/${configId}`);
  }

  /**
   * Validar configuración de marca
   */
  async validateBrandConfig(brandConfig) {
    return this.post('/brand/validate', { brandConfig });
  }

  /**
   * Obtener plantillas de marca predefinidas
   */
  async getBrandTemplates() {
    return this.get('/brand/templates');
  }

  // ==================== MÉTODOS DE PRESENTACIÓN ====================

  /**
   * Generar presentación
   */
  async generatePresentation(content, brandConfig, options = {}) {
    return this.post('/presentation/generate', {
      content,
      brandConfig,
      options
    });
  }

  /**
   * Obtener información de presentación
   */
  async getPresentation(presentationId) {
    return this.get(`/presentation/${presentationId}`);
  }

  /**
   * Eliminar presentación
   */
  async deletePresentation(presentationId) {
    return this.delete(`/presentation/${presentationId}`);
  }

  /**
   * Listar presentaciones generadas
   */
  async listPresentations() {
    return this.get('/presentation');
  }

  /**
   * Generar vista previa de presentación
   */
  async previewPresentation(content, brandConfig) {
    return this.post('/presentation/preview', { content, brandConfig });
  }

  /**
   * Parsear contenido estructurado
   */
  async parseContent(content) {
    return this.post('/presentation/parse-content', { content });
  }

  /**
   * Obtener plantillas de contenido
   */
  async getContentTemplates() {
    return this.get('/presentation/templates');
  }

  /**
   * Obtener URL de descarga para presentación
   */
  getPresentationDownloadUrl(presentationId) {
    return `${this.baseURL}/presentation/${presentationId}/download`;
  }

  // ==================== MÉTODOS DE UTILIDAD ====================

  /**
   * Verificar estado de salud del API
   */
  async healthCheck() {
    return this.get('/health');
  }

  /**
   * Obtener información general del API
   */
  async getApiInfo() {
    return this.get('/');
  }
}

// Crear instancia singleton del cliente API
const apiClient = new ApiClient();

// Exportar métodos individuales para facilidad de uso
export const uploadAPI = {
  uploadBrandManual: (file, onProgress) => apiClient.uploadBrandManual(file, onProgress),
  validateFile: (fileName, fileSize, fileType) => apiClient.validateFile(fileName, fileSize, fileType),
  getUploadInfo: () => apiClient.getUploadInfo(),
};

export const brandAPI = {
  create: (brandConfig, source) => apiClient.createBrandConfig(brandConfig, source),
  get: (configId) => apiClient.getBrandConfig(configId),
  update: (configId, brandConfig) => apiClient.updateBrandConfig(configId, brandConfig),
  delete: (configId) => apiClient.deleteBrandConfig(configId),
  list: () => apiClient.listBrandConfigs(),
  preview: (configId) => apiClient.getBrandPreview(configId),
  validate: (brandConfig) => apiClient.validateBrandConfig(brandConfig),
  templates: () => apiClient.getBrandTemplates(),
};

export const presentationAPI = {
  generate: (content, brandConfig, options) => apiClient.generatePresentation(content, brandConfig, options),
  get: (presentationId) => apiClient.getPresentation(presentationId),
  delete: (presentationId) => apiClient.deletePresentation(presentationId),
  list: () => apiClient.listPresentations(),
  preview: (content, brandConfig) => apiClient.previewPresentation(content, brandConfig),
  parseContent: (content) => apiClient.parseContent(content),
  templates: () => apiClient.getContentTemplates(),
  downloadUrl: (presentationId) => apiClient.getPresentationDownloadUrl(presentationId),
};

export const utilityAPI = {
  healthCheck: () => apiClient.healthCheck(),
  getApiInfo: () => apiClient.getApiInfo(),
};

// Exportar cliente completo como default
export default apiClient;

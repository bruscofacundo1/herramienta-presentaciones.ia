/**
 * Constantes para Brand-to-Deck AI
 * 
 * Valores constantes utilizados en toda la aplicación.
 * 
 * @author Manus AI
 */

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_SIZE: 52428800, // 50MB
  ALLOWED_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf']
};

// Tipos de diapositivas
export const SLIDE_TYPES = {
  TITLE: 'title',
  SECTION: 'section',
  CONTENT: 'content',
  BULLETS: 'bullets',
  IMAGE: 'image'
};

// Estados de procesamiento
export const PROCESSING_STATES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error'
};

// Colores por defecto para temas
export const DEFAULT_COLORS = {
  primary: '#0066CC',
  secondary: '#666666',
  accent: '#FF6600',
  background: '#FFFFFF',
  text: '#333333'
};

// Fuentes disponibles
export const AVAILABLE_FONTS = [
  'Arial',
  'Arial Black',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Calibri',
  'Tahoma'
];

// Plantillas de marca predefinidas
export const BRAND_TEMPLATES = [
  {
    id: 'corporate-blue',
    name: 'Corporativo Azul',
    colors: {
      primary: '#0066CC',
      secondary: '#4A90E2',
      accent: '#FF6B35',
      background: '#FFFFFF',
      text: '#333333'
    }
  },
  {
    id: 'modern-green',
    name: 'Moderno Verde',
    colors: {
      primary: '#2ECC71',
      secondary: '#27AE60',
      accent: '#E74C3C',
      background: '#FFFFFF',
      text: '#2C3E50'
    }
  },
  {
    id: 'elegant-purple',
    name: 'Elegante Púrpura',
    colors: {
      primary: '#9B59B6',
      secondary: '#8E44AD',
      accent: '#F39C12',
      background: '#FFFFFF',
      text: '#34495E'
    }
  }
];

// Mensajes de la aplicación
export const MESSAGES = {
  UPLOAD: {
    SUCCESS: 'Archivo subido exitosamente',
    ERROR: 'Error al subir el archivo',
    INVALID_TYPE: 'Tipo de archivo no válido',
    TOO_LARGE: 'El archivo es demasiado grande'
  },
  GENERATION: {
    SUCCESS: 'Presentación generada exitosamente',
    ERROR: 'Error al generar la presentación',
    PROCESSING: 'Generando presentación...'
  },
  BRAND: {
    EXTRACTED: 'Configuración de marca extraída',
    SAVED: 'Configuración guardada',
    ERROR: 'Error al procesar la marca'
  }
};

// Configuración de animaciones
export const ANIMATIONS = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out'
  }
};

// Breakpoints para responsive design
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
};

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'Brand-to-Deck AI',
  VERSION: '1.0.0',
  DESCRIPTION: 'Generador de Presentaciones Corporativas',
  AUTHOR: 'Manus AI'
};

// URLs y endpoints
export const ENDPOINTS = {
  UPLOAD: '/api/upload',
  BRAND: '/api/brand',
  PRESENTATION: '/api/presentation',
  HEALTH: '/api/health'
};

// Configuración de validación
export const VALIDATION = {
  MIN_CONTENT_LENGTH: 10,
  MAX_CONTENT_LENGTH: 50000,
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 100
};

// Iconos para tipos de archivo
export const FILE_ICONS = {
  'application/pdf': '📄',
  'image/jpeg': '🖼️',
  'image/png': '🖼️',
  'image/gif': '🖼️',
  'default': '📁'
};

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  DURATION: 5000,
  POSITION: 'top-right',
  MAX_NOTIFICATIONS: 3
};

// Configuración de localStorage
export const STORAGE_KEYS = {
  BRAND_CONFIG: 'brand-to-deck-ai:brand-config',
  USER_PREFERENCES: 'brand-to-deck-ai:preferences',
  RECENT_PRESENTATIONS: 'brand-to-deck-ai:recent-presentations'
};

// Configuración de desarrollo
export const DEV_CONFIG = {
  API_URL: 'http://localhost:5000/api',
  DEBUG: import.meta.env.DEV,
  LOG_LEVEL: 'info'
};

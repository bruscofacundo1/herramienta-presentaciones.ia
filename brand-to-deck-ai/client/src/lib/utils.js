/**
 * Utilidades para Brand-to-Deck AI Frontend
 * 
 * Funciones auxiliares y utilidades comunes.
 * 
 * @author Manus AI
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combinar clases de Tailwind CSS de forma inteligente
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formatear tamaño de archivo
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validar formato de color hexadecimal
 */
export function isValidHexColor(color) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Convertir color hex a RGB
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calcular luminancia de un color
 */
export function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determinar si un color es claro u oscuro
 */
export function isLightColor(hex) {
  return getLuminance(hex) > 0.5;
}

/**
 * Generar color de texto apropiado para un fondo
 */
export function getTextColor(backgroundColor) {
  return isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
}

/**
 * Debounce para funciones
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Formatear fecha de forma legible
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleDateString('es-ES', { ...defaultOptions, ...options });
}

/**
 * Formatear fecha relativa (hace X tiempo)
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'hace unos segundos';
}

/**
 * Truncar texto
 */
export function truncate(str, length = 100) {
  if (str.length <= length) return str;
  return str.substr(0, length) + '...';
}

/**
 * Validar tipos de archivo
 */
export function validateFileType(file, allowedTypes) {
  return allowedTypes.includes(file.type);
}

/**
 * Validar tamaño de archivo
 */
export function validateFileSize(file, maxSize) {
  return file.size <= maxSize;
}

/**
 * Descargar archivo desde URL
 */
export function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

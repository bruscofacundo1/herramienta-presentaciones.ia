/**
 * Componente BrandConfig
 * 
 * Interfaz para configurar y personalizar elementos de marca extraídos.
 * 
 * @author Manus AI
 */

import { useState, useEffect } from 'react';

function BrandConfig({ brandConfig, onSave, isLoading }) {
  const [localConfig, setLocalConfig] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Inicializar configuración local
  useEffect(() => {
    if (brandConfig) {
      setLocalConfig({
        colors: {
          primary: '#2c3e50',
          accent: '#3498db',
          secondary: '#95a5a6',
          background: '#ffffff',
          text: '#2c3e50',
          ...brandConfig.colors
        },
        fonts: {
          heading: 'Arial',
          body: 'Arial',
          accent: 'Arial',
          ...brandConfig.fonts
        }
      });
    }
  }, [brandConfig]);

  const handleColorChange = (colorKey, value) => {
    if (!localConfig) return;
    
    const newConfig = {
      ...localConfig,
      colors: {
        ...localConfig.colors,
        [colorKey]: value
      }
    };
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  const handleFontChange = (fontKey, value) => {
    if (!localConfig) return;
    
    const newConfig = {
      ...localConfig,
      fonts: {
        ...localConfig.fonts,
        [fontKey]: value
      }
    };
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (localConfig && onSave) {
      onSave(localConfig);
      setHasChanges(false);
    }
  };

  if (!localConfig) {
    return (
      <div className="container">
        <div className="status processing">
          <p>Cargando configuración de marca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="instructions-container">
        <h3>Configuración de Marca Extraída</h3>
        <p>Revisa y ajusta los elementos de marca detectados automáticamente por la IA.</p>
      </div>

      <div className="form-section">
        <h4>Colores de Marca</h4>
        
        <div className="form-group">
          <label htmlFor="primaryColor">Color Primario</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="color"
              id="primaryColor"
              value={localConfig.colors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              style={{ width: '50px', height: '40px', border: 'none', borderRadius: '4px' }}
            />
            <input
              type="text"
              value={localConfig.colors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="form-control"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="accentColor">Color de Acento</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="color"
              id="accentColor"
              value={localConfig.colors.accent}
              onChange={(e) => handleColorChange('accent', e.target.value)}
              style={{ width: '50px', height: '40px', border: 'none', borderRadius: '4px' }}
            />
            <input
              type="text"
              value={localConfig.colors.accent}
              onChange={(e) => handleColorChange('accent', e.target.value)}
              className="form-control"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <h4 style={{ marginTop: '2rem' }}>Tipografía</h4>
        
        <div className="form-group">
          <label htmlFor="headingFont">Fuente para Títulos</label>
          <select
            id="headingFont"
            value={localConfig.fonts.heading}
            onChange={(e) => handleFontChange('heading', e.target.value)}
            className="form-control"
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="bodyFont">Fuente para Texto</label>
          <select
            id="bodyFont"
            value={localConfig.fonts.body}
            onChange={(e) => handleFontChange('body', e.target.value)}
            className="form-control"
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasChanges || isLoading}
          className="btn-primary"
          style={{ marginTop: '1.5rem' }}
        >
          {isLoading ? 'Guardando...' : 'Continuar con esta Configuración'}
        </button>
      </div>
    </div>
  );
}

export default BrandConfig;


// client/src/components/BrandUploader.jsx

import React from 'react';

// Un pequeño componente para el ícono de carga animado
const LoaderIcon = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

function BrandUploader({ onFileUpload, uploadState, progress, error }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const isProcessing = uploadState === 'UPLOADING' || uploadState === 'PROCESSING';

  return (
    <div className="container">
      <div className="instructions-container">
        <h3>Instrucciones de Uso</h3>
        <ul>
          <li>Selecciona tu manual de marca en formato PDF.</li>
          <li>La IA analizará automáticamente los colores, fuentes y elementos de diseño.</li>
          <li>Verifica la configuración extraída en el siguiente paso.</li>
          <li>Genera tu presentación personalizada con el estilo de tu marca.</li>
        </ul>
      </div>

      <form className="form-section">
        <div className="form-group">
          <label htmlFor="brandManual">1. Cargar Manual de Marca</label>
          <input
            type="file"
            id="brandManual"
            name="brandManual"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
        </div>
      </form>
      
      {/* --- BARRA DE PROGRESO Y MENSAJES DE ESTADO --- */}
      {uploadState === 'UPLOADING' && (
        <div className="status processing">
          <p>Subiendo archivo...</p>
          <div style={{ 
            width: '100%', 
            backgroundColor: '#e9ecef', 
            borderRadius: '4px', 
            height: '8px', 
            marginTop: '10px' 
          }}>
            <div style={{ 
              width: `${progress}%`, 
              backgroundColor: '#4285f4', 
              height: '8px', 
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>
      )}

      {uploadState === 'PROCESSING' && (
        <div className="status processing">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LoaderIcon />
            Procesando manual de marca...
          </div>
        </div>
      )}

      {error && (
        <div className="status error">
          Error: {error}
        </div>
      )}
    </div>
  );
}

export default BrandUploader;


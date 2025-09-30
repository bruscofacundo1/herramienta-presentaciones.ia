// client/src/components/StatusScreen.jsx

import React from 'react';

const LoaderIcon = () => (
  <svg className="animate-spin mr-3 h-6 w-6 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

function StatusScreen({ uploadState, progress, error, fileName }) {
  const getStatusMessage = () => {
    switch (uploadState) {
      case 'UPLOADING':
        return `Subiendo "${fileName}"...`;
      case 'PROCESSING':
        return 'Procesando manual con IA...';
      case 'ERROR':
        return 'Ocurrió un error';
      default:
        return 'Iniciando...';
    }
  };

  return (
    <div className="bg-white/85 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/30 w-full text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">
        {getStatusMessage()}
      </h2>
      <p className="text-slate-600 mb-6">
        {uploadState === 'PROCESSING' 
          ? 'Analizando contenido, colores y fuentes. Esto puede tardar un momento.' 
          : 'Por favor, espera a que el proceso finalice.'
        }
      </p>
      
      <div className="w-full bg-slate-200 rounded-full h-4 mb-2 overflow-hidden">
        <div 
          className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-lg font-semibold text-blue-700">{progress}%</p>

      {error && (
        <div className="mt-6 p-4 rounded-lg bg-red-100 text-red-800 font-medium">
          Error: {error}
        </div>
      )}
    </div>
  );
}

export default StatusScreen;
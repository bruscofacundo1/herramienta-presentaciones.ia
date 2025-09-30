// client/src/App.jsx

import { useState, useEffect } from 'react';
import BrandUploader from './components/BrandUploader';
import ChatInterface from './components/ChatInterface';
import StatusScreen from './components/StatusScreen';
import { useBrandConfig } from './hooks/useBrandConfig';
import { useFileUpload } from './hooks/useFileUpload';
import { usePresentation } from './hooks/usePresentation';
import { Footer } from './components/layout/Footer';

const STEPS = {
  UPLOAD: 'upload',
  LOADING: 'loading',
  CHAT: 'chat',
  GENERATING: 'generating',
  COMPLETE: 'complete',
};

function App() {
  const [currentStep, setCurrentStep] = useState(STEPS.UPLOAD);
  
  const brandConfigHook = useBrandConfig();
  const fileUpload = useFileUpload();
  const presentation = usePresentation();

  const handleFileUpload = (file) => {
    setCurrentStep(STEPS.LOADING);
    fileUpload.uploadBrandManual(file);
  };
  
  useEffect(() => {
    if (fileUpload.uploadState === 'completed' && fileUpload.uploadResult) {
      brandConfigHook.setBrandConfig(fileUpload.uploadResult.data.brandConfig);
      setCurrentStep(STEPS.CHAT);
    }
    if (fileUpload.uploadState === 'error') {
      setTimeout(() => {
        setCurrentStep(STEPS.UPLOAD);
      }, 3000);
    }
  }, [fileUpload.uploadState, fileUpload.uploadResult, brandConfigHook.setBrandConfig]);

  const handleGeneratePresentation = async (prompt) => {
    setCurrentStep(STEPS.GENERATING);
    try {
      const result = await presentation.generatePresentation(
        null, // No necesitamos parsedContent ya que el prompt contiene toda la información
        brandConfigHook.brandConfig,
        { prompt }
      );
      setCurrentStep(STEPS.COMPLETE);
    } catch (error) {
      console.error('Error generando presentación:', error);
      alert(`Error al generar presentación: ${error.message}`);
      setCurrentStep(STEPS.CHAT);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(STEPS.UPLOAD);
    brandConfigHook.resetConfig();
    fileUpload.resetUpload();
    presentation.reset();
  };

  const renderStep = () => {
    switch (currentStep) {
      case STEPS.LOADING:
        return (
          <StatusScreen
            uploadState={fileUpload.uploadState}
            progress={fileUpload.progress}
            error={fileUpload.error}
            fileName={fileUpload.fileName}
          />
        );
      case STEPS.CHAT:
        return (
          <ChatInterface
            brandConfig={brandConfigHook.brandConfig}
            onGeneratePresentation={handleGeneratePresentation}
            isGenerating={presentation.isGenerating}
          />
        );
      case STEPS.GENERATING:
        return (
          <StatusScreen
            uploadState="PROCESSING"
            progress={presentation.progress}
            error={presentation.error}
            message="Generando presentación..."
          />
        );
      case STEPS.COMPLETE:
        return (
          <div className="container text-center space-y-6">
            <div className="success-message">
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                ¡Presentación Generada Exitosamente!
              </h2>
              <p className="text-slate-600 mb-6">
                Tu presentación ha sido creada con el formato de tu marca.
              </p>
              {presentation.result && (
                <div className="space-y-4">
                  <a
                    href={presentation.result.downloadUrl}
                    download
                    className="btn-primary inline-flex items-center"
                  >
                    Descargar Presentación PPTX
                  </a>
                  <div className="text-sm text-slate-500">
                    Archivo: {presentation.result.fileName}
                  </div>
                </div>
              )}
              <button
                onClick={handleStartOver}
                className="btn-secondary mt-4"
              >
                Crear Nueva Presentación
              </button>
            </div>
          </div>
        );
      case STEPS.UPLOAD:
      default:
        return (
          <BrandUploader 
            onFileUpload={handleFileUpload}
            uploadState={fileUpload.uploadState}
            progress={fileUpload.progress}
            error={fileUpload.error}
          />
        );
    }
  };

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <div className="brand">
            <h1>Generación de Presentación con IA</h1>
            <p className="subtitle">Gerenciando Canales</p>
          </div>
          <div className="top-buttons">
            <button className="top-btn instructivo-btn">
              Generación de Presentación con IA
            </button>
          </div>
        </div>
      </header>

      <main>
        {renderStep()}
      </main>

      <Footer />
    </div>
  );
}

export default App;


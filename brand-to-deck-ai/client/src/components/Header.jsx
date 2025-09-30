/**
 * Componente Header
 * 
 * Barra superior de la aplicación con navegación y progreso.
 * 
 * @author Manus AI
 */

import { Menu, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { APP_CONFIG } from '../lib/constants';

function Header({ onMenuClick, progress, currentStep }) {
  const getStepName = (step) => {
    const stepNames = {
      upload: 'Cargar Manual',
      configure: 'Configurar Marca',
      content: 'Crear Contenido',
      preview: 'Vista Previa',
      generate: 'Generar'
    };
    return stepNames[step] || 'Paso Desconocido';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">
                  {APP_CONFIG.NAME}
                </h1>
                <p className="text-xs text-slate-600 hidden sm:block">
                  {APP_CONFIG.DESCRIPTION}
                </p>
              </div>
            </div>
          </div>

          {/* Progreso */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {getStepName(currentStep)}
                </span>
                <span className="text-slate-600">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Información de versión */}
          <div className="text-xs text-slate-500 hidden lg:block">
            v{APP_CONFIG.VERSION}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

/**
 * Componente Sidebar
 * 
 * Barra lateral con navegación y presentaciones recientes.
 * 
 * @author Manus AI
 */

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  Settings, 
  FileText, 
  Eye, 
  Download,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { formatRelativeTime, downloadFile } from '../lib/utils';
import { cn } from '../lib/utils';

const STEPS = [
  {
    id: 'upload',
    name: 'Cargar Manual',
    icon: Upload,
    description: 'Subir manual de marca'
  },
  {
    id: 'configure',
    name: 'Configurar',
    icon: Settings,
    description: 'Ajustar elementos de marca'
  },
  {
    id: 'content',
    name: 'Contenido',
    icon: FileText,
    description: 'Escribir presentación'
  },
  {
    id: 'preview',
    name: 'Vista Previa',
    icon: Eye,
    description: 'Revisar resultado'
  },
  {
    id: 'generate',
    name: 'Generar',
    icon: Download,
    description: 'Crear archivo final'
  }
];

function Sidebar({ 
  isOpen, 
  onClose, 
  currentStep, 
  onStepChange, 
  recentPresentations = [] 
}) {
  /**
   * Verificar si un paso está completado
   */
  const isStepCompleted = (stepId) => {
    const stepIndex = STEPS.findIndex(s => s.id === stepId);
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    return stepIndex < currentIndex;
  };

  /**
   * Verificar si un paso está activo
   */
  const isStepActive = (stepId) => {
    return stepId === currentStep;
  };

  /**
   * Verificar si un paso es accesible
   */
  const isStepAccessible = (stepId) => {
    const stepIndex = STEPS.findIndex(s => s.id === stepId);
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    return stepIndex <= currentIndex;
  };

  /**
   * Manejar click en paso
   */
  const handleStepClick = (stepId) => {
    if (isStepAccessible(stepId)) {
      onStepChange(stepId);
      onClose();
    }
  };

  /**
   * Descargar presentación reciente
   */
  const handleDownloadRecent = (presentation) => {
    // En una implementación real, esto haría una petición al servidor
    console.log('Descargando presentación:', presentation.fileName);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-white border-r border-slate-200 z-50 overflow-y-auto"
          >
            {/* Header del sidebar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Navegación
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Pasos del proceso */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-slate-600 mb-3">
                Proceso de Creación
              </h3>
              <div className="space-y-2">
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const completed = isStepCompleted(step.id);
                  const active = isStepActive(step.id);
                  const accessible = isStepAccessible(step.id);

                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(step.id)}
                      disabled={!accessible}
                      className={cn(
                        "w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all",
                        active && "bg-blue-50 border border-blue-200",
                        completed && !active && "bg-green-50 border border-green-200",
                        !accessible && "opacity-50 cursor-not-allowed",
                        accessible && !active && !completed && "hover:bg-slate-50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        active && "bg-blue-600 text-white",
                        completed && !active && "bg-green-600 text-white",
                        !active && !completed && accessible && "bg-slate-200 text-slate-600",
                        !accessible && "bg-slate-100 text-slate-400"
                      )}>
                        {completed && !active ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className={cn(
                          "font-medium",
                          active && "text-blue-800",
                          completed && !active && "text-green-800",
                          !active && !completed && accessible && "text-slate-800",
                          !accessible && "text-slate-400"
                        )}>
                          {step.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {step.description}
                        </div>
                      </div>

                      {accessible && (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Presentaciones recientes */}
            {recentPresentations.length > 0 && (
              <div className="p-4 border-t border-slate-200">
                <h3 className="text-sm font-medium text-slate-600 mb-3">
                  Presentaciones Recientes
                </h3>
                <div className="space-y-2">
                  {recentPresentations.slice(0, 5).map((presentation) => (
                    <Card key={presentation.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-800 truncate">
                            {presentation.fileName}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {presentation.slides} slides
                            </Badge>
                            <span className="text-xs text-slate-500">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {formatRelativeTime(presentation.generatedAt)}
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadRecent(presentation)}
                          className="ml-2"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="p-4 border-t border-slate-200 mt-auto">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">¿Necesitas Ayuda?</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-slate-600 mb-3">
                    Consulta nuestra guía de uso para aprovechar al máximo Brand-to-Deck AI.
                  </p>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Ver Guía
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Sidebar;

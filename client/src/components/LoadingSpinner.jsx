/**
 * Componente LoadingSpinner
 * 
 * Indicador de carga con mensaje personalizable.
 * 
 * @author Manus AI
 */

import { motion } from 'framer-motion';

function LoadingSpinner({ 
  message = 'Cargando...', 
  submessage = null,
  size = 'md' 
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Spinner animado */}
      <motion.div
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Mensaje principal */}
      <div className="text-center">
        <motion.p
          className={`${textSizeClasses[size]} font-medium text-slate-700`}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          {message}
        </motion.p>

        {/* Submensaje */}
        {submessage && (
          <p className="text-sm text-slate-500 mt-2">
            {submessage}
          </p>
        )}
      </div>

      {/* Puntos animados */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-blue-600 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default LoadingSpinner;

// client/src/components/layout/Header.jsx

import React from 'react';

export function Header() {
  return (
    <header className="bg-white/85 backdrop-blur-md p-4 border-b border-black/5 shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="brand">
          <h1 className="text-2xl font-semibold text-slate-800">
            Gerenciando Canales
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Generador IA de Presentaciones
          </p>
        </div>
        {/* Aquí se podrían agregar botones en el futuro si es necesario */}
      </div>
    </header>
  );
}
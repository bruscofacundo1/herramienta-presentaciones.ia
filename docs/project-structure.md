# Estructura del Proyecto Brand-to-Deck AI

## Visión General

Brand-to-Deck AI está estructurado como una aplicación full-stack con frontend React y backend Node.js, diseñada para ser escalable y mantenible.

## Estructura de Directorios

```
brand-to-deck-ai/
├── client/                          # Frontend React
│   ├── public/                      # Archivos públicos estáticos
│   ├── src/
│   │   ├── components/              # Componentes React reutilizables
│   │   │   ├── ui/                  # Componentes de UI (shadcn/ui)
│   │   │   ├── BrandUploader.jsx    # Componente para cargar manuales
│   │   │   ├── ContentEditor.jsx    # Editor de contenido
│   │   │   ├── PresentationPreview.jsx # Vista previa
│   │   │   └── BrandConfig.jsx      # Configuración de marca
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useBrandConfig.js    # Hook para configuración de marca
│   │   │   ├── useFileUpload.js     # Hook para carga de archivos
│   │   │   └── usePresentationGen.js # Hook para generación
│   │   ├── lib/                     # Utilidades y configuraciones
│   │   │   ├── api.js               # Cliente API
│   │   │   ├── utils.js             # Funciones utilitarias
│   │   │   └── constants.js         # Constantes de la aplicación
│   │   ├── assets/                  # Recursos estáticos (imágenes, iconos)
│   │   ├── App.jsx                  # Componente principal
│   │   ├── App.css                  # Estilos principales
│   │   ├── index.css                # Estilos globales
│   │   └── main.jsx                 # Punto de entrada
│   ├── index.html                   # HTML principal
│   ├── package.json                 # Dependencias del frontend
│   └── vite.config.js               # Configuración de Vite
├── server/                          # Backend Node.js
│   ├── routes/                      # Definición de rutas de API
│   │   ├── brand.js                 # Rutas para manejo de marca
│   │   ├── presentation.js          # Rutas para generación de presentaciones
│   │   └── upload.js                # Rutas para carga de archivos
│   ├── services/                    # Lógica de negocio
│   │   ├── pdfParser.js             # Servicio para parsear PDFs
│   │   ├── brandExtractor.js        # Extracción de elementos de marca
│   │   ├── pptxGenerator.js         # Generación de archivos PPTX
│   │   └── templateManager.js       # Gestión de plantillas
│   ├── utils/                       # Utilidades del servidor
│   │   ├── fileUtils.js             # Utilidades para archivos
│   │   ├── colorUtils.js            # Utilidades para colores
│   │   └── validators.js            # Validadores de entrada
│   ├── middleware/                  # Middleware personalizado
│   │   ├── auth.js                  # Middleware de autenticación
│   │   ├── upload.js                # Middleware para carga de archivos
│   │   └── errorHandler.js          # Manejo de errores
│   ├── uploads/                     # Directorio para archivos subidos
│   ├── generated/                   # Directorio para archivos generados
│   ├── index.js                     # Punto de entrada del servidor
│   ├── package.json                 # Dependencias del backend
│   ├── .env                         # Variables de entorno
│   └── .env.example                 # Ejemplo de variables de entorno
├── docs/                            # Documentación del proyecto
│   ├── project-structure.md         # Este archivo
│   ├── api-documentation.md         # Documentación de API
│   ├── installation-guide.md        # Guía de instalación
│   └── deployment-guide.md          # Guía de despliegue
├── assets/                          # Recursos compartidos
│   └── examples/                    # Archivos de ejemplo
├── package.json                     # Configuración principal del proyecto
├── .gitignore                       # Archivos ignorados por Git
└── README.md                        # Documentación principal
```

## Descripción de Componentes Principales

### Frontend (client/)

#### Componentes React
- **BrandUploader**: Maneja la carga de archivos PDF de manuales de marca
- **ContentEditor**: Editor de texto estructurado para crear contenido de presentaciones
- **PresentationPreview**: Vista previa de las diapositivas generadas
- **BrandConfig**: Interfaz para configurar colores, fuentes y elementos de marca

#### Hooks Personalizados
- **useBrandConfig**: Gestiona el estado de configuración de marca
- **useFileUpload**: Maneja la lógica de carga de archivos
- **usePresentationGen**: Controla el proceso de generación de presentaciones

### Backend (server/)

#### Servicios
- **pdfParser**: Extrae texto e información de archivos PDF
- **brandExtractor**: Identifica y extrae elementos de marca (colores, fuentes)
- **pptxGenerator**: Genera archivos PowerPoint usando PptxGenJS
- **templateManager**: Gestiona plantillas y Slide Masters

#### Rutas de API
- **brand**: Endpoints para gestión de configuración de marca
- **presentation**: Endpoints para generación de presentaciones
- **upload**: Endpoints para carga de archivos

## Flujo de Datos

1. **Carga de Manual**: Usuario sube PDF → `upload.js` → `pdfParser.js` → `brandExtractor.js`
2. **Configuración**: Frontend recibe datos extraídos → `BrandConfig` → API de actualización
3. **Generación**: Usuario crea contenido → `ContentEditor` → `pptxGenerator.js` → Archivo PPTX
4. **Descarga**: Archivo generado → Cliente descarga

## Tecnologías por Capa

### Frontend
- **React 18**: Framework de UI
- **Vite**: Bundler y servidor de desarrollo
- **Tailwind CSS**: Framework de estilos
- **shadcn/ui**: Biblioteca de componentes
- **Lucide Icons**: Iconografía
- **Framer Motion**: Animaciones

### Backend
- **Express.js**: Framework web
- **PptxGenJS**: Generación de archivos PPTX
- **pdf-parse**: Parsing de archivos PDF
- **Multer**: Manejo de uploads
- **CORS**: Cross-Origin Resource Sharing
- **Helmet**: Seguridad HTTP

## Consideraciones de Arquitectura

### Escalabilidad
- Separación clara entre frontend y backend
- Servicios modulares y reutilizables
- API RESTful bien definida

### Mantenibilidad
- Estructura de directorios clara y consistente
- Separación de responsabilidades
- Documentación completa

### Seguridad
- Validación de archivos subidos
- Rate limiting en API
- Sanitización de entradas
- Headers de seguridad con Helmet

### Performance
- Lazy loading de componentes
- Optimización de bundles con Vite
- Caching de archivos generados
- Compresión de respuestas

# Brand-to-Deck AI: Guía de Instalación y Configuración

Esta guía proporciona instrucciones detalladas para configurar el entorno de desarrollo, instalar las dependencias y ejecutar la aplicación Brand-to-Deck AI localmente. También incluye recomendaciones para la configuración de VS Code.

## 1. Configuración del Entorno de Desarrollo

Para desarrollar y ejecutar Brand-to-Deck AI, necesitarás tener instalados los siguientes componentes:

### 1.1. Node.js y pnpm

Brand-to-Deck AI utiliza Node.js para su backend (Express) y frontend (React). Se recomienda usar `pnpm` como gestor de paquetes debido a su eficiencia y cómo maneja las dependencias. La versión de Node.js debe ser `v18` o superior.

1.  **Instalar Node.js:**
    Descarga e instala la versión LTS de Node.js desde el sitio web oficial: [nodejs.org](https://nodejs.org/en/download/).

2.  **Instalar pnpm:**
    Una vez que Node.js esté instalado, puedes instalar `pnpm` globalmente usando `npm` (que viene con Node.js):

    ```bash
    npm install -g pnpm
    ```

    Verifica la instalación:

    ```bash
    node -v
    pnpm -v
    ```

### 1.2. VS Code (Opcional, pero Recomendado)

[Visual Studio Code](https://code.visualstudio.com/) es un editor de código fuente ligero pero potente que es ideal para el desarrollo de Brand-to-Deck AI.

1.  **Descargar e Instalar VS Code:**
    Sigue las instrucciones en el sitio web oficial de VS Code para tu sistema operativo.

2.  **Extensiones Recomendadas para VS Code:**
    Estas extensiones mejorarán tu experiencia de desarrollo:
    *   **ESLint:** Para mantener la calidad del código JavaScript/TypeScript.
    *   **Prettier - Code formatter:** Para formatear automáticamente tu código.
    *   **Tailwind CSS IntelliSense:** Para autocompletado, resaltado de sintaxis y linting de Tailwind CSS.
    *   **React Extension Pack:** Un conjunto de extensiones útiles para el desarrollo de React.
    *   **DotENV:** Para resaltar archivos `.env`.

    Puedes instalar estas extensiones directamente desde VS Code yendo a la vista de Extensiones (Ctrl+Shift+X o Cmd+Shift+X) y buscando por nombre.

## 2. Estructura del Proyecto

El proyecto Brand-to-Deck AI está organizado en dos directorios principales: `client` para el frontend de React y `server` para el backend de Node.js (Express).

```
brand-to-deck-ai/
├── client/                 # Aplicación frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/     # Componentes reutilizables de React
│   │   │   └── ui/         # Componentes UI de Shadcn/ui
│   │   ├── hooks/          # Hooks personalizados de React
│   │   ├── lib/            # Utilidades, constantes, cliente API
│   │   ├── App.css
│   │   ├── App.jsx         # Componente principal de la aplicación
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example        # Ejemplo de variables de entorno para el cliente
│   ├── .gitignore
│   ├── index.html
│   ├── package.json        # Dependencias y scripts del frontend
│   └── tailwind.config.js
├── server/                 # Aplicación backend (Node.js/Express)
│   ├── config/             # Configuraciones del servidor
│   ├── controllers/        # Lógica de negocio para las rutas
│   ├── middleware/         # Middlewares personalizados (ej. manejo de errores, uploads)
│   ├── models/             # Modelos de datos (si se usara una DB)
│   ├── routes/             # Definición de rutas API
│   ├── services/           # Lógica de negocio principal (ej. PDF parsing, PPTX generation)
│   ├── uploads/            # Directorio para archivos subidos temporalmente
│   ├── generated/          # Directorio para presentaciones PPTX generadas
│   ├── .env.example        # Ejemplo de variables de entorno para el servidor
│   ├── .gitignore
│   ├── index.js            # Archivo principal del servidor
│   └── package.json        # Dependencias y scripts del backend
├── docs/                   # Documentación del proyecto
│   ├── installation-and-configuration.md
│   └── project-structure.md
├── .gitignore              # Archivo .gitignore global
└── README.md               # Descripción general del proyecto
```

## 3. Código Completo

El código completo de la aplicación se encuentra en los directorios `client/` y `server/`. A continuación, se describen los archivos clave y su propósito.

### 3.1. Frontend (React)

La aplicación frontend está construida con React y Vite, utilizando Tailwind CSS para los estilos y Shadcn/ui para los componentes de interfaz de usuario.

*   **`client/src/App.jsx`**: El componente raíz de la aplicación. Gestiona el flujo de pasos (carga de manual, configuración de marca, edición de contenido, vista previa, generación) y coordina los datos entre los diferentes componentes y hooks.
*   **`client/src/components/`**: Contiene los componentes de React que forman la interfaz de usuario.
    *   `BrandUploader.jsx`: Componente para la carga de archivos PDF del manual de marca.
    *   `BrandConfig.jsx`: Componente para visualizar y editar la configuración de marca (colores, fuentes, layout).
    *   `ContentEditor.jsx`: Editor de texto donde el usuario introduce el contenido estructurado de la presentación.
    *   `PresentationPreview.jsx`: Muestra una vista previa interactiva de la presentación generada.
    *   `Header.jsx`: Barra de navegación superior.
    *   `Sidebar.jsx`: Barra lateral con navegación entre pasos y lista de presentaciones recientes.
    *   `LoadingSpinner.jsx`: Componente de carga animado.
    *   `ui/`: Contiene los componentes de Shadcn/ui (Button, Card, Input, etc.) que se han adaptado para el proyecto.
*   **`client/src/hooks/`**: Contiene hooks personalizados de React para encapsular lógica de estado y efectos secundarios.
    *   `useBrandConfig.js`: Gestiona el estado y las operaciones relacionadas con la configuración de marca.
    *   `useFileUpload.js`: Maneja la lógica de subida de archivos, incluyendo validación y seguimiento del progreso.
    *   `usePresentationGenerator.js`: Encapsula la lógica para generar vistas previas, presentaciones y gestionar las descargas.
*   **`client/src/lib/`**: Contiene utilidades y configuraciones globales.
    *   `api.js`: Cliente API para interactuar con el backend de Express.
    *   `constants.js`: Define constantes como límites de archivo, tipos de diapositivas, estados de procesamiento, etc.
    *   `utils.js`: Funciones de utilidad generales (formato de archivos, validación de colores, debounce, etc.).

### 3.2. Backend (Node.js/Express)

La aplicación backend está construida con Node.js y el framework Express. Es responsable de manejar las solicitudes API, procesar los archivos PDF, extraer la información de marca y generar los archivos PPTX.

*   **`server/index.js`**: El archivo principal del servidor Express. Configura el servidor, los middlewares y las rutas API.
*   **`server/middleware/`**: Contiene middlewares personalizados.
    *   `errorHandler.js`: Middleware para el manejo centralizado de errores.
    *   `upload.js`: Middleware para la gestión de la carga de archivos (usando `multer`).
*   **`server/routes/`**: Define las rutas de la API.
    *   `upload.js`: Rutas para la carga y validación de manuales de marca.
    *   `brand.js`: Rutas para la gestión de configuraciones de marca (crear, obtener, actualizar, listar).
    *   `presentation.js`: Rutas para la generación de presentaciones, vistas previas y descargas.
*   **`server/services/`**: Contiene la lógica de negocio principal.
    *   `pdfParser.js`: Servicio para parsear archivos PDF y extraer su contenido (texto, imágenes, metadatos).
    *   `brandExtractor.js`: Servicio para analizar el contenido del PDF y extraer elementos de marca como colores y fuentes.
    *   `pptxGenerator.js`: Servicio que utiliza `pptxgenjs` para crear archivos PowerPoint (.pptx) basados en el contenido estructurado y la configuración de marca.

## 4. Instrucciones de Instalación y Ejecución

Sigue estos pasos para instalar las dependencias y ejecutar la aplicación localmente.

### 4.1. Clonar el Repositorio

Si el proyecto estuviera en un repositorio Git, lo clonarías. Para este caso, asume que ya tienes los archivos en el directorio `brand-to-deck-ai/`.

### 4.2. Configuración de Variables de Entorno

Cada parte de la aplicación (frontend y backend) tiene su propio archivo de configuración de entorno.

1.  **Backend:**
    Navega al directorio `server/` y copia el archivo de ejemplo:
    ```bash
    cd brand-to-deck-ai/server
    cp .env.example .env
    ```
    Abre el archivo `.env` y ajusta las variables si es necesario. Las variables por defecto son:
    ```env
    PORT=5000
    NODE_ENV=development
    MAX_FILE_SIZE=10485760 # 10MB
    UPLOAD_DIR=./uploads
    GENERATED_DIR=./generated
    ```

2.  **Frontend:**
    Navega al directorio `client/` y copia el archivo de ejemplo:
    ```bash
    cd brand-to-deck-ai/client
    cp .env.example .env
    ```
    Abre el archivo `.env` y ajusta las variables si es necesario. Asegúrate de que `VITE_API_URL` apunte a la dirección de tu backend:
    ```env
    VITE_API_URL=http://localhost:5000/api
    VITE_APP_NAME="Brand-to-Deck AI"
    VITE_APP_VERSION="1.0.0"
    VITE_MAX_FILE_SIZE=10485760
    VITE_DEBUG=true
    ```

### 4.3. Instalación de Dependencias

Utiliza `pnpm` para instalar las dependencias en ambos directorios.

1.  **Backend:**
    ```bash
    cd brand-to-deck-ai/server
    pnpm install
    ```

2.  **Frontend:**
    ```bash
    cd brand-to-deck-ai/client
    pnpm install
    ```

### 4.4. Ejecución de la Aplicación

Necesitarás iniciar el backend y el frontend por separado.

1.  **Iniciar el Backend:**
    Abre una nueva terminal, navega al directorio `server/` y ejecuta:
    ```bash
    cd brand-to-deck-ai/server
    pnpm start
    ```
    El servidor se iniciará en `http://localhost:5000` (o el puerto que hayas configurado en `.env`).

2.  **Iniciar el Frontend:**
    Abre otra nueva terminal, navega al directorio `client/` y ejecuta:
    ```bash
    cd brand-to-deck-ai/client
    pnpm dev
    ```
    La aplicación frontend se iniciará en `http://localhost:5173` (o un puerto similar, Vite lo indicará en la consola).

    Abre tu navegador web y visita la URL del frontend para acceder a la aplicación.

### 4.5. Pruebas

*   **Carga de Manual de Marca:** Sube un archivo PDF (puedes usar el manual de Libus que mencionaste) en la primera pantalla. Observa cómo se extraen los colores y fuentes.
*   **Configuración de Marca:** Ajusta los colores y fuentes en la segunda pantalla y verifica la vista previa.
*   **Edición de Contenido:** Ingresa texto estructurado en el editor de contenido y observa cómo se parsea en diapositivas en la vista previa.
*   **Generación de Presentación:** Genera el archivo PPTX final y descárgalo para verificar el formato.

## 5. Guía de Despliegue (Preparación para Hostinger)

Esta sección describe los pasos generales para preparar la aplicación para su despliegue en un entorno como Hostinger. Los detalles específicos pueden variar según el plan de hosting y las herramientas proporcionadas por Hostinger.

### 5.1. Construcción del Frontend

Para el despliegue, necesitarás construir la aplicación React para producción. Esto generará una versión optimizada y estática de tu frontend.

```bash
cd brand-to-deck-ai/client
pnpm build
```

Esto creará una carpeta `dist/` dentro de `client/` con todos los archivos estáticos listos para ser servidos.

### 5.2. Preparación del Backend

El backend de Node.js también debe estar listo para producción. Asegúrate de que las variables de entorno en `server/.env` estén configuradas para el entorno de producción (por ejemplo, `NODE_ENV=production`).

### 5.3. Estructura de Archivos para Hostinger

Hostinger generalmente ofrece diferentes tipos de hosting (compartido, VPS, etc.). Asumiendo un hosting con soporte para Node.js y la capacidad de servir archivos estáticos:

1.  **Directorio Raíz:** En tu servidor Hostinger, podrías tener una estructura como esta:
    ```
    public_html/
    ├── api/                  # Backend de Node.js
    │   ├── index.js
    │   ├── package.json
    │   ├── node_modules/
    │   └── ... (otros archivos del servidor)
    ├── static/               # Frontend de React (contenido de client/dist)
    │   ├── index.html
    │   ├── assets/
    │   └── ... (otros archivos estáticos)
    └── .htaccess             # Para redireccionar tráfico y manejar rutas
    ```

2.  **Archivos del Frontend:** Sube el contenido de `client/dist/` a un directorio como `public_html/static/`.

3.  **Archivos del Backend:** Sube el contenido de `server/` (excluyendo `node_modules` si Hostinger instala dependencias automáticamente, o incluyéndolo si no) a un directorio como `public_html/api/`.

### 5.4. Configuración del Servidor Web (ej. Apache/Nginx vía .htaccess)

Si Hostinger usa Apache, necesitarás un archivo `.htaccess` en `public_html/` para:

*   **Redirigir las solicitudes API** a tu aplicación Node.js.
*   **Servir los archivos estáticos** del frontend.
*   **Manejar el enrutamiento del lado del cliente** para React (redirigir todas las solicitudes no API a `index.html`).

Ejemplo básico de `.htaccess` (puede requerir ajustes específicos de Hostinger):

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On

  # Redirigir solicitudes a la API
  RewriteRule ^api/(.*)$ http://127.0.0.1:5000/$1 [P,L]

  # Servir archivos estáticos del frontend
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ /static/index.html [L]
</IfModule>
```

**Nota:** La configuración de proxy (`[P]`) puede requerir que el módulo `mod_proxy` esté habilitado en el servidor de Hostinger. Consulta la documentación de Hostinger para la configuración de Node.js y proxies inversos.

### 5.5. Proceso de Inicio de Node.js

Hostinger debería proporcionar una interfaz para iniciar y gestionar tu aplicación Node.js. Típicamente, esto implica:

1.  **Seleccionar la versión de Node.js.**
2.  **Especificar el archivo de entrada** (ej. `api/index.js`).
3.  **Configurar el puerto** en el que tu aplicación Node.js escuchará (Hostinger a menudo asigna un puerto interno).
4.  **Instalar dependencias** (si no subiste `node_modules`).

### 5.6. Consideraciones Adicionales

*   **HTTPS:** Asegúrate de configurar SSL/TLS para tu dominio en Hostinger.
*   **Base de Datos:** Si en el futuro agregas una base de datos, deberás configurarla por separado en Hostinger y actualizar las variables de entorno del backend.
*   **Logs:** Monitorea los logs de tu aplicación en Hostinger para depurar cualquier problema.
*   **Actualizaciones:** Para actualizar la aplicación, repite los pasos de construcción del frontend y sube los archivos actualizados al servidor.

Esta guía te proporciona una base sólida para el despliegue. Siempre consulta la documentación específica de Hostinger para obtener las instrucciones más precisas y actualizadas para tu tipo de plan de hosting. 

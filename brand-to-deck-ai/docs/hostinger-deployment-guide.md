# Guía de Despliegue en Hostinger para Brand-to-Deck AI

Esta guía proporciona instrucciones detalladas y específicas para desplegar la aplicación Brand-to-Deck AI en Hostinger, incluyendo configuraciones específicas del proveedor, optimizaciones para producción y mejores prácticas de seguridad.

## 1. Preparación del Proyecto para Producción

Antes de desplegar en Hostinger, es fundamental preparar adecuadamente tanto el frontend como el backend para el entorno de producción.

### 1.1. Optimización del Frontend

El frontend React debe ser compilado para producción, lo que genera archivos optimizados y minificados que cargan más rápidamente en el navegador del usuario.

**Configuración de Variables de Entorno de Producción:**

Crea un archivo `.env.production` en el directorio `client/` con las configuraciones específicas para producción:

```env
VITE_API_URL=https://tudominio.com/api
VITE_APP_NAME="Brand-to-Deck AI"
VITE_APP_VERSION="1.0.0"
VITE_MAX_FILE_SIZE=10485760
VITE_DEBUG=false
```

**Construcción del Frontend:**

Ejecuta el comando de construcción que generará los archivos optimizados:

```bash
cd brand-to-deck-ai/client
pnpm build
```

Este proceso creará una carpeta `dist/` que contiene todos los archivos estáticos optimizados, incluyendo HTML, CSS, JavaScript minificado e imágenes comprimidas.

### 1.2. Preparación del Backend

El backend Node.js requiere configuraciones específicas para funcionar correctamente en el entorno de producción de Hostinger.

**Variables de Entorno de Producción:**

Actualiza el archivo `server/.env` con las configuraciones de producción:

```env
NODE_ENV=production
PORT=3000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
GENERATED_DIR=./generated
CORS_ORIGIN=https://tudominio.com
```

**Optimización de Dependencias:**

Asegúrate de que solo las dependencias de producción estén incluidas:

```bash
cd brand-to-deck-ai/server
pnpm install --production
```

## 2. Configuración Específica de Hostinger

Hostinger ofrece diferentes tipos de hosting que pueden afectar la configuración del despliegue. Esta guía cubre las opciones más comunes.

### 2.1. Hosting Compartido con Node.js

Si utilizas el hosting compartido de Hostinger con soporte para Node.js, sigue estos pasos específicos:

**Estructura de Directorios Recomendada:**

```
public_html/
├── .htaccess                 # Configuración de Apache
├── index.html               # Página principal (del build de React)
├── assets/                  # Archivos estáticos del frontend
├── api/                     # Aplicación Node.js
│   ├── index.js
│   ├── package.json
│   ├── node_modules/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── uploads/
│   └── generated/
└── uploads/                 # Directorio público para archivos subidos
```

**Configuración de .htaccess:**

Crea un archivo `.htaccess` en `public_html/` con la siguiente configuración optimizada para Hostinger:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Configuración de seguridad
    <Files ".env">
        Order allow,deny
        Deny from all
    </Files>
    
    # Configuración de CORS para archivos estáticos
    <IfModule mod_headers.c>
        Header set Access-Control-Allow-Origin "*"
        Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header set Access-Control-Allow-Headers "Content-Type, Authorization"
    </IfModule>
    
    # Redirección de API al backend Node.js
    RewriteCond %{REQUEST_URI} ^/api/(.*)$
    RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
    
    # Configuración para React Router (SPA)
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} !^/api/
    RewriteRule . /index.html [L]
    
    # Configuración de caché para archivos estáticos
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/svg+xml "access plus 1 year"
    </IfModule>
    
    # Compresión GZIP
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/plain
        AddOutputFilterByType DEFLATE text/html
        AddOutputFilterByType DEFLATE text/xml
        AddOutputFilterByType DEFLATE text/css
        AddOutputFilterByType DEFLATE application/xml
        AddOutputFilterByType DEFLATE application/xhtml+xml
        AddOutputFilterByType DEFLATE application/rss+xml
        AddOutputFilterByType DEFLATE application/javascript
        AddOutputFilterByType DEFLATE application/x-javascript
    </IfModule>
</apache>
```

### 2.2. VPS o Cloud Hosting

Para un VPS de Hostinger, tienes mayor control sobre la configuración del servidor:

**Configuración del Servidor Web (Nginx):**

Si utilizas un VPS, puedes configurar Nginx como proxy reverso:

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    
    # Redirección HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com www.tudominio.com;
    
    # Configuración SSL
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Servir archivos estáticos del frontend
    location / {
        root /var/www/brand-to-deck-ai/client/dist;
        try_files $uri $uri/ /index.html;
        
        # Configuración de caché
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Proxy para API del backend
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Configuración de uploads
    location /uploads/ {
        root /var/www/brand-to-deck-ai/server;
        expires 1d;
    }
}
```

## 3. Proceso de Despliegue Paso a Paso

Este proceso detallado te guiará a través del despliegue completo en Hostinger.

### 3.1. Preparación de Archivos

**Paso 1: Construir el Frontend**

```bash
cd brand-to-deck-ai/client
pnpm build
```

**Paso 2: Preparar el Backend**

```bash
cd brand-to-deck-ai/server
pnpm install --production
```

**Paso 3: Crear Archivo de Despliegue**

Crea un script `deploy.sh` para automatizar el proceso:

```bash
#!/bin/bash
echo "Iniciando despliegue de Brand-to-Deck AI..."

# Construir frontend
cd client
pnpm build
cd ..

# Crear directorio de despliegue
mkdir -p deploy
mkdir -p deploy/api

# Copiar archivos del frontend
cp -r client/dist/* deploy/

# Copiar archivos del backend
cp -r server/* deploy/api/
cp server/.env deploy/api/

# Crear .htaccess
cat > deploy/.htaccess << 'EOF'
# Contenido del .htaccess aquí
EOF

echo "Archivos preparados en el directorio 'deploy/'"
echo "Sube el contenido de 'deploy/' a tu directorio public_html en Hostinger"
```

### 3.2. Subida de Archivos a Hostinger

**Opción 1: Panel de Control de Hostinger**

1. Accede al panel de control de Hostinger (hPanel)
2. Ve a la sección "Archivos" → "Administrador de archivos"
3. Navega al directorio `public_html`
4. Sube todos los archivos del directorio `deploy/`

**Opción 2: FTP/SFTP**

Utiliza un cliente FTP como FileZilla con las credenciales proporcionadas por Hostinger:

```bash
# Usando rsync (si tienes acceso SSH)
rsync -avz --delete deploy/ usuario@tudominio.com:public_html/
```

### 3.3. Configuración de Node.js en Hostinger

**Para Hosting Compartido:**

1. En el panel de control, ve a "Avanzado" → "Node.js"
2. Selecciona la versión de Node.js (recomendado: v18 o superior)
3. Establece el directorio de la aplicación: `public_html/api`
4. Archivo de inicio: `index.js`
5. Haz clic en "Crear" para inicializar la aplicación

**Para VPS:**

```bash
# Instalar PM2 para gestión de procesos
npm install -g pm2

# Crear archivo de configuración PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'brand-to-deck-ai',
    script: './api/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Iniciar la aplicación
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 4. Configuraciones de Seguridad y Optimización

### 4.1. Configuración de Seguridad

**Variables de Entorno Seguras:**

Nunca incluyas información sensible en el código. Utiliza variables de entorno:

```env
# server/.env (en producción)
NODE_ENV=production
JWT_SECRET=tu_clave_secreta_muy_segura
DATABASE_URL=tu_url_de_base_de_datos
API_KEY=tu_clave_api_secreta
```

**Configuración de CORS:**

Actualiza la configuración de CORS en `server/index.js`:

```javascript
app.use(cors({
  origin: [
    'https://tudominio.com',
    'https://www.tudominio.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### 4.2. Optimizaciones de Rendimiento

**Configuración de Caché:**

Implementa caché en el backend para mejorar el rendimiento:

```javascript
// En server/index.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutos

// Middleware de caché
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    const key = req.originalUrl || req.url;
    const cached = cache.get(key);
    
    if (cached) {
      return res.json(cached);
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      cache.set(key, body, duration);
      res.sendResponse(body);
    };
    
    next();
  };
};
```

**Compresión de Respuestas:**

```javascript
const compression = require('compression');
app.use(compression());
```

### 4.3. Monitoreo y Logs

**Configuración de Logs:**

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## 5. Mantenimiento y Actualizaciones

### 5.1. Proceso de Actualización

**Script de Actualización Automatizada:**

```bash
#!/bin/bash
# update.sh
echo "Actualizando Brand-to-Deck AI..."

# Hacer backup
cp -r public_html public_html_backup_$(date +%Y%m%d_%H%M%S)

# Construir nueva versión
cd brand-to-deck-ai
git pull origin main
cd client && pnpm build && cd ..
cd server && pnpm install --production && cd ..

# Desplegar
rsync -avz client/dist/ ../public_html/
rsync -avz server/ ../public_html/api/ --exclude node_modules

# Reiniciar aplicación Node.js
pm2 restart brand-to-deck-ai

echo "Actualización completada"
```

### 5.2. Monitoreo de Salud

**Endpoint de Health Check:**

Agrega un endpoint de salud en `server/routes/health.js`:

```javascript
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  };
  
  res.status(200).json(healthCheck);
});

module.exports = router;
```

### 5.3. Backup y Recuperación

**Script de Backup:**

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups/brand-to-deck-ai"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup de archivos
tar -czf $BACKUP_DIR/files_$DATE.tar.gz public_html/

# Backup de base de datos (si aplica)
# mysqldump -u usuario -p base_datos > $BACKUP_DIR/db_$DATE.sql

# Limpiar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completado: $BACKUP_DIR/files_$DATE.tar.gz"
```

## 6. Solución de Problemas Comunes

### 6.1. Problemas de Node.js en Hostinger

**Error: "Cannot find module"**
- Verifica que todas las dependencias estén instaladas
- Ejecuta `pnpm install` en el directorio del servidor

**Error: "Port already in use"**
- Hostinger asigna puertos automáticamente
- No especifiques un puerto fijo en producción

### 6.2. Problemas de Frontend

**Error 404 en rutas de React**
- Verifica que el archivo `.htaccess` esté configurado correctamente
- Asegúrate de que la configuración `try_files` redirija a `index.html`

**Archivos estáticos no cargan**
- Verifica las rutas en el archivo de configuración
- Comprueba los permisos de archivos (644 para archivos, 755 para directorios)

### 6.3. Problemas de API

**CORS errors**
- Actualiza la configuración de CORS con el dominio correcto
- Verifica que las cabeceras estén configuradas en `.htaccess`

**Timeouts en uploads**
- Aumenta los límites de tiempo en la configuración del servidor
- Verifica los límites de tamaño de archivo en Hostinger

Esta guía completa te permitirá desplegar exitosamente Brand-to-Deck AI en Hostinger con configuraciones optimizadas para producción, seguridad adecuada y procesos de mantenimiento establecidos.

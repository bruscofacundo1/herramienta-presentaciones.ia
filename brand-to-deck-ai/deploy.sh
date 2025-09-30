#!/bin/bash

# Script de Despliegue para Brand-to-Deck AI
# Autor: Manus AI
# Descripción: Automatiza la preparación de archivos para despliegue en Hostinger

set -e  # Salir si cualquier comando falla

echo "🚀 Iniciando despliegue de Brand-to-Deck AI..."
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con colores
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
    log_error "Error: Ejecuta este script desde el directorio raíz de Brand-to-Deck AI"
    exit 1
fi

# Limpiar directorio de despliegue anterior
log_info "Limpiando directorio de despliegue anterior..."
rm -rf deploy
mkdir -p deploy
mkdir -p deploy/api

# Paso 1: Construir Frontend
log_info "Construyendo frontend de React..."
cd client

# Verificar que pnpm esté disponible
if ! command -v pnpm &> /dev/null; then
    log_warning "pnpm no encontrado, usando npm..."
    npm run build
else
    pnpm build
fi

if [ ! -d "dist" ]; then
    log_error "Error: La construcción del frontend falló"
    exit 1
fi

log_success "Frontend construido exitosamente"
cd ..

# Paso 2: Preparar Backend
log_info "Preparando backend de Node.js..."
cd server

# Instalar dependencias de producción
if ! command -v pnpm &> /dev/null; then
    log_warning "pnpm no encontrado, usando npm..."
    npm install --production
else
    pnpm install --production
fi

log_success "Dependencias del backend instaladas"
cd ..

# Paso 3: Copiar archivos del frontend
log_info "Copiando archivos del frontend..."
cp -r client/dist/* deploy/
log_success "Archivos del frontend copiados"

# Paso 4: Copiar archivos del backend
log_info "Copiando archivos del backend..."
cp -r server/* deploy/api/

# Copiar archivo de entorno si existe
if [ -f "server/.env" ]; then
    cp server/.env deploy/api/
    log_success "Archivo .env copiado"
else
    log_warning "Archivo .env no encontrado, crea uno basado en .env.example"
fi

# Paso 5: Crear directorios necesarios
log_info "Creando directorios necesarios..."
mkdir -p deploy/api/uploads
mkdir -p deploy/api/generated
mkdir -p deploy/uploads
chmod 755 deploy/api/uploads
chmod 755 deploy/api/generated
chmod 755 deploy/uploads

# Paso 6: Crear archivo .htaccess optimizado
log_info "Creando archivo .htaccess..."
cat > deploy/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Configuración de seguridad
    <Files ".env">
        Order allow,deny
        Deny from all
    </Files>
    
    <Files "*.log">
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
    RewriteCond %{REQUEST_URI} !^/uploads/
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
        ExpiresByType font/woff "access plus 1 year"
        ExpiresByType font/woff2 "access plus 1 year"
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
        AddOutputFilterByType DEFLATE application/json
    </IfModule>
    
    # Configuración de seguridad adicional
    <IfModule mod_headers.c>
        Header always set X-Content-Type-Options nosniff
        Header always set X-Frame-Options DENY
        Header always set X-XSS-Protection "1; mode=block"
        Header always set Referrer-Policy "strict-origin-when-cross-origin"
    </IfModule>
</IfModule>
EOF

log_success "Archivo .htaccess creado"

# Paso 7: Crear archivo de configuración PM2 (para VPS)
log_info "Creando configuración PM2..."
cat > deploy/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'brand-to-deck-ai',
    script: './api/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}
EOF

# Crear directorio de logs
mkdir -p deploy/logs

log_success "Configuración PM2 creada"

# Paso 8: Crear archivo README para despliegue
log_info "Creando instrucciones de despliegue..."
cat > deploy/README-DEPLOYMENT.md << 'EOF'
# Instrucciones de Despliegue

## Archivos Incluidos
- Todos los archivos del frontend construido (React)
- Backend completo en el directorio `api/`
- Archivo `.htaccess` configurado para Apache
- Configuración PM2 para VPS (`ecosystem.config.js`)

## Pasos para Hostinger (Hosting Compartido)

1. **Subir Archivos:**
   - Sube todo el contenido de esta carpeta a `public_html/` en tu hosting
   - Asegúrate de que los permisos sean correctos (644 para archivos, 755 para directorios)

2. **Configurar Node.js:**
   - Ve al panel de control de Hostinger
   - Sección "Avanzado" → "Node.js"
   - Directorio de aplicación: `public_html/api`
   - Archivo de inicio: `index.js`
   - Versión Node.js: 18 o superior

3. **Variables de Entorno:**
   - Configura las variables de entorno en el panel de Hostinger
   - O asegúrate de que el archivo `.env` esté en `api/`

## Para VPS

1. **Subir archivos al servidor**
2. **Instalar PM2:** `npm install -g pm2`
3. **Iniciar aplicación:** `pm2 start ecosystem.config.js`
4. **Configurar autostart:** `pm2 startup && pm2 save`

## Verificación

- Frontend: https://tudominio.com
- API Health: https://tudominio.com/api/health
- Uploads: https://tudominio.com/uploads/

## Solución de Problemas

- Verifica los logs en el panel de Hostinger
- Asegúrate de que Node.js esté habilitado
- Comprueba que los permisos de archivos sean correctos
- Verifica la configuración de CORS si hay errores de API
EOF

log_success "Instrucciones de despliegue creadas"

# Paso 9: Crear archivo de verificación de salud
log_info "Creando archivo de verificación..."
cat > deploy/api/health-check.js << 'EOF'
// Script de verificación de salud para Brand-to-Deck AI
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const health = JSON.parse(data);
      console.log('Health Check:', health);
      process.exit(res.statusCode === 200 ? 0 : 1);
    } catch (error) {
      console.error('Error parsing response:', error);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('Health check failed:', error);
  process.exit(1);
});

req.setTimeout(5000, () => {
  console.error('Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();
EOF

log_success "Script de verificación creado"

# Paso 10: Generar resumen de archivos
log_info "Generando resumen de archivos..."
echo "📊 RESUMEN DE DESPLIEGUE" > deploy/DEPLOYMENT-SUMMARY.txt
echo "========================" >> deploy/DEPLOYMENT-SUMMARY.txt
echo "Fecha: $(date)" >> deploy/DEPLOYMENT-SUMMARY.txt
echo "Versión: $(cat package.json | grep '"version"' | cut -d'"' -f4)" >> deploy/DEPLOYMENT-SUMMARY.txt
echo "" >> deploy/DEPLOYMENT-SUMMARY.txt
echo "ARCHIVOS INCLUIDOS:" >> deploy/DEPLOYMENT-SUMMARY.txt
echo "- Frontend: $(find deploy -name "*.html" -o -name "*.js" -o -name "*.css" | wc -l) archivos estáticos" >> deploy/DEPLOYMENT-SUMMARY.txt
echo "- Backend: $(find deploy/api -name "*.js" | wc -l) archivos JavaScript" >> deploy/DEPLOYMENT-SUMMARY.txt
echo "- Configuración: .htaccess, ecosystem.config.js, .env" >> deploy/DEPLOYMENT-SUMMARY.txt
echo "" >> deploy/DEPLOYMENT-SUMMARY.txt
echo "TAMAÑO TOTAL: $(du -sh deploy | cut -f1)" >> deploy/DEPLOYMENT-SUMMARY.txt

# Paso 11: Crear archivo ZIP para fácil subida
log_info "Creando archivo ZIP para despliegue..."
if command -v zip &> /dev/null; then
    cd deploy
    zip -r ../brand-to-deck-ai-deployment.zip . -x "*.DS_Store" "*.git*"
    cd ..
    log_success "Archivo ZIP creado: brand-to-deck-ai-deployment.zip"
else
    log_warning "Comando 'zip' no disponible, saltando creación de ZIP"
fi

# Mostrar resumen final
echo ""
echo "🎉 DESPLIEGUE PREPARADO EXITOSAMENTE"
echo "===================================="
log_success "Todos los archivos están listos en el directorio 'deploy/'"
log_info "Tamaño total: $(du -sh deploy | cut -f1)"

echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Sube el contenido de 'deploy/' a tu directorio public_html en Hostinger"
echo "2. Configura Node.js en el panel de control de Hostinger"
echo "3. Verifica que la aplicación funcione visitando tu dominio"
echo ""

if [ -f "brand-to-deck-ai-deployment.zip" ]; then
    log_info "También puedes usar el archivo ZIP: brand-to-deck-ai-deployment.zip"
fi

echo ""
log_success "¡Despliegue completado! 🚀"

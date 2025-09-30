# Brand-to-Deck AI: Generador de Presentaciones Corporativas

## Descripción General

Brand-to-Deck AI es una aplicación web diseñada para simplificar la creación de presentaciones de PowerPoint con formato corporativo. Permite a los usuarios cargar un manual de marca (en formato PDF) para extraer automáticamente colores, tipografías y elementos de diseño. Luego, los usuarios pueden ingresar contenido estructurado en un editor de texto simple, y la aplicación generará un archivo `.pptx` perfectamente formateado según las directrices de la marca.

### Características Principales:

*   **Carga y Configuración de Manual de Marca:** Sube tu manual de marca en PDF para que la IA extraiga y configure automáticamente los elementos visuales clave.
*   **Editor de Contenido Estructurado:** Escribe el contenido de tu presentación utilizando un formato de texto simple (Markdown-like) para definir títulos, secciones y viñetas.
*   **Generación Automática de PPTX:** Obtén archivos `.pptx` listos para usar, con el formato corporativo aplicado de manera consistente.
*   **Soporte para Diferentes Tipos de Diapositivas:** Genera carátulas de sección, diapositivas de contenido, listas con viñetas y más.
*   **Vista Previa en Tiempo Real:** Visualiza cómo se verá tu presentación antes de la generación final.

## Estructura del Proyecto

El proyecto está dividido en dos componentes principales:

*   **`client/`**: La aplicación frontend construida con React, Vite, Tailwind CSS y Shadcn/ui.
*   **`server/`**: El backend API desarrollado con Node.js y Express, encargado del procesamiento de PDFs, extracción de marca y generación de PPTX.

Para una descripción detallada de la estructura de carpetas y archivos, consulta:

*   [Estructura del Proyecto](docs/project-structure.md)

## Instalación y Configuración

Para poner en marcha la aplicación en tu entorno local, sigue las instrucciones detalladas en la guía de instalación:

*   [Guía de Instalación y Configuración](docs/installation-and-configuration.md)

## Despliegue en Hostinger

Si planeas desplegar la aplicación en Hostinger, hemos preparado una guía específica con los pasos y configuraciones recomendadas:

*   [Guía de Despliegue en Hostinger](docs/hostinger-deployment-guide.md)

## Uso

1.  **Carga tu Manual de Marca:** Inicia la aplicación y sube tu manual de marca en PDF. La IA extraerá automáticamente los colores, fuentes y otros elementos.
2.  **Configura tu Marca:** Revisa y ajusta la configuración de marca extraída. Puedes personalizar colores, tipografías y márgenes.
3.  **Crea tu Contenido:** Utiliza el editor de texto para escribir el contenido de tu presentación. Usa `#` para títulos, `##` para secciones y `-` para viñetas.
4.  **Previsualiza y Genera:** Obtén una vista previa de tu presentación y, una vez satisfecho, genera el archivo `.pptx` final.

--- 

**Autor:** Manus AI
**Versión:** 1.0.0
**Fecha:** 22 de septiembre de 2025

// server/services/brandExtractor.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const createError = require("../utils/create-error");

// Inicializa el cliente de Gemini con tu clave de API desde el archivo .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Función para convertir un archivo a un formato que Gemini entiende
function fileToGenerativePart(path, mimeType) {
  if (!path) {
    console.error("Error: 'path' es undefined en fileToGenerativePart");
    throw new TypeError("The 'path' argument must be of type string or an instance of Buffer or URL. Received undefined");
  }
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

/**
 * Usa la IA de Gemini para extraer la configuración de marca de un archivo PDF.
 * @param {object} pdfData - Datos del PDF parseado (aunque aquí usaremos la ruta directa).
 * @param {string} filePath - La ruta al archivo PDF subido.
 * @returns {Promise<object>} Una promesa que se resuelve con la configuración de marca extraída.
 */
async function extractBrandConfiguration(pdfData, filePath) {
  try {
    // Usar el modelo disponible de Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    console.log(`Debug: filePath en extractBrandConfiguration: ${filePath}`);

    const prompt = `
      Eres un experto en diseño gráfico y en manuales de identidad corporativa. Analiza este manual de marca en PDF.
      Tu objetivo es extraer la configuración completa de la marca para poder generar presentaciones de PowerPoint que cumplan estrictamente con sus directrices.
      Presta especial atención a los siguientes elementos y extrae la información más detallada posible:

      1.  **Logos y sus variantes:** Describe el logo principal, sus versiones en color, escala de grises, blanco y negro, y sus usos sobre distintos fondos. Si hay isotipos o logotipos separados, descríbelos también. Menciona las áreas de protección y tamaños mínimos.
      2.  **Sistema Cromático:** Identifica la paleta de colores corporativos. Para cada color (principal, acento, secundarios), proporciona el nombre (si lo tiene), y sus códigos HEX, RGB y CMYK. Si hay porcentajes de uso o reglas específicas, inclúyelas.
      3.  **Sistema Tipográfico:** Para cada nivel de texto (títulos, subtítulos, párrafos, destacados, volantas, etc.), identifica la familia tipográfica, su estilo (Bold, Light), si se usa en mayúsculas, el tamaño y el interlineado. Menciona también tipografías complementarias o de sustitución.
      4.  **Recursos Gráficos:** Describe el uso de misceláneas (como el signo +), planos, diagonales y texturas. Explica cómo deben interactuar con los elementos e imágenes.
      5.  **Usos Incorrectos:** Enumera y describe los ejemplos de aplicación incorrecta del isologotipo para evitar su repetición.

      Devuelve ÚNICAMENTE un objeto JSON con la siguiente estructura. Si no encuentras un campo, déjalo como un array vacío o un string vacío según corresponda. Sé lo más exhaustivo posible en las descripciones.

      {
        "brand_name": "",
        "logos": [
          {
            "type": "principal",
            "description": "",
            "variants": [
              {"name": "color", "description": ""},
              {"name": "grayscale", "description": ""},
              {"name": "black_white", "description": ""}
            ],
            "protection_area": "",
            "min_size": ""
          }
        ],
        "colors": [
          {
            "name": "",
            "type": "primary" | "accent" | "secondary",
            "hex": "",
            "rgb": "",
            "cmyk": "",
            "usage_rules": ""
          }
        ],
        "typography": [
          {
            "element": "title" | "subtitle" | "paragraph" | "highlight" | "volanta",
            "font_family": "",
            "font_style": "",
            "case": "",
            "size": "",
            "line_height": "",
            "usage_rules": ""
          }
        ],
        "graphic_resources": [
          {
            "type": "miscellany" | "plane" | "diagonal" | "texture",
            "description": "",
            "examples": []
          }
        ],
        "incorrect_uses": [
          {
            "description": "",
            "example_image_description": ""
          }
        ]
      }
    `;

    console.log("Debug: Llamando a la API de Gemini para generar contenido...");
    const imageParts = [
      fileToGenerativePart(filePath, "application/pdf"),
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    console.log("Debug: Respuesta de la API de Gemini recibida.");
    const responseText = result.response.text();
    console.log("Debug: Texto de respuesta de Gemini:", responseText);

    // Limpiamos la respuesta para asegurarnos de que sea un JSON válido
    // Extraemos solo el bloque JSON usando una expresión regular más robusta
    let jsonString = responseText.trim();
    
    // Intentar extraer JSON de diferentes formatos posibles
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1].trim();
    } else {
      // Si no hay bloques de código, buscar JSON directo
      const directJsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (directJsonMatch) {
        jsonString = directJsonMatch[0].trim();
      }
    }
    
    console.log("Debug: JSON string limpiado:", jsonString);
    
    let extractedConfig;
    try {
      extractedConfig = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Error al parsear JSON:", parseError);
      console.log("Respuesta completa de Gemini:", responseText);
      throw new Error("La respuesta de Gemini no contiene un JSON válido. Por favor, verifica el manual de marca y vuelve a intentar.");
    }

    return {
      success: true,
      brandConfig: extractedConfig,
      confidence: 0.95 // La confianza es alta porque la extrae una IA
    };

  } catch (error) {
    console.error("Error al contactar la API de Gemini:", error);
    throw createError("No se pudo extraer la configuración de marca con la IA. Verifica tu clave de API o el formato del manual.", 500);
  }
}

module.exports = {
  extractBrandConfiguration,
};


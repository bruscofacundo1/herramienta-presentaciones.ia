/**
 * Componente ChatInterface
 * 
 * Interfaz tipo chat para generar presentaciones usando prompts naturales
 * con la información extraída del manual de marcas.
 * 
 * @author Manus AI
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Palette, 
  Type, 
  FileText,
  Sparkles,
  Download,
  RefreshCw,
  Info
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

function ChatInterface({ 
  brandConfig, 
  onGeneratePresentation,
  isGenerating = false 
}) {
  const [messages, setMessages] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll automático al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensaje inicial del bot cuando se carga el componente
  useEffect(() => {
    if (brandConfig && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([{
          id: 1,
          type: 'bot',
          content: `¡Hola! He analizado tu manual de marcas de **${brandConfig.brand_name || 'tu empresa'}** y ya tengo toda la información necesaria para crear presentaciones profesionales.

Puedes pedirme que genere una presentación escribiendo algo como:
- "Crea una presentación sobre nuestros nuevos cascos de construcción"
- "Genera una presentación de resultados trimestrales con 5 diapositivas"
- "Haz una presentación sobre seguridad industrial con el logo de Libus"

¿Qué presentación te gustaría crear?`,
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, 1000);
    }
  }, [brandConfig]);

  // Manejar envío de mensaje
  const handleSendMessage = () => {
    if (!currentPrompt.trim() || isGenerating) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentPrompt.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Simular respuesta del bot
    setIsTyping(true);
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `Perfecto, voy a generar una presentación basada en tu solicitud usando toda la información de marca de **${brandConfig.brand_name || 'tu empresa'}**.

Aplicaré automáticamente:
- Los colores corporativos definidos en tu manual
- Las tipografías específicas para títulos y contenido  
- El logo y elementos gráficos de la marca
- Las reglas de diseño establecidas

¡Generando tu presentación ahora!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      // Generar presentación
      onGeneratePresentation(currentPrompt.trim(), null);
    }, 1500);

    setCurrentPrompt('');
  };

  // Manejar Enter para enviar
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Ejemplos de prompts sugeridos
  const suggestedPrompts = [
    "Crea una presentación sobre nuestros productos de seguridad industrial",
    "Genera una presentación de resultados anuales con 6 diapositivas",
    "Haz una presentación sobre cascos de construcción con especificaciones técnicas",
    "Crea una presentación corporativa de bienvenida para nuevos empleados"
  ];

  const handleSuggestedPrompt = (prompt) => {
    setCurrentPrompt(prompt);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Título */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Generador de Presentaciones IA
        </h2>
        <p className="text-slate-600">
          Describe qué presentación necesitas y la crearé usando tu manual de marcas
        </p>
      </div>

      {/* Información de marca extraída */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-500" />
            <span>Información de Marca Cargada</span>
          </CardTitle>
          <CardDescription>
            He extraído y aplicaré automáticamente estos elementos de tu manual de marcas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Marca */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center space-x-1">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Marca</span>
              </h4>
              <div className="text-sm">
                <Badge variant="outline" className="text-purple-700 border-purple-200">
                  {brandConfig.brand_name || 'Configuración personalizada'}
                </Badge>
              </div>
            </div>

            {/* Colores */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center space-x-1">
                <Palette className="w-4 h-4 text-blue-500" />
                <span>Colores</span>
              </h4>
              <div className="flex flex-wrap gap-1">
                {brandConfig.colors?.slice(0, 4).map((color, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <div 
                      className="w-4 h-4 rounded border shadow-sm"
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name || color.type}: ${color.hex}`}
                    ></div>
                  </div>
                ))}
                {brandConfig.colors?.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{brandConfig.colors.length - 4} más
                  </Badge>
                )}
              </div>
            </div>

            {/* Tipografía */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center space-x-1">
                <Type className="w-4 h-4 text-green-500" />
                <span>Tipografías</span>
              </h4>
              <div className="space-y-1">
                {brandConfig.typography?.slice(0, 2).map((font, index) => (
                  <Badge key={index} variant="outline" className="text-xs mr-1">
                    {font.font_family}
                  </Badge>
                ))}
                {brandConfig.typography?.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{brandConfig.typography.length - 2} más
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="min-h-[400px]">
        <CardContent className="p-0">
          {/* Mensajes */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content.split('**').map((part, index) => 
                          index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                        )}
                      </div>
                      <div className={`text-xs mt-1 opacity-70`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Indicador de escritura */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensaje */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Textarea
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe qué presentación necesitas... (Ej: Crea una presentación sobre cascos de construcción con 5 diapositivas)"
                className="flex-1 min-h-[60px] resize-none"
                disabled={isGenerating}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentPrompt.trim() || isGenerating}
                className="self-end"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompts sugeridos */}
      {messages.length <= 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ejemplos de prompts</CardTitle>
            <CardDescription>
              Haz clic en cualquiera de estos ejemplos para comenzar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left h-auto p-3 justify-start"
                  onClick={() => handleSuggestedPrompt(prompt)}
                  disabled={isGenerating}
                >
                  <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{prompt}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ChatInterface;


// ============================================
// UTILS - Index Export
// Pet Monitor IoT App
// ============================================

// Colores del tema
export { COLORS, default as colors } from './colors';

// Configuración
export {
  THINGER_TOKEN,
  BUCKET_ID,
  API_URL,
  POLLING_INTERVAL,
  ONE_MINUTE,
  ALERT_THRESHOLDS,
  CARD_GAP,
  CARD_WIDTH,
  SCREEN_WIDTH,
  APP_INFO,
} from './config';

// Funciones helper
export {
  // Mascotas
  getPetEmoji,
  getConfidenceColor,
  
  // Temperatura
  getTempStatus,
  getTempTrend,
  
  // Agua
  getWaterStatus,
  
  // Bomba
  getPumpStatus,
  
  // Luz
  getLightStatus,
  
  // Formateo
  formatTemp,
  formatLastUpdate,
  formatConfidence,
} from './helpers';

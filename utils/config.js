// ============================================
// CONFIGURACIÓN DE LA APP - Pet Monitor
// ============================================

import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// ============================================
// THINGER.IO - API Configuration
// ============================================
export const THINGER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJwZXQ1dG9rZW4iLCJzdnIiOiJ1cy1lYXN0LmF3cy50aGluZ2VyLmlvIiwidXNyIjoiQ0RhbmllbCJ9.KoHx6-sp7eL8ThL7MdubimXzE1mvdygd0LmjqlEY0s8';
export const BUCKET_ID = 'bk1';
export const API_URL = `https://api.thinger.io/v2/users/CDaniel/buckets/${BUCKET_ID}/data?items=1`;

// ============================================
// POLLING & TIMING
// ============================================
export const POLLING_INTERVAL = 2000; // 2 segundos
export const ONE_MINUTE = 60000;       // 1 minuto en ms

// ============================================
// ALERTAS - UMBRALES
// ============================================
export const ALERT_THRESHOLDS = {
  TEMP_HIGH: 25,      // °C - Notificar cuando temp > 25
  TEMP_CRITICAL: 30,  // °C - Temperatura crítica
  WATER_ALERT: 'LLENO',
};

// ============================================
// LAYOUT
// ============================================
export const CARD_GAP = 12;
export const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;
export const SCREEN_WIDTH = width;

// ============================================
// APP INFO
// ============================================
export const APP_INFO = {
  name: 'Pet Monitor',
  version: '1.0.0',
  author: 'Pet Guardian IoT',
};

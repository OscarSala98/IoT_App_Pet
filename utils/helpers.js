// ============================================
// FUNCIONES HELPER - Pet Monitor
// ============================================

import { COLORS } from './colors';
import { ALERT_THRESHOLDS } from './config';

// ============================================
// DETECCIÓN DE MASCOTAS
// ============================================

/**
 * Obtiene el emoji correspondiente a cada tipo de mascota
 * @param {string} pet - Tipo de mascota (PERRO, GATO, etc.)
 * @returns {string} Emoji de la mascota
 */
export const getPetEmoji = (pet) => {
  const emojis = {
    'PERRO': '🐶',
    'GATO': '🐱',
    'PAJARO': '🐦',
    'HAMSTER': '🐹',
    'CONEJO': '🐰',
    'PEZ': '🐠',
    'TORTUGA': '🐢',
  };
  return emojis[pet?.toUpperCase()] || '🐾';
};

/**
 * Obtiene el color según el nivel de confianza
 * @param {number} confidence - Porcentaje de confianza (0-100)
 * @returns {string} Color hexadecimal
 */
export const getConfidenceColor = (confidence) => {
  if (confidence >= 90) return COLORS.success;
  if (confidence >= 70) return COLORS.warning;
  return COLORS.danger;
};

// ============================================
// TEMPERATURA
// ============================================

/**
 * Obtiene la configuración visual según la temperatura
 * @param {number} temp - Temperatura en °C
 * @returns {object} { color, text, glow }
 */
export const getTempStatus = (temp) => {
  if (temp > ALERT_THRESHOLDS.TEMP_CRITICAL) {
    return { color: COLORS.danger, text: 'Muy caliente', glow: COLORS.dangerGlow };
  }
  if (temp > ALERT_THRESHOLDS.TEMP_HIGH) {
    return { color: COLORS.warning, text: 'Caliente', glow: COLORS.warningGlow };
  }
  return { color: COLORS.success, text: 'Óptima', glow: COLORS.successGlow };
};

/**
 * Determina la tendencia de temperatura
 * @param {number} current - Temperatura actual
 * @param {number} previous - Temperatura anterior
 * @returns {string} 'up' | 'down' | 'stable'
 */
export const getTempTrend = (current, previous) => {
  if (previous === null) return 'stable';
  const diff = current - previous;
  if (diff > 0.5) return 'up';
  if (diff < -0.5) return 'down';
  return 'stable';
};

// ============================================
// NIVEL DE AGUA
// ============================================

/**
 * Obtiene la configuración visual según el nivel de agua
 * @param {string} level - Nivel de agua (VACIO, NORMAL, LLENO)
 * @returns {object} { color, text, glow, percent }
 */
export const getWaterStatus = (level) => {
  const statuses = {
    'VACIO': { color: COLORS.danger, text: 'Vacío', glow: COLORS.dangerGlow, percent: 10 },
    'NORMAL': { color: COLORS.success, text: 'Normal', glow: COLORS.successGlow, percent: 60 },
    'LLENO': { color: COLORS.info, text: 'Lleno', glow: COLORS.infoGlow, percent: 100 },
  };
  return statuses[level] || statuses['NORMAL'];
};

// ============================================
// BOMBA DE AGUA
// ============================================

/**
 * Obtiene la configuración visual según el estado de la bomba
 * @param {string} status - Estado de la bomba (ON, OFF)
 * @returns {object} { color, text, glow, isActive }
 */
export const getPumpStatus = (status) => {
  if (status === 'ON') {
    return { color: COLORS.primary, text: 'Dispensando', glow: COLORS.primaryGlow, isActive: true };
  }
  return { color: COLORS.textMuted, text: 'En espera', glow: 'transparent', isActive: false };
};

// ============================================
// ILUMINACIÓN
// ============================================

/**
 * Obtiene la configuración visual según el estado de la luz
 * @param {number|string} value - Valor de luz (0 = off, 20 = on)
 * @returns {object} { color, text, glow, isOn }
 */
export const getLightStatus = (value) => {
  const val = Number(value);
  if (val === 20) {
    return { color: COLORS.warning, text: 'Encendida', glow: COLORS.warningGlow, isOn: true };
  }
  return { color: COLORS.textMuted, text: 'Apagada', glow: 'transparent', isOn: false };
};

// ============================================
// FORMATEO
// ============================================

/**
 * Formatea la temperatura con unidad
 * @param {number} temp - Temperatura en °C
 * @param {number} decimals - Decimales a mostrar
 * @returns {string} Temperatura formateada
 */
export const formatTemp = (temp, decimals = 1) => {
  if (temp === null || temp === undefined) return '--';
  return `${Number(temp).toFixed(decimals)}°`;
};

/**
 * Formatea la hora de última actualización
 * @param {Date} date - Fecha de última actualización
 * @returns {string} Hora formateada (HH:MM:SS)
 */
export const formatLastUpdate = (date) => {
  if (!date) return '--:--:--';
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Formatea el porcentaje de confianza
 * @param {number} confidence - Porcentaje (0-100)
 * @returns {string} Porcentaje formateado
 */
export const formatConfidence = (confidence) => {
  if (confidence === null || confidence === undefined) return '--%';
  return `${confidence.toFixed(1)}%`;
};

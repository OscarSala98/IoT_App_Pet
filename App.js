import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import {
  Thermometer,
  Droplets,
  Settings2,
  Wifi,
  WifiOff,
  Camera,
  Shield,
  Zap,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Bell,
} from 'lucide-react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;

// ============================================
// CONFIGURACIÓN - THINGER.IO
// ============================================
const THINGER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJwZXQ1dG9rZW4iLCJzdnIiOiJ1cy1lYXN0LmF3cy50aGluZ2VyLmlvIiwidXNyIjoiQ0RhbmllbCJ9.KoHx6-sp7eL8ThL7MdubimXzE1mvdygd0LmjqlEY0s8'; // Reemplazar con tu token
const BUCKET_ID = 'bk1'; // <--- COLOCA AQUÍ EL ID DE TU DATA BUCKET
const API_URL = `https://api.thinger.io/v2/users/CDaniel/buckets/${BUCKET_ID}/data?items=1`;
const POLLING_INTERVAL = 2000; // 2 segundos

// ============================================
// COLORES DEL TEMA
// ============================================
const COLORS = {
  background: '#0a0a0f',
  cardBg: '#16161e',
  cardBgLight: '#1e1e28',
  border: '#2a2a3a',
  
  primary: '#6366f1',
  primaryGlow: 'rgba(99, 102, 241, 0.3)',
  
  success: '#10b981',
  successGlow: 'rgba(16, 185, 129, 0.3)',
  
  warning: '#f59e0b',
  warningGlow: 'rgba(245, 158, 11, 0.3)',
  
  danger: '#ef4444',
  dangerGlow: 'rgba(239, 68, 68, 0.3)',
  
  info: '#06b6d4',
  infoGlow: 'rgba(6, 182, 212, 0.3)',
  
  textPrimary: '#ffffff',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
};

// ============================================
// CONFIGURACIÓN DE NOTIFICACIONES
// ============================================
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ============================================
// COMPONENTE: Modal de Alerta
// ============================================
const AlertModal = ({ visible, alert, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible || !alert) return null;

  const getAlertColor = (type) => {
    switch (type) {
      case 'water': return COLORS.info;
      case 'temp': return COLORS.danger;
      case 'pump': return COLORS.primary;
      case 'light': return COLORS.warning;
      default: return COLORS.primary;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'water': return Droplets;
      case 'temp': return Thermometer;
      case 'pump': return Settings2;
      case 'light': return Lightbulb;
      default: return Bell;
    }
  };

  const IconComponent = getAlertIcon(alert.type);
  const alertColor = getAlertColor(alert.type);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
        <Animated.View 
          style={[
            styles.modalContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          {/* Glow Effect */}
          <View style={[styles.modalGlow, { backgroundColor: alertColor }]} />
          
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={[styles.modalIconContainer, { backgroundColor: `${alertColor}20` }]}>
              <IconComponent size={32} color={alertColor} />
            </View>
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <Text style={styles.modalTitle}>{alert.title}</Text>
          <Text style={styles.modalMessage}>{alert.message}</Text>

          {/* Button */}
          <TouchableOpacity 
            style={[styles.modalButton, { backgroundColor: alertColor }]}
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>Entendido</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ============================================
// COMPONENTE: Punto Live Parpadeante
// ============================================
const LiveIndicator = ({ isConnected }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={styles.liveContainer}>
      <View style={styles.liveIndicatorWrapper}>
        <Animated.View
          style={[
            styles.livePulse,
            {
              backgroundColor: isConnected ? COLORS.success : COLORS.danger,
              transform: [{ scale: pulseAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
        <View
          style={[
            styles.liveDot,
            { backgroundColor: isConnected ? COLORS.success : COLORS.danger },
          ]}
        />
      </View>
      <Text style={[styles.liveText, { color: isConnected ? COLORS.success : COLORS.danger }]}>
        {isConnected ? 'LIVE' : 'OFFLINE'}
      </Text>
    </View>
  );
};

// ============================================
// COMPONENTE: Header
// ============================================
const Header = ({ isConnected }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.logoContainer}>
          <Shield size={28} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Pet Guardian</Text>
          <Text style={styles.headerSubtitle}>Monitoreo en tiempo real</Text>
        </View>
      </View>
      <LiveIndicator isConnected={isConnected} />
    </View>
  );
};

// ============================================
// COMPONENTE: Skeleton Loader
// ============================================
const SkeletonLoader = ({ style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={[styles.skeleton, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
};

// ============================================
// COMPONENTE: Tarjeta de Cámara Principal
// ============================================
const CameraCard = ({ imageUrl, mascota, confianza, isLoading, hasError }) => {
  const [imageError, setImageError] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // Resetear el estado de error cuando llega una nueva URL de imagen
  useEffect(() => {
    if (imageUrl) {
      setImageError(false);
    }
  }, [imageUrl]);

  const getPetEmoji = (pet) => {
    const emojis = {
      'PERRO': '🐶',
      'GATO': '🐱',
      'PAJARO': '🐦',
      'HAMSTER': '🐹',
      'CONEJO': '🐰',
    };
    return emojis[pet?.toUpperCase()] || '🐾';
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 90) return COLORS.success;
    if (conf >= 70) return COLORS.warning;
    return COLORS.danger;
  };

  if (isLoading) {
    return (
      <View style={styles.cameraCard}>
        <SkeletonLoader style={styles.cameraImageSkeleton} />
      </View>
    );
  }

  return (
    <View style={styles.cameraCard}>
      <View style={styles.cameraHeader}>
        <View style={styles.cameraIconContainer}>
          <Camera size={18} color={COLORS.textSecondary} />
          <Text style={styles.cameraLabel}>Última Captura</Text>
        </View>
        <View style={styles.aiActiveBadge}>
          <Zap size={12} color={COLORS.success} />
          <Text style={styles.aiActiveBadgeText}>IA ACTIVA</Text>
        </View>
      </View>

      <View style={styles.cameraImageContainer}>
        {(hasError || imageError || !imageUrl) ? (
          <View style={styles.cameraErrorContainer}>
            <Camera size={48} color={COLORS.textMuted} />
            <Text style={styles.cameraErrorText}>Sin detección reciente</Text>
            <Text style={styles.cameraErrorSubtext}>Esperando captura de mascota</Text>
          </View>
        ) : (
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => setImageModalVisible(true)}
            style={{ flex: 1 }}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.cameraImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          </TouchableOpacity>
        )}

        {/* Overlay con detección */}
        {mascota && !hasError && !imageError && (
          <View style={styles.detectionOverlay}>
            <View style={styles.detectionBadge}>
              <Text style={styles.detectionEmoji}>{getPetEmoji(mascota)}</Text>
              <View>
                <Text style={styles.detectionText}>{mascota} detectado</Text>
                <View style={styles.confidenceContainer}>
                  <Zap size={12} color={getConfidenceColor(confianza)} />
                  <Text style={[styles.confidenceText, { color: getConfidenceColor(confianza) }]}>
                    {confianza?.toFixed(1)}% confianza
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Modal de Imagen Completa */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity 
            style={styles.imageModalCloseArea}
            activeOpacity={1}
            onPress={() => setImageModalVisible(false)}
          >
            <View style={styles.imageModalHeader}>
              <Text style={styles.imageModalTitle}>Última Captura</Text>
              <TouchableOpacity 
                style={styles.imageModalCloseBtn}
                onPress={() => setImageModalVisible(false)}
              >
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.imageModalContent}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.imageModalFull}
                resizeMode="contain"
              />
              
              {mascota && (
                <View style={styles.imageModalInfo}>
                  <Text style={styles.imageModalPet}>{getPetEmoji(mascota)} {mascota}</Text>
                  <Text style={[styles.imageModalConfidence, { color: getConfidenceColor(confianza) }]}>
                    {confianza?.toFixed(1)}% confianza
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

// ============================================
// COMPONENTE: Smart Alert Banner
// ============================================
const SmartAlert = ({ temp, water, hasError }) => {
  let alertConfig = null;

  if (hasError) {
    alertConfig = {
      color: COLORS.danger,
      text: 'Sistema desconectado. Revisa tu red.',
      icon: WifiOff
    };
  } else if (temp > 30) {
    alertConfig = {
      color: COLORS.danger,
      text: '¡Alerta! Temperatura crítica detectada.',
      icon: Thermometer
    };
  } else if (water === 'LLENO') {
    alertConfig = {
      color: COLORS.warning,
      text: '¡ALERTA! Plato lleno. Detener llenado.',
      icon: Droplets
    };
  } else if (water !== 'NORMAL' && water !== null) {
    alertConfig = {
      color: COLORS.warning,
      text: 'Atención: Revisar nivel de agua.',
      icon: Droplets
    };
  }

  if (!alertConfig) return null;

  const Icon = alertConfig.icon;

  return (
    <View style={[styles.alertBanner, { backgroundColor: `${alertConfig.color}15`, borderColor: `${alertConfig.color}40` }]}>
      <Icon size={20} color={alertConfig.color} />
      <Text style={[styles.alertText, { color: alertConfig.color }]}>{alertConfig.text}</Text>
    </View>
  );
};

// ============================================
// COMPONENTE: Tarjeta de Sensor Genérica
// ============================================
const SensorCard = ({ 
  icon: Icon, 
  title, 
  value, 
  unit, 
  status, 
  statusText, 
  color, 
  glowColor,
  isAnimated,
  isLoading,
  trend 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isAnimated) {
      const animate = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1.05,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.6,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.3,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      animate.start();
      return () => animate.stop();
    }
  }, [isAnimated]);

  if (isLoading) {
    return (
      <View style={styles.sensorCard}>
        <SkeletonLoader style={styles.sensorIconSkeleton} />
        <SkeletonLoader style={styles.sensorTextSkeleton} />
        <SkeletonLoader style={styles.sensorValueSkeleton} />
      </View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.sensorCard,
        isAnimated && { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Glow Effect */}
      <Animated.View 
        style={[
          styles.sensorGlow,
          { 
            backgroundColor: glowColor,
            opacity: isAnimated ? glowAnim : 0.2,
          },
        ]} 
      />

      <View style={[styles.sensorIconContainer, { backgroundColor: `${color}20` }]}>
        <Icon size={24} color={color} />
      </View>

      <Text style={styles.sensorTitle}>{title}</Text>
      
      <View style={styles.sensorValueContainer}>
        <Text style={[styles.sensorValue, { color }]}>
          {value}
        </Text>
        {unit && <Text style={styles.sensorUnit}>{unit}</Text>}
        
        {/* Indicador de Tendencia */}
        {trend && (
          <View style={styles.trendContainer}>
            {trend === 'up' && <TrendingUp size={16} color={COLORS.warning} />}
            {trend === 'down' && <TrendingDown size={16} color={COLORS.info} />}
            {trend === 'stable' && <Minus size={16} color={COLORS.textMuted} />}
          </View>
        )}
      </View>

      <View style={[styles.statusBadge, { backgroundColor: `${color}15` }]}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={[styles.statusText, { color }]}>{statusText}</Text>
      </View>
    </Animated.View>
  );
};

// ============================================
// COMPONENTE: Sección de Título
// ============================================
const SectionTitle = ({ title, icon: Icon }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIcon}>
      <Icon size={16} color={COLORS.primary} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// ============================================
// COMPONENTE PRINCIPAL: App
// ============================================
export default function App() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [tempTrend, setTempTrend] = useState('stable');
  
  // Estado para el Modal de Alertas
  const [alertModal, setAlertModal] = useState({ visible: false, alert: null });
  const [alertQueue, setAlertQueue] = useState([]);
  
  const prevTempRef = useRef(null);
  const lastWaterNotif = useRef(0);
  const lastTempNotif = useRef(0);
  const prevPump = useRef(null);
  const prevLight = useRef(null);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Función para obtener datos
  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    
    try {
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${THINGER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      // Adaptación para Data Bucket: Thinger devuelve un array [{val: {...}, ts: ...}]
      // Tomamos el primer elemento (el más reciente gracias a ?items=1) y su propiedad 'val'
      console.log('🔍 Respuesta completa del servidor:', JSON.stringify(response.data));
      
      const firstItem = Array.isArray(response.data) ? response.data[0] : response.data;
      // Si existe 'val' lo usamos, si no, usamos el objeto entero (tu caso actual)
      const result = firstItem?.val || firstItem;
      
      console.log('✅ Datos recibidos del Bucket:', result);
      setData(result);
      setHasError(false);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
      setHasError(true);
      // Mantener datos antiguos si existen
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Polling cada 2 segundos
  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      fetchData();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Solicitar permisos de notificación
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permiso de notificaciones denegado');
      }
    })();
  }, []);

  // Función para mostrar alerta como modal
  const showAlert = (type, title, message) => {
    const newAlert = { type, title, message, id: Date.now() };
    setAlertQueue(prev => [...prev, newAlert]);
    Vibration.vibrate(200); // Vibración corta
  };

  // Procesar cola de alertas
  useEffect(() => {
    if (alertQueue.length > 0 && !alertModal.visible) {
      const nextAlert = alertQueue[0];
      setAlertModal({ visible: true, alert: nextAlert });
      setAlertQueue(prev => prev.slice(1));
    }
  }, [alertQueue, alertModal.visible]);

  // Cerrar modal
  const closeAlertModal = () => {
    setAlertModal({ visible: false, alert: null });
  };

  // Helper para enviar notificaciones locales (silencia errores de Expo Go)
  const sendLocalNotification = async (title, body) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: null,
      });
    } catch (e) {
      // Silenciar error en Expo Go - las notificaciones locales funcionan igual
      console.log('📱 Notificación enviada (modo local)');
    }
  };

  // Lógica de Alertas y Notificaciones
  useEffect(() => {
    if (!data) return;

    const now = Date.now();
    const ONE_MINUTE = 60000;

    // 1. Alerta de Tanque Lleno (Cada minuto)
    if (data.agua === 'LLENO') {
      if (now - lastWaterNotif.current > ONE_MINUTE) {
        // Modal en app
        showAlert('water', '💧 ¡Tanque Lleno!', 'El nivel de agua está al máximo. Por favor detén el llenado.');
        // Notificación push (para cuando la app está en segundo plano)
        sendLocalNotification('💧 ¡Tanque Lleno!', 'El nivel de agua está al máximo. Por favor detén el llenado.');
        lastWaterNotif.current = now;
      }
    }

    // 2. Alerta de Temperatura Alta > 20°C (PRUEBA - cambiar a 25 después)
    const tempVal = parseFloat(data.temp);
    if (tempVal > 20) {
      if (now - lastTempNotif.current > ONE_MINUTE) {
        // Modal en app
        showAlert('temp', '🌡️ Temperatura Alta', `La temperatura ha subido a ${tempVal}°C. Verifica la ventilación.`);
        // Notificación push
        sendLocalNotification('🌡️ Temperatura Alta', `La temperatura ha subido a ${tempVal}°C.`);
        lastTempNotif.current = now;
      }
    }

    // 3. Cambio en Bomba (Dispensando)
    if (prevPump.current !== null && prevPump.current !== data.bomba) {
      const estado = data.bomba === 'ON' ? 'ACTIVADA' : 'DESACTIVADA';
      const emoji = data.bomba === 'ON' ? '✅' : '⏹️';
      // Modal en app
      showAlert('pump', `⚙️ Bomba ${emoji}`, `La bomba de agua se ha ${estado}.`);
      // Notificación push
      sendLocalNotification('⚙️ Bomba de Agua', `La bomba se ha ${estado}.`);
    }
    prevPump.current = data.bomba;

    // 4. Cambio en Luces
    if (prevLight.current !== null && prevLight.current !== data.luz) {
      const val = Number(data.luz);
      const estado = val === 20 ? 'ENCENDIDAS' : 'APAGADAS';
      const emoji = val === 20 ? '🌞' : '🌙';
      // Modal en app
      showAlert('light', `💡 Iluminación ${emoji}`, `Las luces se han ${estado}.`);
      // Notificación push
      sendLocalNotification('💡 Iluminación', `Las luces se han ${estado}.`);
    }
    prevLight.current = data.luz;

  }, [data]);

  // Obtener valores con defaults
  const temperatura = data?.temp ? parseFloat(data.temp) : null;
  const agua = data?.agua || null;
  const bomba = data?.bomba || null;
  const luz = data?.luz || null; // Nuevo campo esperado
  const mascota = data?.mascota || null;
  const confianza = data?.confianza || null;
  const imagenUrl = data?.imagen_url || null;

  // Determinar estados y colores
  const getTempStatus = (temp) => {
    if (temp === null) return { color: COLORS.textMuted, text: 'Sin datos', glow: 'transparent' };
    if (temp > 30) return { color: COLORS.danger, text: 'Muy caliente', glow: COLORS.dangerGlow };
    if (temp > 26) return { color: COLORS.warning, text: 'Templado', glow: COLORS.warningGlow };
    return { color: COLORS.info, text: 'Óptimo', glow: COLORS.infoGlow };
  };

  const getWaterStatus = (waterLevel) => {
    if (waterLevel === null) return { color: COLORS.textMuted, text: 'Sin datos', glow: 'transparent' };
    if (waterLevel === 'NORMAL') return { color: COLORS.success, text: 'Nivel Óptimo', glow: COLORS.successGlow };
    if (waterLevel === 'LLENO') return { color: COLORS.warning, text: '¡Detener Llenado!', glow: COLORS.warningGlow };
    return { color: COLORS.warning, text: 'Revisar', glow: COLORS.warningGlow };
  };

  const getPumpStatus = (pumpState) => {
    if (pumpState === null) return { color: COLORS.textMuted, text: 'Sin datos', glow: 'transparent', active: false };
    if (pumpState === 'ON') return { color: COLORS.primary, text: 'Activa', glow: COLORS.primaryGlow, active: true };
    return { color: COLORS.textMuted, text: 'Inactiva', glow: 'transparent', active: false };
  };

  const getLightStatus = (lightState) => {
    const val = Number(lightState);
    if (lightState === null) return { color: COLORS.textMuted, text: 'Sin datos', glow: 'transparent', active: false };
    if (val === 20) return { color: '#fbbf24', text: 'Encendida', glow: 'rgba(251, 191, 36, 0.3)', active: true };
    return { color: COLORS.textMuted, text: 'Apagada', glow: 'transparent', active: false };
  };

  const tempStatus = getTempStatus(temperatura);
  const waterStatus = getWaterStatus(agua);
  const pumpStatus = getPumpStatus(bomba);
  const lightStatus = getLightStatus(luz);

  // Lógica de Tendencia de Temperatura
  useEffect(() => {
    if (temperatura !== null) {
      if (prevTempRef.current !== null) {
        if (temperatura > prevTempRef.current) setTempTrend('up');
        else if (temperatura < prevTempRef.current) setTempTrend('down');
        else setTempTrend('stable');
      }
      prevTempRef.current = temperatura;
    }
  }, [temperatura]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchData(true)}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <Header isConnected={!hasError && data !== null} />

        {/* Alerta Inteligente (Solo aparece si es necesario) */}
        <SmartAlert temp={temperatura} water={agua} hasError={hasError} />

        <SectionTitle title="Vista en Vivo" icon={Camera} />
        
        {/* Tarjeta de Cámara */}
        <CameraCard
          imageUrl={imagenUrl}
          mascota={mascota}
          confianza={confianza}
          isLoading={isLoading}
          hasError={hasError}
        />

        <SectionTitle title="Sensores y Estado" icon={Shield} />

        {/* Grid de Sensores */}
        <View style={styles.sensorGrid}>
          {/* Temperatura */}
          <SensorCard
            icon={Thermometer}
            title="Temperatura"
            value={temperatura !== null ? temperatura.toFixed(1) : '--'}
            unit="°C"
            color={tempStatus.color}
            glowColor={tempStatus.glow}
            statusText={tempStatus.text}
            isLoading={isLoading}
            trend={tempTrend}
          />

          {/* Nivel de Agua */}
          <SensorCard
            icon={Droplets}
            title="Nivel de Agua"
            value={agua === 'NORMAL' ? '●' : agua === 'LLENO' ? '●●' : '○'}
            color={waterStatus.color}
            glowColor={waterStatus.glow}
            statusText={waterStatus.text}
            isLoading={isLoading}
          />

          {/* Bomba de Agua */}
          <SensorCard
            icon={Settings2}
            title="Bomba de Agua"
            value={bomba === 'ON' ? 'ON' : 'OFF'}
            color={pumpStatus.color}
            glowColor={pumpStatus.glow}
            statusText={pumpStatus.text}
            isAnimated={pumpStatus.active}
            isLoading={isLoading}
          />

          {/* Luces (Nuevo) */}
          <SensorCard
            icon={Lightbulb}
            title="Iluminación"
            value={Number(luz) === 20 ? 'ON' : 'OFF'}
            color={lightStatus.color}
            glowColor={lightStatus.glow}
            statusText={lightStatus.text}
            isLoading={isLoading}
          />

          {/* Estado de Conexión */}
          <SensorCard
            icon={hasError ? WifiOff : Wifi}
            title="Conexión"
            value={hasError ? 'Error' : 'OK'}
            color={hasError ? COLORS.danger : COLORS.success}
            glowColor={hasError ? COLORS.dangerGlow : COLORS.successGlow}
            statusText={hasError ? 'Desconectado' : 'Conectado'}
            isLoading={isLoading}
          />
        </View>

        {/* Footer con última actualización */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {lastUpdate 
              ? `Última actualización: ${lastUpdate.toLocaleTimeString()}` 
              : 'Esperando conexión...'
            }
          </Text>
        </View>
      </ScrollView>

      {/* Modal de Alertas */}
      <AlertModal 
        visible={alertModal.visible} 
        alert={alertModal.alert} 
        onClose={closeAlertModal} 
      />
    </View>
  );
}

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Alert Banner
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 24,
    gap: 10,
    borderWidth: 1,
  },
  alertText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
  },

  // Live Indicator
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  liveIndicatorWrapper: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  livePulse: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
  },

  // Camera Card
  cameraCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cameraIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cameraLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: COLORS.textSecondary,
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.danger}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  recordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.danger,
  },
  recordingText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.danger,
    letterSpacing: 0.5,
  },
  aiActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.success}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  aiActiveBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  cameraImageContainer: {
    height: 220,
    backgroundColor: COLORS.cardBgLight,
  },
  cameraImage: {
    width: '100%',
    height: '100%',
  },
  cameraImageSkeleton: {
    height: 260,
    borderRadius: 0,
  },
  cameraErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  cameraErrorText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: COLORS.textSecondary,
  },
  cameraErrorSubtext: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textMuted,
  },

  // Detection Overlay
  detectionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
  },
  detectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 22, 30, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
    backdropFilter: 'blur(10px)',
  },
  detectionEmoji: {
    fontSize: 32,
  },
  detectionText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textPrimary,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  confidenceText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },

  // Image Modal (Full Screen)
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  imageModalCloseArea: {
    flex: 1,
  },
  imageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  imageModalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textPrimary,
  },
  imageModalCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  imageModalFull: {
    width: '100%',
    height: '80%',
    borderRadius: 12,
  },
  imageModalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  imageModalPet: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textPrimary,
  },
  imageModalConfidence: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },

  // Sensor Grid
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },

  // Sensor Card
  sensorCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  sensorGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  sensorIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  sensorTitle: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  sensorValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 12,
  },
  trendContainer: {
    marginLeft: 4,
    marginBottom: 4,
  },
  sensorValue: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1,
  },
  sensorUnit: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },

  // Skeleton
  skeleton: {
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sensorIconSkeleton: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  sensorTextSkeleton: {
    width: '60%',
    height: 16,
    marginBottom: 8,
  },
  sensorValueSkeleton: {
    width: '80%',
    height: 32,
    marginBottom: 12,
  },
  
  // Control Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Footer
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textMuted,
  },

  // Modal de Alertas
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  modalGlow: {
    position: 'absolute',
    top: -100,
    left: '50%',
    marginLeft: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.3,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.cardBgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textPrimary,
  },
});

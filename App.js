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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
          <Text style={styles.cameraLabel}>Cámara Principal</Text>
        </View>
        <View style={styles.recordingBadge}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>REC</Text>
        </View>
      </View>

      <View style={styles.cameraImageContainer}>
        {(hasError || imageError || !imageUrl) ? (
          <View style={styles.cameraErrorContainer}>
            <WifiOff size={48} color={COLORS.textMuted} />
            <Text style={styles.cameraErrorText}>Sin conexión a cámara</Text>
            <Text style={styles.cameraErrorSubtext}>Verificar red local</Text>
          </View>
        ) : (
          <Image
            source={{ uri: imageUrl }}
            style={styles.cameraImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
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
  const prevTempRef = useRef(null);

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
});

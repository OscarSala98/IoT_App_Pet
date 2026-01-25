# Pet Monitor 🐾

Una aplicación React Native (Expo) para monitoreo de mascotas IoT con interfaz moderna estilo "Bento Grid" en Dark Mode.

## ✨ Características

### 📷 Visualización de Capturas
- **Última detección de mascota** con IA activa
- **Modal a pantalla completa** al tocar la imagen
- Indicador de confianza de la detección
- Soporte para múltiples mascotas (🐶 🐱 🐦 🐹 🐰)

### 🔔 Sistema de Alertas Inteligentes
- **Notificaciones push locales** para eventos importantes
- **Modales animados** con vibración dentro de la app
- Sistema de cola para múltiples alertas
- Alertas configurables:
  - 💧 Tanque de agua lleno
  - 🌡️ Temperatura alta (>25°C)
  - ⚙️ Cambio de estado de bomba
  - 💡 Cambio de iluminación

### 📊 Monitoreo en Tiempo Real
- 🌡️ **Temperatura** con estados visuales (óptima/caliente/muy caliente)
- 💧 **Nivel de agua** con indicadores de estado
- ⚙️ **Estado de bomba** con animaciones de dispensado
- 💡 **Control de iluminación** con indicador visual
- 🔄 **Polling automático** cada 2 segundos

### 🎨 Diseño Premium
- **Dark Mode** elegante
- **Bento Grid** responsive
- Animaciones fluidas y efectos glow
- Tipografía Inter moderna
- Skeleton loaders durante carga

## 🛠️ Instalación

### Prerequisitos

- Node.js 18+ instalado
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app en tu dispositivo móvil

### Pasos de instalación

```bash
# 1. Navegar al directorio del proyecto
cd pet-monitor

# 2. Instalar dependencias
npm install

# 3. Instalar dependencias específicas de Expo
npx expo install expo-font @expo-google-fonts/inter react-native-svg

# 4. Iniciar el servidor de desarrollo
npx expo start
```

### Comandos de instalación en una sola línea:

```bash
npm install axios lucide-react-native react-native-svg expo-font @expo-google-fonts/inter expo-notifications
```

## ⚙️ Configuración

### Token de Thinger.io

Edita el archivo `App.js` y reemplaza el token:

```javascript
const THINGER_TOKEN = 'TU_TOKEN_AQUI';
```

### Endpoint del API

El endpoint está configurado para Data Bucket de Thinger.io:
```
GET https://api.thinger.io/v2/users/{usuario}/buckets/{bucket}/data?items=1
```

## 📱 Estructura del JSON esperado

```json
{
  "mascota": "PERRO",
  "confianza": 95.5,
  "agua": "NORMAL",
  "temp": "24.5",
  "bomba": "OFF",
  "luz": 0,
  "imagen_url": "https://tu-servidor.com/imagen.jpg"
}
```

### Valores aceptados

| Campo | Valores |
|-------|---------|
| `mascota` | PERRO, GATO, PAJARO, HAMSTER, CONEJO |
| `agua` | VACIO, NORMAL, LLENO |
| `bomba` | ON, OFF |
| `luz` | 0 (apagado), 20 (encendido) |
| `temp` | Número (°C) |
| `confianza` | 0-100 (%) |

## 🎨 Diseño

La app utiliza un diseño **Bento Grid** con:

- **Fondo oscuro profundo** (`#0a0a0f`)
- **Tarjetas con bordes redondeados** (20px+)
- **Colores neón suaves** para estados
- **Animaciones fluidas** en indicadores
- **Tipografía Inter** moderna

### Paleta de colores

| Color | Uso |
|-------|-----|
| `#6366f1` | Primary (Indigo) |
| `#10b981` | Success (Verde) |
| `#f59e0b` | Warning (Naranja) |
| `#ef4444` | Danger (Rojo) |
| `#06b6d4` | Info (Cyan) |

## 📂 Estructura del proyecto

```
pet-monitor/
├── App.js                  # Componente principal
├── app.json                # Configuración de Expo
├── package.json            # Dependencias
├── babel.config.js         # Configuración de Babel
├── utils/
│   ├── index.js            # Exportaciones centralizadas
│   ├── colors.js           # Paleta de colores del tema
│   ├── config.js           # Configuración (API, umbrales, layout)
│   └── helpers.js          # Funciones helper (formateo, status)
└── README.md
```

### 📦 Utils disponibles

```javascript
// Importar desde utils
import { 
  COLORS,           // Paleta de colores
  API_URL,          // URL del API
  POLLING_INTERVAL, // Intervalo de polling
  ALERT_THRESHOLDS, // Umbrales de alerta
  getPetEmoji,      // 🐶 Emoji por tipo de mascota
  getTempStatus,    // Estado visual de temperatura
  getWaterStatus,   // Estado visual de agua
  formatTemp,       // Formatear temperatura
} from './utils';
```

## 🔔 Sistema de Notificaciones

La app incluye un sistema dual de alertas:

1. **Modales Animados** - Alertas dentro de la app con:
   - Animación de entrada/salida
   - Vibración del dispositivo
   - Cola de alertas múltiples
   - Cierre automático o manual

2. **Notificaciones Push Locales** - Para cuando la app está en segundo plano

### Umbrales de Alerta

| Evento | Condición |
|--------|-----------|
| Temperatura | > 25°C |
| Agua | Estado "LLENO" |
| Bomba | Cambio de estado |
| Luces | Cambio de estado |

## 🚀 Scripts disponibles

```bash
# Iniciar servidor de desarrollo
npm start

# Iniciar en Android
npm run android

# Iniciar en iOS  
npm run ios

# Iniciar en web
npm run web
```

## 📝 Notas importantes

1. **Conexión a IP local**: La app está configurada para aceptar conexiones HTTP no seguras (necesario para cámaras IP locales)

2. **Polling**: Los datos se actualizan cada 2 segundos automáticamente

3. **Manejo de errores**: Si el servidor no responde, se mantienen los últimos datos válidos

4. **Permisos Android**: El archivo `app.json` ya incluye `usesCleartextTraffic: true` para conexiones HTTP

## 🐛 Solución de problemas

### La imagen de la cámara no carga
- Verifica que la URL de la imagen sea accesible
- Toca la imagen para verla en pantalla completa

### Error de conexión al API
- Verifica tu token de Thinger.io
- Comprueba tu conexión a internet
- Revisa que el endpoint del bucket sea correcto

### Las fuentes no cargan
- Ejecuta: `npx expo install expo-font @expo-google-fonts/inter`

### Warning de expo-notifications
- Es normal en Expo Go (SDK 53+)
- Las notificaciones locales funcionan correctamente
- Para push remoto, usar Development Build

## 📸 Capturas de Pantalla

La app incluye:
- Dashboard principal con Bento Grid
- Modal de imagen a pantalla completa
- Alertas animadas con iconos

---

Desarrollado con ❤️ para Pet Guardian IoT | Expo SDK 54

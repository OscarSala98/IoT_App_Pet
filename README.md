# Pet Monitor 🐾

Una aplicación React Native (Expo) para monitoreo de mascotas IoT con interfaz moderna estilo "Bento Grid" en Dark Mode.

## ✨ Características

- 📷 **Visualización en tiempo real** de cámara IP local
- 🐶 **Detección de mascotas** con indicador de confianza
- 🌡️ **Monitoreo de temperatura** con estados visuales
- 💧 **Nivel de agua** con indicadores de estado
- ⚙️ **Control de bomba** con animaciones
- 🔄 **Polling automático** cada 2 segundos
- 📱 **Diseño responsive** y elegante

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
npm install axios lucide-react-native react-native-svg expo-font @expo-google-fonts/inter
```

## ⚙️ Configuración

### Token de Thinger.io

Edita el archivo `App.js` y reemplaza el token:

```javascript
const THINGER_TOKEN = 'TU_TOKEN_AQUI';
```

### Endpoint del API

El endpoint está configurado para:
```
GET https://api.thinger.io/v2/users/CDaniel/devices/servidor_python/resources/data
```

## 📱 Estructura del JSON esperado

```json
{
  "mascota": "PERRO",
  "confianza": 95.5,
  "agua": "NORMAL",
  "temp": "24.5",
  "bomba": "OFF",
  "imagen_url": "http://192.168.137.1:5000/static/..."
}
```

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
├── App.js              # Componente principal
├── app.json            # Configuración de Expo
├── package.json        # Dependencias
├── babel.config.js     # Configuración de Babel
├── assets/
│   ├── icon.png        # Icono de la app
│   ├── splash.png      # Pantalla de carga
│   └── adaptive-icon.png
└── README.md
```

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
- Verifica que tu dispositivo esté en la misma red que la cámara
- Confirma que la URL de la imagen sea accesible

### Error de conexión al API
- Verifica tu token de Thinger.io
- Comprueba tu conexión a internet

### Las fuentes no cargan
- Ejecuta: `npx expo install expo-font @expo-google-fonts/inter`

---

Desarrollado con ❤️ para Pet Guardian IoT

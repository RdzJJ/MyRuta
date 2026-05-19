# MyRuta Mobile App - README

## 📱 Descripción

Aplicación Flutter para el sistema de monitoreo de transporte público urbano **MyRuta**.
Diseño dark mode con acentos verde neón (#00FF88) para una experiencia visual moderna.

Soporta dos roles principales:
- **🚌 Conductor**: Realiza seguimiento GPS en tiempo real
- **👤 Cliente**: Consulta rutas y tiempos estimados en vivo

## 🎯 Requisitos

- **Flutter SDK**: 3.10 o superior
- **Dart**: 3.0 o superior
- **Android Studio** o **Xcode** (para emuladores)
- **JDK**: 11 o superior para Android

## 🚀 Instalación y Configuración

### 1. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local

# Editar con tus valores
# - API_BASE_URL: URL del backend (ej: http://localhost:3000)
# - GOOGLE_MAPS_API_KEY: Tu clave de Google Maps
```

### 2. Instalar dependencias
```bash
flutter pub get
```

### 3. Ejecutar en desarrollo
```bash
# En emulador Android
flutter run

# En un dispositivo específico
flutter devices  # Listar dispositivos
flutter run -d <device_id>

# En iOS
flutter run -d iOS
```

### 4. Compilar para producción

**Android:**
```bash
flutter build apk --release
flutter build appbundle --release
```

**iOS:**
```bash
flutter build ios --release
```

## 📁 Estructura del Proyecto (Arquitectura)

```
lib/
├── main.dart                          # Entry point
│
├── config/
│   ├── theme.dart                    # 🎨 Diseño (colores, tipografía)
│   └── constants.dart                # ⚙️ Constantes globales
│
├── models/
│   └── ruta.dart                     # 📊 Modelos de datos
│       ├── Ruta
│       ├── ViajeActivo
│       ├── Usuario
│       └── Localizacion
│
├── services/
│   ├── api_service.dart              # 🌐 Llamadas a API
│   ├── socket_service.dart           # 📡 Comunicación WebSocket
│   └── location_service.dart         # 📍 Servicios de ubicación
│
├── providers/
│   ├── auth_provider.dart            # 🔐 Autenticación
│   ├── rutas_provider.dart           # 🛣️ Gestión de rutas
│   └── viaje_provider.dart           # 🚗 Estado de viaje
│
├── screens/
│   └── cliente/
│       ├── pantalla_inicio.dart              # 🏠 Inicio / Mapa
│       ├── pantalla_explorar_rutas.dart      # 🗺️ Explorar Rutas
│       ├── pantalla_viaje_activo.dart        # 🟢 Viaje Activo
│       └── pantalla_llegada_en_vivo.dart     # ⏰ Llegada en Vivo
│
├── widgets/
│   ├── components.dart               # 🧩 Componentes reutilizables
│   │   ├── BotonPrincipal
│   │   ├── CardRuta
│   │   ├── HeaderBusqueda
│   │   ├── IndicadorEstado
│   │   └── LoadingSkeleton
│   ├── buttons/                      # 🔘 Botones especializados
│   └── cards/                        # 📇 Cards especializadas
│
└── utils/
    ├── validators.dart               # ✅ Validadores
    └── helpers.dart                  # 🛠️ Funciones auxiliares
```

## 🎨 Design System

### Colores
```dart
// Principales
primary: #00FF88 (Verde Neón)
background: #0A0A0A (Negro Profundo)
surface: #1A1A1A (Gris Oscuro)

// Texto
textPrimary: #FFFFFF
textSecondary: #B0B0B0

// Estados
success: #00FF88
warning: #FFB800
error: #FF4444
info: #00B8FF
```

### Tipografía
- **Display Large**: 32px, Bold
- **Headline Small**: 20px, SemiBold
- **Title**: 16-18px, Medium/SemiBold
- **Body**: 14-16px, Regular
- **Small**: 12px, Regular

## 📱 Pantallas Implementadas

### 1️⃣ Pantalla Inicio / Mapa
**Ubicación**: `screens/cliente/pantalla_inicio.dart`

Características:
- 🔍 Barra de búsqueda: "¿A dónde quieres ir?"
- 🗺️ Simulación de mapa con ubicación del usuario
- 📍 Rutas cercanas con cards interactivos
- ⏱️ Distancia y tiempo estimado por ruta
- 🟢 Indicador "EN VIVO" para rutas activas

### 2️⃣ Pantalla Explorar Rutas
**Ubicación**: `screens/cliente/pantalla_explorar_rutas.dart`

Características:
- 📌 Rutas populares en grid (2 columnas)
- 📅 Rutas recientes en lista
- 🔴 Badge "EN VIVO" en rutas activas
- 🎯 Cada ruta muestra: número, nombre, línea
- 🔗 Navegación fluida entre rutas

### 3️⃣ Pantalla Viaje Activo
**Ubicación**: `screens/cliente/pantalla_viaje_activo.dart`

Características:
- 🔴 Badge "EN VIVO" intermitente
- 🗺️ Mapa simulado del progreso del viaje
- ⏱️ Tiempo estimado de llegada
- 🚌 Información del bus (número, velocidad)
- 📊 Próximas paradas numeradas
- 🌦️ Estado del tráfico (Moderado/Fluido/Congestionado)
- ✅ Botón "FINALIZAR VIAJE"

### 4️⃣ Pantalla Llegada en Vivo
**Ubicación**: `screens/cliente/pantalla_llegada_en_vivo.dart`

Características:
- ⏰ Contador de tiempo principal animado
- 📊 Información del bus en tarjeta
- 🚨 Estado del tráfico con alerta
- 👨‍✈️ Información del conductor
- 🔔 Botón "NOTIFICARME" (toggle)
- 📞 Botón para contactar conductor
- 💨 Velocidad y distancia en tiempo real

## 🧩 Componentes Reutilizables

### BotonPrincipal
```dart
BotonPrincipal(
  texto: 'Aceptar',
  onPressed: () {},
  icon: Icons.check,
  backgroundColor: AppColors.primary,
)
```

### CardRuta
```dart
CardRuta(
  numero: 'Ruta 135',
  nombre: 'Centro - Parque',
  linea: 'Línea 4',
  distancia: 2.5,
  tiempoEstimado: 15,
  enVivo: true,
  onTap: () {},
)
```

### HeaderBusqueda
```dart
HeaderBusqueda(
  hint: '¿A dónde vas?',
  onChanged: (value) {},
  prefixIcon: Icon(Icons.search),
)
```

## 🔧 Scripts Útiles

```bash
# Limpiar proyecto
flutter clean

# Ver dispositivos disponibles
flutter devices

# Ejecutar con verbose para debugging
flutter run -v

# Crear APK de release
flutter build apk --release

# Análisis de código
flutter analyze

# Formato de código
dart format lib/
```

## 🔗 Integración con Backend

El backend debe estar ejecutándose en:
- **API REST**: `http://localhost:3000/api`
- **WebSocket**: `http://localhost:3000` (Socket.io)

Endpoints utilizados:
- `POST /api/auth/login` - Autenticación
- `GET /api/rutas` - Listar rutas
- `POST /api/viajes` - Iniciar viaje
- `GET /api/viajes/:id` - Estado del viaje
- Socket eventos para ubicación en tiempo real

## 📦 Dependencias Principales

```yaml
provider: ^6.0.0          # State Management
http: ^1.1.0            # HTTP Cliente
socket_io_client: ^2.0.0 # WebSocket
google_maps_flutter: ^2.4.0 # Mapas
geolocator: ^9.0.0       # Ubicación GPS
shared_preferences: ^2.2.0 # Almacenamiento local
flutter_secure_storage: ^9.0.0 # Almacenamiento seguro
```

## 🚀 Próximos Pasos / Mejoras Futuras

- [ ] Implementar autenticación real con backend
- [ ] Integrar Google Maps en lugar de simulación
- [ ] Funcionalidad real de GPS y ubicación
- [ ] Sistema de notificaciones push
- [ ] Chat en tiempo real con conductor
- [ ] Historial de viajes
- [ ] Opiniones y calificaciones
- [ ] Método de pago integrado
- [ ] Modo oscuro dinámico
- [ ] Soporte offline

## 📝 Cambios Recientes (Commits)

```
feat: agregar estructura completa del proyecto Flutter
feat: implementar design system (tema oscuro + verde neón)
feat: crear 4 pantallas principales
feat: agregar componentes reutilizables
feat: implementar modelos de datos
feat: agregar constantes y configuración
```

## 🐛 Troubleshooting

**Error: "No connected devices"**
```bash
flutter devices
flutter emulators --launch <emulator_id>
```

**Error de dependencias**
```bash
flutter pub get
flutter pub upgrade
```

**Error de compilación Android**
```bash
flutter clean
flutter pub get
flutter build apk --debug
```

## 📞 Soporte

Para reportar issues o sugerencias, contacta al equipo de MyRuta.

---

**Última actualización**: 2026-04-19
**Versión**: 1.0.0
**Estado**: En desarrollo activo 🚀

### iOS
```bash
flutter build ios --release
```

## Configuración de Desarrollo

1. Copiar `.env.example` a `.env.local`
2. Actualizar variables de entorno
3. Ejecutar: `flutter pub get`
4. Ejecutar: `flutter run`

## Testing

```bash
flutter test
```

## Troubleshooting

Si encuentras problemas con las dependencias:
```bash
flutter clean
flutter pub get
flutter pub upgrade
```

Para problemas de build:
```bash
flutter clean
cd android && gradlew clean
```

## Licencia

MIT

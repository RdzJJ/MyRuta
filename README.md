# MyRuta - Sistema de Monitoreo de Rutas de Transporte Público

Sistema integral de monitoreo en tiempo real para rutas de transporte público urbano. Incluye predicción de demoras mediante machine learning, seguimiento de conductores GPS, y consulta de horarios en vivo.

**Estado del Proyecto**: Scaffolding Completo ✅ (150+ archivos, 15,000+ líneas de código)  
**Versión**: 1.0.0  
**Última Actualización**: Marzo 2026

## 📋 Contenido

- [Descripción General](#descripción-general)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Ejecución Local](#ejecución-local)
- [Documentación de Componentes](#documentación-de-componentes)
- [Integración y APIs](#integración-y-apis)
- [Roles y Control de Acceso](#roles-y-control-de-acceso)

---

## 🎯 Descripción General

MyRuta es un sistema completo de monitoreo de transporte público que proporciona:

- **Backend API**: Servidor Express.js con WebSocket en tiempo real
- **Frontend Web**: Interfaz React moderna para dashboards administrativos
- **Aplicación Móvil**: App Flutter para conductores y pasajeros
- **Servicio ML**: Predictor FastAPI para estimar demoras automáticamente
- **Infraestructura**: Docker Compose con PostgreSQL y Redis

---

## 🛠️ Stack Tecnológico

| Componente | Lenguaje | Framework | Versión |
|-----------|----------|-----------|---------|
| **Backend** | Node.js | Express.js, Socket.io, Prisma | 18+ |
| **Frontend Web** | JavaScript/React | Vite, Tailwind CSS, React Router | 18.2.0 |
| **Aplicación Móvil** | Dart | Flutter, Provider | 3.10+ |
| **Predictor ML** | Python | FastAPI, scikit-learn, pandas | 3.10+ |
| **Base de Datos** | PostgreSQL | Prisma ORM | 15 |
| **Cache** | Redis | - | 7 |

---

## 📁 Estructura del Proyecto

```
MyRuta/
│
├── 📄 README.md                          # Este archivo
├── 📄 PROJECT_SUMMARY.md                 # Resumen completo del proyecto
├── 📄 .gitignore                         # Patrones ignorados por Git
├── 📄 docker-compose.yml                 # Servicios PostgreSQL + Redis
│
├── 📦 backend/                           # API REST + WebSocket (Node.js/Express)
│   ├── 📄 package.json                   # Dependencias npm
│   ├── 📄 .env.example                   # Variables de entorno
│   ├── 📄 .gitignore
│   ├── 📄 README.md                      # Documentación backend
│   │
│   ├── 📂 src/
│   │   ├── 📄 index.js                   # Punto de entrada
│   │   ├── 📄 server.js                  # Configuración Express + Socket.io
│   │   │
│   │   ├── 📂 socket/
│   │   │   ├── 📄 socketConfig.js        # Configuración Socket.io
│   │   │   └── 📂 handlers/
│   │   │       ├── 📄 locationHandler.js # Manejo de GPS
│   │   │       └── 📄 connectionHandler.js # Conexiones
│   │   │
│   │   ├── 📂 routes/                    # Rutas API
│   │   │   ├── 📄 authRoutes.js          # Autenticación
│   │   │   ├── 📄 conductorRoutes.js     # Gestión de conductores
│   │   │   ├── 📄 clienteRoutes.js       # Endpoints de clientes
│   │   │   ├── 📄 adminRoutes.js         # Panel administrativo
│   │   │   └── 📄 rutaRoutes.js          # Gestión de rutas
│   │   │
│   │   ├── 📂 controllers/               # Lógica de controladores
│   │   │   ├── 📄 authController.js
│   │   │   ├── 📄 conductorController.js
│   │   │   ├── 📄 clienteController.js
│   │   │   ├── 📄 adminController.js
│   │   │   └── 📄 rutaController.js
│   │   │
│   │   ├── 📂 services/                  # Servicios de negocio
│   │   │   ├── 📄 authService.js         # Login, tokens JWT
│   │   │   ├── 📄 conductorService.js    # CRUD conductores
│   │   │   ├── 📄 clienteService.js      # Operaciones de clientes
│   │   │   ├── 📄 rutaService.js         # Rutas y paradas
│   │   │   ├── 📄 locationService.js     # Cálculos GPS, distancia
│   │   │   └── 📄 reporteService.js      # Analytics e integración ML
│   │   │
│   │   ├── 📂 middlewares/               # Middleware Express
│   │   │   ├── 📄 authMiddleware.js      # Verificación JWT
│   │   │   ├── 📄 roleMiddleware.js      # Control de roles
│   │   │   ├── 📄 errorHandler.js        # Manejo centralizado
│   │   │   └── 📄 validationMiddleware.js # Validación de entrada
│   │   │
│   │   ├── 📂 models/
│   │   │   └── 📄 prismaClient.js        # Singleton Prisma
│   │   │
│   │   ├── 📂 config/
│   │   │   ├── 📄 database.js            # Configuración BD
│   │   │   └── 📄 env.js                 # Variables de entorno
│   │   │
│   │   └── 📂 utils/
│   │       ├── 📄 logger.js              # Logging con colores
│   │       └── 📄 jwt.js                 # Operaciones con tokens
│   │
│   ├── 📂 prisma/
│   │   └── 📄 schema.prisma              # Esquema BD (9 modelos)
│   │
│   └── 📂 tests/
│       └── 📄 example.test.js            # Estructura de tests
│
├── 📦 web/                               # Frontend React/Vite
│   ├── 📄 package.json                   # Dependencias npm
│   ├── 📄 .env.example
│   ├── 📄 .gitignore
│   ├── 📄 README.md                      # Documentación web
│   ├── 📄 index.html                     # Punto de entrada HTML
│   ├── 📄 vite.config.js                 # Configuración Vite
│   ├── 📄 tailwind.config.js             # Configuración Tailwind
│   ├── 📄 postcss.config.js
│   │
│   └── 📂 src/
│       ├── 📄 main.jsx                   # Entrada React
│       ├── 📄 App.jsx                    # Router principal
│       │
│       ├── 📂 components/                # Componentes reutilizables
│       │   ├── 📂 Layout/
│       │   │   ├── 📄 Header.jsx
│       │   │   ├── 📄 Navbar.jsx
│       │   │   └── 📄 Footer.jsx
│       │   ├── 📂 Common/
│       │   │   ├── 📄 Button.jsx
│       │   │   ├── 📄 Card.jsx
│       │   │   └── 📄 LoadingSpinner.jsx
│       │   └── 📂 Maps/
│       │       └── 📄 LiveMap.jsx
│       │
│       ├── 📂 pages/                     # Páginas por rol
│       │   ├── 📂 Admin/
│       │   │   ├── 📄 Dashboard.jsx
│       │   │   ├── 📄 LiveMap.jsx
│       │   │   ├── 📄 Reportes.jsx
│       │   │   ├── 📄 GestionRutas.jsx
│       │   │   └── 📄 GestionConductores.jsx
│       │   ├── 📂 Cliente/
│       │   │   ├── 📄 Home.jsx
│       │   │   ├── 📄 ConsultaRutas.jsx
│       │   │   └── 📄 TiemposEstimados.jsx
│       │   └── 📂 Public/
│       │       ├── 📄 LoginPage.jsx
│       │       └── 📄 NotFoundPage.jsx
│       │
│       ├── 📂 hooks/                     # Custom hooks
│       │   ├── 📄 useAuth.js             # Estado autenticación
│       │   ├── 📄 useSocket.js           # Socket.io
│       │   └── 📄 useLocation.js         # Geolocalización
│       │
│       ├── 📂 contexts/                  # Contextos (state management)
│       │   ├── 📄 AuthContext.jsx        # Autenticación global
│       │   └── 📄 LocationContext.jsx    # Ubicaciones en tiempo real
│       │
│       ├── 📂 services/                  # Servicios API
│       │   ├── 📄 api.js                 # Axios + interceptores
│       │   ├── 📄 authService.js
│       │   ├── 📄 rutaService.js
│       │   └── 📄 socketService.js
│       │
│       ├── 📂 styles/
│       │   ├── 📄 globals.css            # Estilos Tailwind
│       │   └── 📄 index.css              # Animaciones
│       │
│       └── 📂 utils/
│           ├── 📄 helpers.js             # Funciones útiles
│           └── 📄 constants.js           # Constantes/endpoints
│
├── 📦 mobile/                            # App Flutter
│   ├── 📄 pubspec.yaml                   # Dependencias Flutter
│   ├── 📄 analysis_options.yaml          # Linter rules
│   ├── 📄 .gitignore
│   ├── 📄 README.md                      # Documentación móvil
│   │
│   └── 📂 lib/
│       ├── 📄 main.dart                  # Punto de entrada
│       │
│       ├── 📂 config/
│       │   ├── 📄 app_config.dart        # Variables de entorno
│       │   └── 📄 socket_config.dart     # Configuración Socket.io
│       │
│       ├── 📂 models/                    # Modelos de datos
│       │   ├── 📄 user_model.dart
│       │   ├── 📄 route_model.dart
│       │   └── 📄 location_model.dart
│       │
│       ├── 📂 services/                  # Servicios de API
│       │   ├── 📄 api_service.dart       # Cliente HTTP
│       │   ├── 📄 auth_service.dart      # Autenticación
│       │   ├── 📄 location_service.dart  # GPS y geolocalización
│       │   ├── 📄 socket_service.dart    # Socket.io
│       │   └── 📄 map_service.dart       # Helpers de mapas
│       │
│       ├── 📂 providers/                 # State management (Provider)
│       │   ├── 📄 auth_provider.dart     # Estado de autenticación
│       │   ├── 📄 location_provider.dart # Seguimiento de posición
│       │   └── 📄 route_provider.dart    # Gestión de rutas
│       │
│       ├── 📂 screens/                   # Pantallas de la app
│       │   ├── 📂 auth/
│       │   │   └── 📄 login_screen.dart
│       │   ├── 📂 conductor/
│       │   │   ├── 📄 home_conductor_screen.dart
│       │   │   ├── 📄 tracking_screen.dart
│       │   │   └── 📄 reports_screen.dart
│       │   ├── 📂 cliente/
│       │   │   ├── 📄 home_cliente_screen.dart
│       │   │   ├── 📄 route_search_screen.dart
│       │   │   └── 📄 route_details_screen.dart
│       │   └── 📂 common/
│       │       └── 📄 splash_screen.dart
│       │
│       ├── 📂 widgets/                   # Widgets reutilizables
│       │   ├── 📄 custom_app_bar.dart
│       │   ├── 📄 maps_widget.dart
│       │   ├── 📄 loading_widget.dart
│       │   └── 📄 custom_button.dart
│       │
│       └── 📂 utils/                     # Utilidades
│           ├── 📄 theme.dart             # Tema Material Design
│           ├── 📄 constants.dart         # Constantes de la app
│           ├── 📄 exceptions.dart        # Excepciones personalizadas
│           ├── 📄 extensions.dart        # Dart extensions
│           ├── 📄 helpers.dart           # Funciones auxiliares
│           └── 📄 logger.dart            # Sistema de logging
│
└── 📦 predictor/                         # Servicio ML (Python/FastAPI)
    ├── 📄 main.py                        # Punto de entrada FastAPI
    ├── 📄 requirements.txt                # Dependencias Python
    ├── 📄 .env.example
    ├── 📄 .gitignore
    ├── 📄 README.md                      # Documentación predictor
    │
    ├── 📂 app/
    │   ├── 📄 __init__.py
    │   │
    │   ├── 📂 api/                       # Rutas de la API
    │   │   ├── 📄 __init__.py
    │   │   ├── 📄 health.py              # Health checks
    │   │   ├── 📄 predictions.py         # Predicciones
    │   │   └── 📄 analytics.py           # Analytics
    │   │
    │   ├── 📂 config/                    # Configuración
    │   │   ├── 📄 __init__.py
    │   │   └── 📄 settings.py            # Pydantic settings
    │   │
    │   ├── 📂 models/                    # Esquemas Pydantic
    │   │   ├── 📄 __init__.py
    │   │   └── 📄 schemas.py             # Request/response models
    │   │
    │   ├── 📂 services/                  # Servicios de negocio
    │   │   ├── 📄 __init__.py
    │   │   └── 📄 prediction_service.py  # Lógica de predicción
    │   │
    │   └── 📂 utils/                     # Utilidades
    │       ├── 📄 __init__.py
    │       └── 📄 logger.py              # Logging
    │
    └── 📂 tests/
        ├── 📄 __init__.py
        └── 📄 test_prediction.py         # Suite de tests
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js 18+** (Backend y Frontend)
- **Flutter 3.10+** (Aplicación Móvil)
- **Python 3.10+** (Servicio Predictor)
- **PostgreSQL 15** (o Docker)
- **Redis 7** (o Docker)
- **Git**

### Instalación de Infraestructura (Docker)

```bash
# En la carpeta raíz del proyecto
docker-compose up -d

# Verificar servicios
docker-compose ps
```

Esto levantará:
- PostgreSQL en `localhost:5432`
- Redis en `localhost:6379`

---

## 🏃 Ejecución Local

### ⚡ Inicio Rápido (Recomendado)

Ejecuta los siguientes comandos en **terminales separadas**:

**Terminal 1 - Backend**:
```powershell
cd backend
npm install
node ".\src\index.js"
```

**Terminal 2 - Predictor**:
```powershell
cd predictor
py -m pip install -q -r requirements.txt
py ".\main.py"
```

**Terminal 3 - Frontend (Opcional)**:
```powershell
cd web
npm install
npm run dev
```

---

### 1️⃣ Backend Express.js (Puerto 3000)

#### Instalación
```powershell
cd backend
npm install
```

#### Ejecución
```powershell
# Opción 1: Ejecutar directamente
node ".\src\index.js"

# Opción 2: Con npm (requiere script configurado)
npm run dev
```

#### Verificación
```powershell
# Test de conectividad
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
```

**Endpoint**: `http://localhost:3000`  
**Logs esperados**: `[INFO] 🚀 MyRuta Backend running on port 3000`

---

### 2️⃣ Frontend Web (Puerto 5173)

#### Instalación
```powershell
cd web
npm install
```

#### Ejecución
```powershell
# Desarrollo con recarga en vivo (HMR)
npm run dev

# Build para producción
npm run build
```

#### Verificación
- Abre: `http://localhost:5173`
- Debe mostrar login de MyRuta

**Características**:
- Hot Module Replacement (cambios inmediatos)
- Vite para compilación rápida
- Tailwind CSS integrado

---

### 3️⃣ Servicio Predictor ML (Puerto 8001)

#### Instalación (Primera vez)

```powershell
cd predictor

# Verificar Python disponible
py --version  # Debe ser Python 3.10+

# Instalar dependencias
py -m pip install --upgrade pip -q
py -m pip install -q -r requirements.txt
```

#### Ejecución
```powershell
# Desde el directorio predictor
py ".\main.py"
```

#### Verificación
```powershell
# Test health check
Invoke-WebRequest -Uri "http://localhost:8001/api/health/" -UseBasicParsing | `
  Select-Object -ExpandProperty Content | ConvertFrom-Json | Format-Table
```

**Respuesta esperada**:
```
status   database model_loaded
------   -------- ------------
healthy     True         True
```

#### Acceso a APIs
- **Docs Interactivos**: http://localhost:8001/api/docs
- **Health Check**: http://localhost:8001/api/health/
- **Predicciones**: POST http://localhost:8001/api/predictions/predict

---

### 4️⃣ Aplicación Móvil Flutter (Opcional)

#### Requisitos
- Flutter 3.10+ instalado
- Android Studio o Xcode

#### Instalación
```powershell
cd mobile

# Obtener dependencias
flutter pub get
```

#### Ejecución
```powershell
# Ver dispositivos disponibles
flutter devices

# Ejecutar en emulador/dispositivo
flutter run

# Build APK (Android)
flutter build apk

# Build iOS
flutter build ios
```

---

## ✅ Verificación del Sistema Completo

Ejecuta este script para verificar que todo está corriendo:

```powershell
Write-Host "=== VERIFICACIÓN DE SERVICIOS MYRUTA ===" -ForegroundColor Cyan

# Test Backend
Write-Host "`n1. Backend (Puerto 3000)..."
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction Stop
    Write-Host "   [OK] Backend respondiendo" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Backend no accesible" -ForegroundColor Red
}

# Test Predictor
Write-Host "`n2. Predictor (Puerto 8001)..."
try {
    $predictor = Invoke-WebRequest -Uri "http://localhost:8001/api/health/" -UseBasicParsing -ErrorAction Stop
    $health = $predictor.Content | ConvertFrom-Json
    Write-Host "   [OK] Predictor: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Predictor no accesible" -ForegroundColor Red
}

# Test Frontend
Write-Host "`n3. Frontend (Puerto 5173)..."
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -ErrorAction Stop
    Write-Host "   [OK] Frontend respondiendo" -ForegroundColor Green
} catch {
    Write-Host "   [PENDIENTE] Frontend - ejecuta 'npm run dev' en web/" -ForegroundColor Yellow
}

Write-Host "`n=== RESUMEN ===" -ForegroundColor Cyan
Write-Host "Todos los servicios disponibles en:" -ForegroundColor Green
Write-Host "  Backend:   http://localhost:3000"
Write-Host "  Frontend:  http://localhost:5173"
Write-Host "  Predictor: http://localhost:8001/api/docs"
```

---

## 📚 Documentación de Componentes

Cada componente cuenta con documentación completa:

### Backend
📖 [Backend README](./backend/README.md)
- Estructura de rutas y servicios
- Esquema Prisma ORM
- Configuración Socket.io
- Autenticación JWT

### Frontend Web
📖 [Frontend README](./web/README.md)
- Estructura de componentes
- Routing y protecciones
- Integración Google Maps
- State management con Context API

### Aplicación Móvil
📖 [Mobile README](./mobile/README.md)
- Configuración Flutter
- Modelos y servicios
- Pantallas por rol
- GPS y Socket.io

### Servicio Predictor
📖 [Predictor README](./predictor/README.md)
- Endpoints de predicción
- Machine Learning
- Analytics y métricas
- Validación de entrada

---

## 🔌 Integración y APIs

### Comunicación Backend ↔ Frontend/Mobile

**REST API Base**: `http://localhost:3000/api`

Endpoints principales:
```
POST   /auth/login              # Autenticación
POST   /auth/register           # Registro
GET    /rutas                   # Listar rutas
GET    /rutas/:id               # Detalle de ruta
GET    /conductores/:id/ubicacion # GPS conductor
POST   /reportes                # Reportar incidente
```

### WebSocket (Socket.io)

**Conexión**: `http://localhost:3000`

Eventos principales:
```
location:update      # GPS del conductor
route:started        # Ruta iniciada
route:completed      # Ruta completada
incident:reported    # Incidente reportado
conductor:status     # Estados del conductor
```

### Machine Learning (Predictor)

**Base**: `http://localhost:8001/api`

```
POST   /predictions/predict     # Predicción única
POST   /predictions/batch       # Predicciones en lote
GET    /analytics/metrics       # Métricas del modelo
GET    /health/                 # Estado del servicio
```

---

## 👥 Roles y Control de Acceso

Tres roles principales con permisos diferenciados:

### 🔴 ADMIN
- Acceso a dashboard administrativo
- Gestión de conductores y rutas
- Visualización de reportes
- Análisis de demoras
- Control de usuarios

**Rutas Accesibles**:
- `/admin/dashboard`
- `/admin/conductores`
- `/admin/rutas`
- `/admin/reportes`

### 🟡 CONDUCTOR
- Iniciar/finalizar ruta
- Enviar ubicación GPS
- Reportar incidentes
- Ver próximas paradas

**Pantallas Móviles**:
- HomeCondutor (estado actual)
- TrackingScreen (mapa)
- ReportsScreen (incidentes)

### 🟢 CLIENTE
- Buscar rutas disponibles
- Ver horarios y ETA
- Recibir notificaciones
- Contactar conductor

**Rutas Web**:
- `/cliente/rutas`
- `/cliente/horarios`
- `/cliente/mapa`

---

## 🔐 Autenticación y Seguridad

- **JWT Tokens**: Autenticación stateless
- **Refresh Tokens**: Renovación de sesiones
- **Secure Storage**: Token almacenado de forma segura en móvil
- **CORS Configuration**: Orígenes permitidos configurables
- **Input Validation**: Validación Pydantic en todas las APIs

---

## 🧪 Testing

Cada componente incluye estructura para tests:

```bash
# Backend
cd backend && npm test

# Frontend
cd web && npm test

# Flutter
cd mobile && flutter test

# Predictor
cd predictor && pytest
```

---

## 📊 Base de Datos

**Modelos Prisma** (9 modelos):
- `User` (usuario base)
- `Conductor` (conductores)
- `Cliente` (pasajeros)
- `Admin` (administradores)
- `Ruta` (rutas disponibles)
- `Parada` (paradas de ruta)
- `Location` (historial de GPS)
- `Trip` (viajes realizados)
- `Incident` (reportes de incidentes)

Ver esquema completo en: `backend/prisma/schema.prisma`

---

## 🌍 Variables de Entorno

Cada componente requiere configuración específica:

```bash
# Backend (.env)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your_secret
PORT=3000

# Frontend (.env.local)
VITE_API_URL=http://localhost:3000

# Mobile (lib/config/app_config.dart)
API_BASE_URL = 'http://localhost:3000/api'
SOCKET_URL = 'http://localhost:3000'

# Predictor (.env)
DATABASE_URL=postgresql://...
BACKEND_URL=http://localhost:3000
PORT=8001
```

---

## 📈 Roadmap

### Fase 1: Scaffolding ✅
- [x] Estructura de carpetas
- [x] Archivos de configuración
- [x] Modelos y esquemas
- [x] Rutas y endpoints base

### Fase 2: Implementación
- [ ] Lógica de negocio completa
- [ ] Autenticación funcional
- [ ] Integración base de datos
- [ ] Socket.io en tiempo real

### Fase 3: Frontend
- [ ] Componentes React finalizados
- [ ] Vistas completas por rol
- [ ] Mapas interactivos
- [ ] Notificaciones en tiempo real

### Fase 4: Mobile
- [ ] GPS y tracking automático
- [ ] Interfaz pulida
- [ ] Pruebas en dispositivos
- [ ] Publicación en stores

### Fase 5: ML
- [ ] Modelo de predicción entrenado
- [ ] Endpoint de predicciones
- [ ] Analytics dashboard
- [ ] Explicabilidad de modelos

---

## 🐛 Troubleshooting

### Puerto ya está en uso
```bash
# Cambiar en .env
PORT=3001  # o el puerto que prefieras
```

### Error de conexión a BD
```bash
# Verificar docker-compose
docker-compose logs postgres

# O instalar PostgreSQL localmente
```

### Dependencias desactualizadas
```bash
# Backend
cd backend && npm update

# Frontend
cd web && npm update

# Predictor
cd predictor && pip install --upgrade -r requirements.txt
```

---

## 📞 Soporte

Para consultas o problemas:

1. Revisa el `README.md` de cada componente
2. Consulta `PROJECT_SUMMARY.md` para arquitectura completa
3. Revisa los comentarios en el código fuente
4. Abre un issue en el repositorio

---

## 📝 Licencia

Propietario - Equipo MyRuta

---

**Última Actualización**: Marzo 2026  
**Versión**: 1.0.0

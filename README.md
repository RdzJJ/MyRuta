# 🚌 MyRuta

**Sistema integral de monitoreo en tiempo real para transporte público urbano**

Plataforma completa que permite rastrear conductores mediante GPS, predecir demoras automáticamente, y consultar horarios actualizados en vivo. Incluye dashboard administrativo, app para conductores, interfaz para pasajeros, y sistema de inteligencia artificial para optimizar rutas.

**Versión**: 1.0.0  
**Estado**: Scaffolding Completo ✅  
**Última actualización**: Mayo 2026

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Servicios](#servicios)
- [Roles y Permisos](#roles-y-permisos)
- [Inicio Rápido](#inicio-rápido)
- [Estructura](#estructura)
- [APIs Principales](#apis-principales)

---

## ✨ Características

### 🗺️ Monitoreo en Tiempo Real
- Rastreo GPS de conductores en vivo
- Mapa interactivo con ubicación de buses
- Actualización de posición cada 5-10 segundos vía WebSocket

### 🤖 Predicción de Demoras (IA)
- Modelo machine learning para estimar tiempos de llegada
- Análisis de patrones históricos de tráfico
- Alertas automáticas de demoras significativas

### 👥 Múltiples Perfiles
- **Administradores**: Panel de control completo
- **Conductores**: Tracking y reportes de incidentes
- **Pasajeros**: Búsqueda de rutas y ETAs

### 📊 Reportes e Incidentes
- Sistema de reportes de problemas
- Historial de viajes
- Análisis de rutas y conductores
- Métricas de desempeño

### 🔔 Notificaciones
- Alertas de demoras
- Cambios de ruta
- Mensajes a pasajeros

---

## 🛠️ Tecnologías

| Componente | Stack | Detalles |
|-----------|-------|---------|
| **Backend** | Node.js 18+ | Express.js, Socket.io, Prisma ORM |
| **Frontend** | React 18.2.0 | Vite, Tailwind CSS, React Router |
| **Mobile** | Flutter 3.10+ | Provider (state), Geolocator (GPS) |
| **IA/ML** | Python 3.10+ | FastAPI, scikit-learn, pandas |
| **Base de Datos** | Firebase | Firestore, Authentication, RTDB |
| **Real-time** | WebSocket | Socket.io para eventos en vivo |
| **Caché** | Redis 7 | Sesiones y datos temporales |
| **Cache External** | Google Maps | Maps API para visualización |

---

## 🗄️ Base de Datos (Firebase)

### Firestore Collections
```
users/                  # Usuarios (auth + perfil)
conductores/           # Conductores activos
rutas/                 # Rutas disponibles
paradas/               # Paradas por ruta
ubicaciones/           # Historial GPS
viajes/                # Viajes completados
incidentes/            # Reportes de problemas
predicciones/          # Histórico de predicciones
```

### Características Firebase
- **Authentication**: Email/contraseña con JWT
- **Firestore**: Base de datos NoSQL tiempo real
- **Realtime Database**: Sincronización instantánea
- **Security Rules**: Control de acceso por rol

---

## 🔧 Servicios Activos

### Backend Services (Node.js)

| Servicio | Responsabilidad |
|----------|----------------|
| **authService.js** | Registro, login, renovación JWT, validación de tokens |
| **conductorService.js** | CRUD conductores, asignación de rutas, estado online |
| **locationService.js** | Tracking GPS, cálculo de distancias, posición actual |
| **rutaService.js** | Gestión de rutas, paradas, horarios, disponibilidad |
| **reporteService.js** | Creación de reportes, integración con predictor ML |

### Predictor ML Service (Python FastAPI)

| Servicio | Responsabilidad |
|----------|----------------|
| **prediction_service.py** | Predicción de demoras, análisis de datos históricos |
| **health_check** | Validación de estado del servicio |
| **analytics** | Métricas y reportes del modelo |

---

## 👥 Roles y Permisos

### 🔴 ADMIN
**Permisos**: Control total del sistema
- Ver dashboard administrativo completo
- Gestionar conductores (crear, editar, desactivar)
- Gestionar rutas (crear, modificar, asignar)
- Visualizar reportes y analytics
- Acceder a predicciones del sistema
- Crear alertas y notificaciones

**Acceso**: Web dashboard

### 🟡 CONDUCTOR
**Permisos**: Gestión de su ruta asignada
- Iniciar/finalizar ruta
- Enviar ubicación GPS en tiempo real
- Ver próximas paradas
- Reportar incidentes/retrasos
- Ver estado actual de su viaje

**Acceso**: Aplicación móvil

### 🟢 CLIENTE/PASAJERO
**Permisos**: Información de transporte
- Buscar rutas disponibles
- Ver horarios y paradas
- Consultar ETA (tiempo estimado de llegada)
- Recibir notificaciones de cambios
- Ver ubicación de bus en tiempo real

**Acceso**: Web pública

---

## 📁 Estructura del Proyecto

```
MyRuta/
├── backend/              # API Express + Socket.io (Node.js)
├── web/                  # Dashboard React
├── mobile/               # App Flutter
├── predictor/            # Servicio ML FastAPI (Python)
├── README.md             # Este archivo
└── docker-compose.yml    # Infraestructura (opcional)
```

---

## 🚀 Inicio Rápido

### Requisitos Previos
- **Node.js 18+** (Backend y Web)
- **Python 3.10+** (Predictor)
- **Flutter 3.10+** (Mobile)
- **Firebase**: Cuenta con credenciales configuradas

### Backend (Puerto 3000)
```bash
cd backend
npm install
node src/index.js
```

**Logs**: `🚀 Backend running on port 3000`

### Frontend Web (Puerto 5173)
```bash
cd web
npm install
npm run dev
```

**Logs**: `Local: http://localhost:5173`

### Predictor ML (Puerto 8001)
```bash
cd predictor
pip install -r requirements.txt
python main.py
```

**Acceso Swagger**: http://localhost:8001/api/docs

### Mobile App
```bash
cd mobile
flutter pub get
flutter run
```

---

## 🔌 APIs Principales

### REST API Base: `http://localhost:3000/api`

#### Autenticación
```
POST   /auth/register              # Crear cuenta
POST   /auth/login                 # Iniciar sesión
POST   /auth/refresh               # Renovar token
```

#### Rutas
```
GET    /rutas                      # Listar todas las rutas
GET    /rutas/:id                  # Detalle de una ruta
POST   /rutas                      # Crear ruta (admin)
PUT    /rutas/:id                  # Actualizar ruta (admin)
```

#### Conductores
```
GET    /conductores                # Listar conductores (admin)
GET    /conductores/:id            # Detalle conductor
POST   /conductores                # Registrar conductor (admin)
GET    /conductores/:id/ubicacion  # Ubicación actual conductor
```

#### Reportes
```
GET    /reportes                   # Listar incidentes
POST   /reportes                   # Crear reporte de incidente
GET    /reportes/:id               # Detalle de reporte
```

#### Predicciones
```
POST   /predicciones               # Solicitar predicción de demora
GET    /predicciones/historial     # Histórico de predicciones
```

### WebSocket Events (Socket.io)

**Servidor → Cliente**:
```
location:update          # Nueva ubicación de conductor
route:started            # Ruta iniciada
route:completed          # Ruta completada
incident:reported        # Nuevo incidente reportado
conductor:online         # Conductor conectado
conductor:offline        # Conductor desconectado
```

**Cliente → Servidor**:
```
location:send            # Enviar ubicación GPS
incident:create          # Crear incidente
message:send             # Enviar mensaje
```

### Predictor ML API: `http://localhost:8001/api`

```
POST   /predictions/predict        # Predicción única
POST   /predictions/batch          # Predicciones en lote
GET    /analytics/metrics          # Métricas del modelo
GET    /health/                    # Estado del servicio
```

---

## 🔐 Autenticación

- **JWT Tokens**: Acceso a APIs REST
- **Expiry**: 24 horas (renovable)
- **Refresh Tokens**: Para sesiones prolongadas
- **Firebase Auth**: Respaldo de seguridad

**Header**:
```
Authorization: Bearer <token_jwt>
```

---

## 📊 Estructura de Datos

### Usuario Base
```json
{
  "id": "uid_firebase",
  "email": "user@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "CLIENTE|CONDUCTOR|ADMIN",
  "createdAt": "2026-05-19T10:30:00Z"
}
```

### Ruta
```json
{
  "id": "ruta_001",
  "nombre": "Línea 1",
  "codigo": "L1",
  "origen": "Terminal Central",
  "destino": "Aeropuerto",
  "paradas": ["Parada 1", "Parada 2"],
  "activa": true
}
```

### Ubicación (GPS)
```json
{
  "id": "loc_001",
  "conductorId": "cond_001",
  "latitud": 10.3851,
  "longitud": -75.4794,
  "velocidad": 45.2,
  "timestamp": "2026-05-19T14:25:00Z"
}
```

---

## 📚 Documentación Detallada

Cada componente tiene su propio README:

- 📖 [Backend](./backend/README.md)
- 📖 [Frontend](./web/README.md)
- 📖 [Mobile](./mobile/README.md)
- 📖 [Predictor](./predictor/README.md)

---

## 🧪 Testing

```bash
# Backend
cd backend && npm test

# Frontend
cd web && npm test

# Predictor
cd predictor && pytest
```

---

## 🌍 Configuración de Entorno

Cada componente requiere un archivo `.env`:

```bash
# Backend (.env)
DATABASE_URL=firebase://...
JWT_SECRET=tu_secreto_jwt
PORT=3000
SOCKET_PORT=3000
PREDICTOR_SERVICE_URL=http://localhost:8001

# Frontend (.env.local)
VITE_API_URL=http://localhost:3000

# Predictor (.env)
BACKEND_URL=http://localhost:3000
PORT=8001
```

---

## 🐛 Solución de Problemas

### Puerto ya en uso
```bash
# Cambiar en .env
PORT=3001
```

### Error de conexión Firebase
```bash
# Verificar firebase-service-account.json existe
ls backend/firebase-service-account.json

# Validar credenciales
cat backend/.env
```

### Predictor no responde
```bash
# Verificar que está corriendo
curl http://localhost:8001/api/health/

# Revisar logs
python predictor/main.py
```

---

## 📈 Roadmap

| Fase | Estado | Tareas |
|------|--------|--------|
| **1: Setup** | ✅ Completo | Estructura, config, scaffolding |
| **2: Core** | 🔄 En Progreso | APIs, autenticación, BD |
| **3: Features** | ⏳ Pendiente | Frontend completo, Mobile, ML |
| **4: Deploy** | ⏳ Pendiente | Testing, Docker, producción |

---

## 📞 Contacto y Soporte

Para preguntas o issues:
1. Revisa el README de cada carpeta
2. Consulta `PROJECT_SUMMARY.md`
3. Abre un issue en el repositorio

---

## 📝 Licencia

**Propietario** - Equipo MyRuta

---

**Última Actualización**: Mayo 2026 | **Versión**: 1.0.0
python main.py
```

### Mobile
```bash
cd mobile
flutter pub get
flutter run
```

---

## 📁 Carpetas

| Carpeta | Contenido |
|---------|-----------|
| **backend/** | API Express + Socket.io |
| **web/** | Dashboard React |
| **mobile/** | App Flutter |
| **predictor/** | Servicio IA Python |

---

## 📚 Más Información

Consulta el `README.md` dentro de cada carpeta para detalles específicos.

---

**Última Actualización**: Mayo 2026

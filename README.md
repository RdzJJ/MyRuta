# 🚌 MyRuta

Sistema de monitoreo en tiempo real para transporte público urbano. Seguimiento GPS de conductores, predicción de demoras con IA, y consulta de tiempos estimados.

**Versión**: 1.0.0  
**Estado**: Listo para desarrollo ✅

## 📱 ¿Qué incluye?

- **API Backend**: Servidor con actualizaciones en tiempo real
- **Dashboard Web**: Panel administrativo de rutas y conductores  
- **Aplicación Móvil**: App para conductores y pasajeros
- **Predictor IA**: Sistema de predicción de demoras

## 🛠️ Tecnologías

| Parte | Stack |
|-------|-------|
| **Servidor** | Node.js + Express |
| **Web** | React + Tailwind CSS |
| **Mobile** | Flutter |
| **IA** | Python + scikit-learn |
| **Base de Datos** | Firebase (Firestore + Auth) |
| **Comunicación Real-time** | WebSocket |

---

## 🗄️ Base de Datos

**Firebase** como servicio integral:
- **Firestore**: Base de datos NoSQL en tiempo real
- **Authentication**: Autenticación con email/contraseña
- **Realtime Database**: Para sincronización de eventos
- **Colecciones**: usuarios, conductores, rutas, ubicaciones, incidentes

---

## 🔧 Servicios Activos

### Backend Services
| Servicio | Descripción |
|----------|-----------|
| **authService** | Registro, login, gestión de tokens JWT |
| **conductorService** | CRUD de conductores, asignación de rutas |
| **locationService** | Tracking GPS, cálculo de distancias |
| **rutaService** | Gestión de rutas, paradas, horarios |
| **reporteService** | Incidentes, integración con predictor |

### Predictor Service
| Servicio | Descripción |
|----------|-----------|
| **prediction_service** | Predicción de demoras con machine learning |

---

---

## 🚀 Inicio Rápido

### Requisitos
- **Node.js 18+**, **Python 3.10+**, **Flutter 3.10+**

### Backend (Puerto 3000)
```bash
cd backend
npm install
node src/index.js
```

### Frontend (Puerto 5173)
```bash
cd web
npm install
npm run dev
```

### Predictor ML (Puerto 8001)
```bash
cd predictor
pip install -r requirements.txt
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

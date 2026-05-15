# 🎯 MyRuta - Acceso y Credenciales

## ✅ Usuarios Creados Exitosamente

Se han creado 3 usuarios en la base de datos PostgreSQL con roles diferentes:

### 👨‍💼 Administrador
```
Email:    admin@myruta.com
Password: Admin@2026
Rol:      ADMIN
```
**Permisos**: Acceso total a dashboard, gestión de rutas, conductores y reportes.

### 👤 Cliente/Pasajero
```
Email:    cliente@myruta.com
Password: Cliente@2026
Rol:      CLIENTE
```
**Permisos**: Consultar rutas, ver tiempos estimados, marcar favoritos.

### 🚌 Conductor
```
Email:    conductor@myruta.com
Password: Conductor@2026
Rol:      CONDUCTOR
```
**Permisos**: Rastreo GPS, reportes de ruta, actualización de estado.

---

## 🔐 Sistema de Validación de Roles

### Estado: ✅ IMPLEMENTADO

El middleware de roles ya está creado y funcional en:
**`backend/src/middlewares/roleMiddleware.js`**

**Características:**
- ✅ Verificación de autenticación JWT
- ✅ Validación de rol de usuario
- ✅ Soporte para múltiples roles por endpoint
- ✅ Logging de intentos de acceso no autorizado
- ✅ Respuestas HTTP estándar (401 no autenticado, 403 sin permisos)

### Cómo Usar en Rutas

```javascript
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

// Solo ADMIN puede acceder
app.get('/admin/dashboard', authMiddleware, roleMiddleware('ADMIN'), adminController.getDashboard);

// ADMIN o CONDUCTOR pueden acceder
app.post('/rutas/update', authMiddleware, roleMiddleware('ADMIN', 'CONDUCTOR'), rutaController.update);

// Cualquier usuario autenticado puede acceder
app.get('/profile', authMiddleware, userController.getProfile);
```

---

## 📊 Base de Datos

### Datos Creados (Seed)

- **Rutas**: 1 ruta principal ("Ruta Centro - Norte")
- **Paradas**: 6 paradas de bus con coordenadas GPS
- **Usuarios**: 3 usuarios (Admin, Cliente, Conductor)
- **Conductor**: 1 conductor asignado a la ruta principal

### Tablas PostgreSQL

```
✓ users          - Usuarios base con roles
✓ admins         - Relación de administradores
✓ clientes       - Perfil de clientes/pasajeros
✓ conductores    - Perfil de conductores
✓ rutas          - Rutas de transporte
✓ paradas        - Paradas de bus
✓ locations      - Rastreo GPS en tiempo real
✓ trips          - Historial de viajes
✓ incidents      - Reportes de incidentes
```

---

## 🚀 Próximos Pasos

### 1. Implementar Autenticación (IMPORTANTE)
El archivo `backend/src/services/authService.js` actualmente no tiene implementación.

**Tareas:**
- [ ] Implementar `registerUser()` - crear nuevo usuario con validación
- [ ] Implementar `loginUser()` - autenticación y generación de JWT
- [ ] Implementar `validateToken()` - verificar JWT válido
- [ ] Implementar `refreshToken()` - renovar tokens expirados

### 2. Implementar Controladores
`backend/src/controllers/authController.js` también está vacío.

**Tareas:**
- [ ] Implementar `/auth/register` - registrar nuevo usuario
- [ ] Implementar `/auth/login` - login y obtener JWT
- [ ] Implementar `/auth/refresh` - renovar token
- [ ] Implementar `/auth/logout` - limpiar sesión

### 3. Proteger Rutas
Agregar autenticación a todas las rutas:
```javascript
// Agregar authMiddleware + roleMiddleware según protección necesaria
app.use('/api/admin', authMiddleware, roleMiddleware('ADMIN'), adminRoutes);
app.use('/api/conductor', authMiddleware, roleMiddleware('CONDUCTOR'), conductorRoutes);
app.use('/api/cliente', authMiddleware, roleMiddleware('CLIENTE'), clienteRoutes);
```

---

## 🧪 Pruebas

### Test de Rol Middleware

```bash
# Verificar que el middleware está funcionando
cd backend
npm test

# O ejecutar pruebas específicas
npm run test -- middleware
```

### Endpoints de Prueba (cuando auth esté implementada)

```bash
# Login
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "admin@myruta.com",
  "password": "Admin@2026"
}

# Respuesta esperada
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@myruta.com",
    "role": "ADMIN"
  }
}
```

---

## 📁 Archivos Clave

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `backend/prisma/schema.prisma` | Definición BD | ✅ Completo |
| `backend/prisma/seed.js` | Script de datos iniciales | ✅ Ejecutado |
| `backend/src/middlewares/roleMiddleware.js` | Validación de roles | ✅ Implementado |
| `backend/src/services/authService.js` | Lógica autenticación | ⏳ Pendiente |
| `backend/src/controllers/authController.js` | Endpoints auth | ⏳ Pendiente |
| `backend/.env` | Configuración | ✅ Configurado |

---

## 🔑 Variables de Seguridad

**Actualizar en producción:**

```env
JWT_SECRET=tu_clave_muy_segura_y_larga_aqui
JWT_EXPIRES_IN=24h (en producción)
NODE_ENV=production
```

---

✅ **Base lista para implementar autenticación y autorización**

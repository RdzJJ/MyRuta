# Actualización - Pantalla de Perfil y Login de Conductor

## Cambios Realizados

### 1. **Pantalla de Perfil Mejorada** (`lib/screens/cliente/pantalla_perfil.dart`)

#### Nuevas Funcionalidades:

**Editar Perfil:**
- Campo de nombre
- Campo de correo electrónico
- Selector de género (Masculino, Femenino, Otro, No especificado)
- Validación y guardado de cambios
- Confirmación visual con SnackBar

**Configuración:**
- Submenu con opciones básicas:
  - **Notificaciones**: Acceso a configuración de notificaciones (viajes, mensajes, promociones)
  - **Idioma**: Selector de idioma (predeterminado: Español)
  - **Privacidad**: Control de permisos
  - **Versión de la app**: Información de versión (v1.0.0)

**Ayuda:**
- Mensaje de bienvenida personalizado
- Información de contacto: `myrutahelp@gmail.com`
- Botón para contactar por correo
- Abre automáticamente el cliente de correo del dispositivo

**Cerrar Sesión:**
- Confirmación de seguridad antes de cerrar sesión
- Navega a `/login` para conductores
- Limpia el stack de navegación

### 2. **Pantalla de Login para Conductores** (NUEVA)
Archivo: `lib/screens/conductor/pantalla_login_conductor.dart`

#### Características:
- ✅ Diseño moderno con gradiente azul
- ✅ Campos de correo y contraseña
- ✅ Visibilidad de contraseña
- ✅ Validación de campos
- ✅ Validación de correo electrónico
- ✅ Loading indicator durante el login
- ✅ Recuperación de contraseña
- ✅ Enlace a registro de conductor
- ✅ Información de contacto (myrutahelp@gmail.com)

### 3. **Configuración de Rutas** (NUEVA)
Archivo: `lib/config/routes.dart`

Define todas las rutas de la aplicación:
- `/login` - Login de conductor
- `/home_cliente` - Pantalla principal del cliente
- `/perfil_cliente` - Perfil del cliente
- `/explorar_rutas` - Exploración de rutas
- `/viaje_activo` - Viaje en progreso
- `/llegada_en_vivo` - Monitoreo de llegada

### 4. **Dependencias Agregadas**
En `pubspec.yaml`:
```yaml
url_launcher: ^6.1.0
```

## Lógica de Navegación por Rol

### Para Clientes (Usuarios):
1. Inician directamente en la app (`/home_cliente`)
2. Acceden a su perfil desde el menú
3. Pueden editar su información personal
4. Acceso a configuración y ayuda
5. Pueden cerrar sesión desde el perfil

### Para Conductores:
1. Ven la pantalla de login (`/login`)
2. Deben ingresar credenciales
3. Si olvidan contraseña, pueden recuperarla
4. Pueden registrarse si no tienen cuenta
5. Después de iniciar sesión, acceden al home del conductor

## Cómo Implementar en main.dart

```dart
import 'package:flutter/material.dart';
import 'config/routes.dart';
import 'config/theme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Aquí determinarías el rol del usuario
    // Basado en SharedPreferences o tu sistema de autenticación
    
    const userRole = 'cliente'; // o 'conductor'
    
    return MaterialApp(
      title: 'MyRuta',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
        ),
      ),
      onGenerateRoute: AppRouter.generateRoute,
      initialRoute: userRole == 'cliente' ? '/home_cliente' : '/login',
      debugShowCheckedModeBanner: false,
    );
  }
}
```

## Notas Importantes

1. **URL Launcher**: La función de enviar correo requiere el paquete `url_launcher`. Asegúrate de ejecutar:
   ```bash
   flutter pub get
   ```

2. **Validación Backend**: Las funciones de login y recuperación de contraseña actualmente simulan llamadas a API. Necesitas conectarlas a tu backend en `backend/src/routes/authRoutes.js`

3. **SharedPreferences**: Para persistir datos del usuario, considera usar:
   ```dart
   import 'package:shared_preferences/shared_preferences.dart';
   ```

4. **Foto de Perfil**: Actualmente muestra un icono. Para agregar carga de fotos, puedes usar:
   ```dart
   image_picker: ^1.0.0
   ```

5. **Recuperación de Contraseña**: Conecta a tu endpoint: `POST /api/auth/forgot-password`

## Testing de Funcionalidades

### Probar Editar Perfil:
1. Abre la pantalla de perfil
2. Haz clic en "Editar Perfil"
3. Modifica nombre, correo y género
4. Haz clic en "Guardar"
5. Verifica que los cambios aparezcan en la pantalla

### Probar Configuración:
1. Haz clic en "Configuración"
2. Accede a "Notificaciones"
3. Verifica que los toggles funcionen

### Probar Ayuda:
1. Haz clic en "Ayuda"
2. Haz clic en "Contactar"
3. Se debe abrir el cliente de correo predeterminado

### Probar Cerrar Sesión:
1. Haz clic en "Cerrar Sesión"
2. Confirma la acción
3. Se debe navegar a `/login`

## Próximos Pasos Sugeridos

1. Integrar con tu backend para autenticación real
2. Agregar carga de fotos de perfil
3. Implementar recuperación de contraseña real
4. Agregar más opciones en configuración
5. Implementar notificaciones push
6. Agregar tema oscuro/claro en configuración

/// Constantes globales de MyRuta

class AppConstants {
  // API
  static const String apiBaseUrl = 'http://localhost:3000/api';
  static const String socketBaseUrl = 'http://localhost:3000';

  // Timeouts
  static const int apiTimeout = 30; // segundos
  static const int socketTimeout = 30; // segundos

  // Validación
  static const int passwordMinLength = 6;
  static const int nameMinLength = 2;

  // Mapas
  static const double mapZoomLevel = 15;
  static const double mapInitialLat = 40.7128;
  static const double mapInitialLng = -74.0060;

  // Animaciones
  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration shortAnimationDuration = Duration(milliseconds: 150);

  // Storage keys
  static const String tokenKey = 'access_token';
  static const String userKey = 'user_data';
  static const String lastRouteKey = 'last_route';

  // Rutas
  static const int buscarRutasPageSize = 10;
  static const int historialRutasPageSize = 20;
}

/// Mensajes de la aplicación
class AppMessages {
  // Errores
  static const String errorNetwork = 'Error de conexión. Intenta más tarde.';
  static const String errorServerError = 'Error del servidor. Intenta más tarde.';
  static const String errorUnauthorized = 'Tu sesión ha expirado. Inicia sesión nuevamente.';
  static const String errorValidation = 'Por favor revisa tus datos.';

  // Auth
  static const String loginRequired = 'Debes iniciar sesión primero.';
  static const String passwordMismatch = 'Las contraseñas no coinciden.';
  static const String invalidEmail = 'Email inválido.';

  // Rutas
  static const String noRutasAvailable = 'No hay rutas disponibles en este momento.';
  static const String loadingRutas = 'Cargando rutas...';

  // Estados
  static const String enLivoIndicator = 'EN VIVO';
  static const String rutaActiva = 'Ruta Activa';
  static const String viajeActivo = 'Viaje Activo';

  // Botones
  static const String iniciar = 'Iniciar';
  static const String finalizar = 'Finalizar';
  static const String notificarme = 'NOTIFICARME';
  static const String buscar = 'Buscar';
  static const String aceptar = 'Aceptar';
}

/// Duraciones personalizadas
class AppDurations {
  static const Duration shortDuration = Duration(seconds: 1);
  static const Duration mediumDuration = Duration(seconds: 2);
  static const Duration longDuration = Duration(seconds: 5);

  static const Duration updateLocationInterval = Duration(seconds: 5);
  static const Duration updateRouteStatusInterval = Duration(seconds: 10);
}

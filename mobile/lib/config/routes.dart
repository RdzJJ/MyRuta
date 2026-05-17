import 'package:flutter/material.dart';
import '../screens/cliente/pantalla_perfil.dart';
import '../screens/cliente/pantalla_inicio.dart';
import '../screens/cliente/pantalla_explorar_rutas.dart';
import '../screens/cliente/pantalla_viaje_activo.dart';
import '../screens/cliente/pantalla_llegada_en_vivo.dart';
import '../screens/conductor/pantalla_login_conductor.dart';

class AppRouter {
  static const String splash = '/';
  static const String loginConductor = '/login';
  static const String registroConductor = '/registro_conductor';
  static const String homeCliente = '/home_cliente';
  static const String homeConductor = '/home_conductor';
  static const String perfilCliente = '/perfil_cliente';
  static const String explorarRutas = '/explorar_rutas';
  static const String viajeActivo = '/viaje_activo';
  static const String llegadaEnVivo = '/llegada_en_vivo';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case loginConductor:
        return MaterialPageRoute(
          builder: (_) => const PantallaLoginConductor(),
        );
      
      case homeCliente:
        return MaterialPageRoute(
          builder: (_) => const PantallaInicio(),
        );
      
      case perfilCliente:
        return MaterialPageRoute(
          builder: (_) => const PantallaPerfil(),
        );
      
      case explorarRutas:
        return MaterialPageRoute(
          builder: (_) => const PantallaExplorarRutas(),
        );
      
      case viajeActivo:
        return MaterialPageRoute(
          builder: (_) => const PantallaViajeActivo(),
        );
      
      case llegadaEnVivo:
        return MaterialPageRoute(
          builder: (_) => const PantallaLlegadaEnVivo(),
        );

      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            appBar: AppBar(
              title: const Text('Error'),
            ),
            body: const Center(
              child: Text('Ruta no encontrada'),
            ),
          ),
        );
    }
  }
}

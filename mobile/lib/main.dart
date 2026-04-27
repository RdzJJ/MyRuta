import 'package:flutter/material.dart';
import 'config/theme.dart';
import 'config/constants.dart';
import 'screens/cliente/pantalla_inicio.dart';
import 'screens/cliente/pantalla_explorar_rutas.dart';
import 'screens/cliente/pantalla_viaje_activo.dart';
import 'screens/cliente/pantalla_llegada_en_vivo.dart';

void main() {
  runApp(const MyRutaApp());
}

class MyRutaApp extends StatelessWidget {
  const MyRutaApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MyRuta',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const PantallaNavegacion(),
    );
  }
}

/// Pantalla de navegación principal con BottomNavigationBar
class PantallaNavegacion extends StatefulWidget {
  const PantallaNavegacion({Key? key}) : super(key: key);

  @override
  State<PantallaNavegacion> createState() => _PantallaNavegacionState();
}

class _PantallaNavegacionState extends State<PantallaNavegacion> {
  int _indiceSeleccionado = 0;
  bool _viajeActivo = false;

  late final List<Widget> _pantallas = [
    const PantallaInicio(),
    const PantallaExplorarRutas(),
    if (_viajeActivo) const PantallaViajeActivo(),
    const PantallaLlegadaEnVivo(),
  ];

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (_indiceSeleccionado != 0) {
          setState(() => _indiceSeleccionado = 0);
          return false;
        }
        return true;
      },
      child: Scaffold(
        body: IndexedStack(
          index: _indiceSeleccionado,
          children: _pantallas,
        ),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _indiceSeleccionado,
          onTap: _onTabTapped,
          items: [
            BottomNavigationBarItem(
              icon: const Icon(Icons.home),
              activeIcon: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.home),
              ),
              label: 'Inicio',
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.map),
              activeIcon: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.map),
              ),
              label: 'Rutas',
            ),
            if (_viajeActivo)
              BottomNavigationBarItem(
                icon: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.2),
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.primary, width: 2),
                  ),
                  child: const Icon(Icons.directions_bus, size: 20),
                ),
                label: 'Viaje',
              ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.location_on_outlined),
              activeIcon: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.location_on),
              ),
              label: 'Llegada',
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.person),
              activeIcon: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.person),
              ),
              label: 'Perfil',
            ),
          ],
        ),
      ),
    );
  }

  void _onTabTapped(int index) {
    setState(() {
      _indiceSeleccionado = index;
    });
  }
}

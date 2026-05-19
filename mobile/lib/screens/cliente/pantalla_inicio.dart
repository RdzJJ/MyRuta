import 'package:flutter/material.dart';
import 'dart:math';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../models/ruta.dart';
import '../../widgets/components.dart';

class PantallaInicio extends StatefulWidget {
  const PantallaInicio({Key? key}) : super(key: key);

  @override
  State<PantallaInicio> createState() => _PantallaInicioState();
}

class _PantallaInicioState extends State<PantallaInicio> {
  final TextEditingController _origenController = TextEditingController();
  final TextEditingController _destinoController = TextEditingController();
  List<Ruta> rutasCercanas = [];
  bool isLoading = false;
  bool _mostrarMarcadores = false;
  
  // Google Maps
  late GoogleMapController _mapController;
  Set<Marker> markers = {};
  LatLng? _origenLatLng;
  LatLng? _destinoLatLng;
  
  // Ubicación simulada de Medellín, Colombia
  static const LatLng medellinLocation = LatLng(6.2442, -75.5898);

  @override
  void initState() {
    super.initState();
    _cargarRutasCercanas();
    _inicializarMarcadores();
  }

  void _inicializarMarcadores() {
    markers = {};
  }

  void _cargarRutasCercanas() {
    setState(() => isLoading = true);

    // Simulación de datos
    Future.delayed(const Duration(milliseconds: 500), () {
      setState(() {
        rutasCercanas = [
          Ruta(
            id: '1',
            numero: 'Ruta 135',
            nombre: 'Estación Central - Parque',
            linea: 'Línea 4',
            estado: 'activa',
            distancia: 2.5,
            tiempoEstimado: 15,
            ubicacionActual: 'Calle Principal',
            proximaParada: 'Estación Central',
            enVivo: true,
            imageUrl: '',
            ultimaActualizacion: DateTime.now(),
          ),
          Ruta(
            id: '2',
            numero: 'Ruta 301',
            nombre: 'Centro - Aeropuerto',
            linea: 'Línea 1',
            estado: 'activa',
            distancia: 3.2,
            tiempoEstimado: 22,
            ubicacionActual: 'Avenida Principal',
            proximaParada: 'Calle 5',
            enVivo: true,
            imageUrl: '',
            ultimaActualizacion: DateTime.now(),
          ),
          Ruta(
            id: '3',
            numero: 'Express 88',
            nombre: 'Centro Ciudad',
            linea: 'Expreso',
            estado: 'activa',
            distancia: 1.8,
            tiempoEstimado: 8,
            ubicacionActual: 'Estación',
            proximaParada: 'Centro',
            enVivo: false,
            imageUrl: '',
            ultimaActualizacion: DateTime.now(),
          ),
        ];
        isLoading = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) => Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // Header con búsqueda
          SliverAppBar(
            backgroundColor: AppColors.background,
            floating: true,
            elevation: 0,
            title: Text(
              'MyRuta',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ),

          // Barra de búsqueda con origen y destino
          SliverToBoxAdapter(
            child: _construirBusquedaOrigenDestino(),
          ),

          // Mapa simulado
          SliverToBoxAdapter(
            child: _construirMapaSimulado(),
          ),

          // Título "Rutas Cercanas"
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
              child: Text(
                'Rutas Cercanas',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ),
          ),

          // Lista de rutas cercanas
          if (isLoading)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  children: List.generate(
                    3,
                    (index) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _construirSkeletonRuta(),
                    ),
                  ),
                ),
              ),
            )
          else
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final ruta = rutasCercanas[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    child: CardRuta(
                      numero: ruta.numero,
                      nombre: ruta.nombre,
                      linea: ruta.linea,
                      distancia: ruta.distancia,
                      tiempoEstimado: ruta.tiempoEstimado,
                      enVivo: ruta.enVivo,
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Abriendo ${ruta.numero}'),
                            duration: const Duration(seconds: 1),
                          ),
                        );
                      },
                    ),
                  );
                },
                childCount: rutasCercanas.length,
              ),
            ),

          // Espacio final
          const SliverToBoxAdapter(
            child: SizedBox(height: 24),
          ),
        ],
      ),
    );

  Widget _construirMapaSimulado() => Padding(
      padding: const EdgeInsets.all(16),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: MapaGoogle(
          ubicacionInicial: medellinLocation,
          markers: markers,
          altura: 240,
          onMapCreated: (controller) {
            _mapController = controller;
          },
        ),
      ),
    );

  Widget _construirSkeletonRuta() => Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              LoadingSkeleton(width: 100, height: 24),
              LoadingSkeleton(width: 70, height: 20),
            ],
          ),
          const SizedBox(height: 12),
          LoadingSkeleton(width: double.infinity, height: 16),
          const SizedBox(height: 8),
          LoadingSkeleton(width: 150, height: 16),
        ],
      ),
    );

  Widget _construirBusquedaOrigenDestino() => Padding(
    padding: const EdgeInsets.all(16),
    child: Column(
      children: [
        // Campo de Origen
        Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: TextField(
            controller: _origenController,
            decoration: InputDecoration(
              hintText: 'Origen',
              hintStyle: const TextStyle(color: AppColors.textSecondary),
              prefixIcon: const Icon(
                Icons.location_on_outlined,
                color: AppColors.primary,
              ),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 14,
              ),
            ),
            onChanged: (value) => setState(() {
              _buscarPuntoMapa(value, true);
            }),
          ),
        ),
        const SizedBox(height: 12),

        // Campo de Destino
        Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: TextField(
            controller: _destinoController,
            decoration: InputDecoration(
              hintText: 'Destino',
              hintStyle: const TextStyle(color: AppColors.textSecondary),
              prefixIcon: const Icon(
                Icons.flag_outlined,
                color: AppColors.primary,
              ),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 14,
              ),
            ),
            onChanged: (value) => setState(() {
              _buscarPuntoMapa(value, false);
            }),
          ),
        ),

        // Botón de Buscar Rutas
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            onPressed: _origenController.text.isNotEmpty &&
                    _destinoController.text.isNotEmpty
                ? () => _buscarRutas()
                : null,
            child: const Text(
              'Buscar Rutas',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
        ),
      ],
    ),
  );

  void _buscarPuntoMapa(String texto, bool esOrigen) {
    // Simulación de búsqueda de puntos en el mapa
    // En una aplicación real, aquí usarías geocoding
    Map<String, LatLng> lugaresComunes = {
      'estación central': const LatLng(6.2442, -75.5898),
      'parque arví': const LatLng(6.2450, -75.5890),
      'centro comercial': const LatLng(6.2430, -75.5910),
      'aeropuerto': const LatLng(6.1650, -75.4270),
      'upm': const LatLng(6.2338, -75.5875),
      'plaza mayor': const LatLng(6.2505, -75.5949),
    };

    LatLng? puntoEncontrado;
    for (var key in lugaresComunes.keys) {
      if (texto.toLowerCase().contains(key) ||
          key.contains(texto.toLowerCase())) {
        puntoEncontrado = lugaresComunes[key];
        break;
      }
    }

    setState(() {
      if (puntoEncontrado != null) {
        if (esOrigen) {
          _origenLatLng = puntoEncontrado;
        } else {
          _destinoLatLng = puntoEncontrado;
        }
        _actualizarMarcadores();
      }
    });
  }

  void _actualizarMarcadores() {
    if (!_mostrarMarcadores) return;

    markers = {
      // Marcador de ubicación del usuario
      Marker(
        markerId: const MarkerId('usuario'),
        position: medellinLocation,
        infoWindow: const InfoWindow(title: 'Tu ubicación'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      ),
      // Marcador de origen
      if (_origenLatLng != null)
        Marker(
          markerId: const MarkerId('origen'),
          position: _origenLatLng!,
          infoWindow: InfoWindow(
            title: 'Origen',
            snippet: _origenController.text,
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
        ),
      // Marcador de destino
      if (_destinoLatLng != null)
        Marker(
          markerId: const MarkerId('destino'),
          position: _destinoLatLng!,
          infoWindow: InfoWindow(
            title: 'Destino',
            snippet: _destinoController.text,
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        ),
      // Marcadores de buses cercanos
      Marker(
        markerId: const MarkerId('ruta_135'),
        position: const LatLng(6.2450, -75.5890),
        infoWindow: const InfoWindow(title: 'Ruta 135', snippet: 'A 2.5 km'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
      ),
      Marker(
        markerId: const MarkerId('ruta_301'),
        position: const LatLng(6.2430, -75.5910),
        infoWindow: const InfoWindow(title: 'Ruta 301', snippet: 'A 3.2 km'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
      ),
    };
  }

  void _buscarRutas() {
    if (_origenLatLng == null || _destinoLatLng == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor selecciona un origen y destino válidos'),
          duration: Duration(seconds: 2),
        ),
      );
      return;
    }

    // Mostrar mensaje de búsqueda
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Buscando rutas de ${_origenController.text} a ${_destinoController.text}...',
        ),
        duration: const Duration(seconds: 3),
      ),
    );

    setState(() {
      isLoading = true;
      _mostrarMarcadores = true;
      _actualizarMarcadores();
    });

    // Animar el mapa hacia el centro entre origen y destino
    _animarMapaAlCentro();

    // Simular búsqueda de rutas
    Future.delayed(const Duration(milliseconds: 1500), () {
      setState(() {
        rutasCercanas = [
          Ruta(
            id: '1',
            numero: 'Ruta 135',
            nombre: '${_origenController.text} - ${_destinoController.text}',
            linea: 'Línea 4',
            estado: 'activa',
            distancia: _calcularDistancia(_origenLatLng!, _destinoLatLng!),
            tiempoEstimado: 22,
            ubicacionActual: _origenController.text,
            proximaParada: _destinoController.text,
            enVivo: true,
            imageUrl: '',
            ultimaActualizacion: DateTime.now(),
          ),
          Ruta(
            id: '2',
            numero: 'Ruta 301',
            nombre: '${_origenController.text} - ${_destinoController.text}',
            linea: 'Línea 1',
            estado: 'activa',
            distancia: _calcularDistancia(_origenLatLng!, _destinoLatLng!) + 0.5,
            tiempoEstimado: 28,
            ubicacionActual: _origenController.text,
            proximaParada: _destinoController.text,
            enVivo: true,
            imageUrl: '',
            ultimaActualizacion: DateTime.now(),
          ),
        ];
        isLoading = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Se encontraron ${rutasCercanas.length} rutas disponibles',
          ),
          duration: const Duration(seconds: 2),
        ),
      );
    });
  }

  void _animarMapaAlCentro() {
    if (_origenLatLng == null || _destinoLatLng == null) return;

    // Calcular el centro entre origen y destino
    double centerLat = (_origenLatLng!.latitude + _destinoLatLng!.latitude) / 2;
    double centerLng = (_origenLatLng!.longitude + _destinoLatLng!.longitude) / 2;

    // Animar la cámara hacia el centro
    try {
      _mapController.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(
            target: LatLng(centerLat, centerLng),
            zoom: 13,
          ),
        ),
      );
    } catch (e) {
      // Si hay error, simplemente continuar sin animar
    }
  }

  double _calcularDistancia(LatLng punto1, LatLng punto2) {
    // Fórmula de Haversine para calcular distancia entre dos puntos
    const double R = 6371; // Radio terrestre en km
    double lat1Rad = punto1.latitude * pi / 180;
    double lat2Rad = punto2.latitude * pi / 180;
    double deltaLatRad = (punto2.latitude - punto1.latitude) * pi / 180;
    double deltaLngRad = (punto2.longitude - punto1.longitude) * pi / 180;

    double a = sin(deltaLatRad / 2) * sin(deltaLatRad / 2) +
        cos(lat1Rad) *
            cos(lat2Rad) *
            sin(deltaLngRad / 2) *
            sin(deltaLngRad / 2);
    double c = 2 * asin(sqrt(a));
    double distancia = R * c;

    return double.parse(distancia.toStringAsFixed(1));
  }

  @override
  void dispose() {
    _origenController.dispose();
    _destinoController.dispose();
    super.dispose();
  }
}

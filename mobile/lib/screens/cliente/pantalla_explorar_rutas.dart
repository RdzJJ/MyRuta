import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../models/ruta.dart';
import '../../services/ruta_service.dart';
import '../../widgets/components.dart';

class PantallaExplorarRutas extends StatefulWidget {
  const PantallaExplorarRutas({Key? key}) : super(key: key);

  @override
  State<PantallaExplorarRutas> createState() => _PantallaExplorarRutasState();
}

class _PantallaExplorarRutasState extends State<PantallaExplorarRutas> {
  final TextEditingController _busquedaController = TextEditingController();
  final RutaService _rutaService = RutaService();
  
  List<Ruta> rutasPopulares = [];
  List<Ruta> rutasRecientes = [];
  List<Ruta> rutasBuscadas = [];
  bool isLoading = false;
  bool isBuscando = false;
  String? errorMessage;
  
  // Google Maps
  late GoogleMapController _mapController;
  Set<Marker> markers = {};
  Set<Polyline> polylines = {};
  static const LatLng medellinLocation = LatLng(6.2442, -75.5898);

  @override
  void initState() {
    super.initState();
    _cargarRutasDelBackend();
    _busquedaController.addListener(_onBusquedaChanged);
  }

  @override
  void dispose() {
    _busquedaController.removeListener(_onBusquedaChanged);
    _busquedaController.dispose();
    // Dispose map controller if initialized
    try {
      _mapController.dispose();
    } catch (_) {}
    super.dispose();
  }

  void _onBusquedaChanged() {
    _buscarRutas(_busquedaController.text);
  }

  Future<void> _cargarRutasDelBackend() async {
    if (!mounted) return;
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final rutas = await _rutaService.obtenerRutas();
      
      if (!mounted) return;
      setState(() {
        if (rutas.isEmpty) {
          rutasPopulares = [];
          rutasRecientes = [];
        } else {
          // Las primeras rutas como populares
          rutasPopulares = rutas.take(3).toList();
          // Las demás como recientes
          rutasRecientes = rutas.skip(3).toList();
        }
        isLoading = false;
        _actualizarMarcadoresYPolylines();
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        errorMessage = 'Error al cargar rutas: $e';
        isLoading = false;
      });
      _mostrarMarcadoresPorDefecto();
    }
  }

  Future<void> _buscarRutas(String query) async {
    if (query.isEmpty) {
      setState(() {
        isBuscando = false;
        rutasBuscadas = [];
      });
      return;
    }

    setState(() {
      isBuscando = true;
    });

    try {
      final resultados = await _rutaService.buscarRutas(query);
      
      if (!mounted) return;
      setState(() {
        rutasBuscadas = resultados;
        _actualizarMarcadoresYPolylines(rutasAMostrar: rutasBuscadas);
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        rutasBuscadas = [];
      });
    }
  }

  void _actualizarMarcadoresYPolylines({List<Ruta>? rutasAMostrar}) {
    final rutasParaMostrar = rutasAMostrar ?? (rutasPopulares + rutasRecientes);
    
    var nuevosMarcadores = <Marker>{};
    var nuevosPolylines = <Polyline>{};

    for (var i = 0; i < rutasParaMostrar.length; i++) {
      final ruta = rutasParaMostrar[i];
      final paradas = ruta.stops;

      if (paradas.isNotEmpty) {
        // Obtener color para esta ruta
        final colores = [
          BitmapDescriptor.hueGreen,
          BitmapDescriptor.hueBlue,
          BitmapDescriptor.hueRed,
          BitmapDescriptor.hueYellow,
          BitmapDescriptor.hueCyan,
        ];
        final colorIndex = i % colores.length;

        // Crear marcadores para cada parada
        for (var j = 0; j < paradas.length; j++) {
          final parada = paradas[j];
          final isInicio = j == 0;
          final isFinal = j == paradas.length - 1;

          nuevosMarcadores.add(
            Marker(
              markerId: MarkerId('${ruta.id}_parada_$j'),
              position: LatLng(parada.latitude, parada.longitude),
              infoWindow: InfoWindow(
                title: parada.name,
                snippet: isInicio
                    ? '🟢 Inicio: ${ruta.name}'
                    : isFinal
                        ? '🔴 Final: ${ruta.name}'
                        : '${ruta.name} - Parada ${j + 1}',
              ),
              icon: BitmapDescriptor.defaultMarkerWithHue(colores[colorIndex]),
            ),
          );
        }

        // Crear polyline para la ruta
        if (paradas.length > 1) {
          final puntos = paradas
              .map((p) => LatLng(p.latitude, p.longitude))
              .toList();

          nuevosPolylines.add(
            Polyline(
              polylineId: PolylineId(ruta.id),
              points: puntos,
              color: _obtenerColorPolyline(colorIndex),
              width: 4,
              geodesic: true,
            ),
          );
        }
      }
    }

    setState(() {
      markers = nuevosMarcadores;
      polylines = nuevosPolylines;
    });

    // Ajustar cámara si hay marcadores
    if (nuevosMarcadores.isNotEmpty) {
      _ajustarCamara(nuevosMarcadores);
    }
  }

  void _mostrarMarcadoresPorDefecto() {
    // Marcadores de ejemplo para Medellín
    final marcadoresDefecto = {
      Marker(
        markerId: const MarkerId('medellin_1'),
        position: const LatLng(6.2450, -75.5890),
        infoWindow: const InfoWindow(
            title: 'Centro Comercial', snippet: 'Zona Centro'),
        icon: BitmapDescriptor.defaultMarkerWithHue(
            BitmapDescriptor.hueGreen),
      ),
      Marker(
        markerId: const MarkerId('medellin_2'),
        position: const LatLng(6.2430, -75.5910),
        infoWindow:
            const InfoWindow(title: 'Estación', snippet: 'Transporte'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
      ),
      Marker(
        markerId: const MarkerId('medellin_3'),
        position: const LatLng(6.2460, -75.5870),
        infoWindow:
            const InfoWindow(title: 'Aeropuerto', snippet: 'Conexión'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
      ),
    };

    setState(() {
      markers = marcadoresDefecto;
    });
  }

  Color _obtenerColorPolyline(int index) {
    final colores = [
      Colors.green,
      Colors.blue,
      Colors.red,
      Colors.yellow,
      Colors.cyan,
    ];
    return colores[index % colores.length];
  }

  void _ajustarCamara(Set<Marker> marcadores) {
    if (marcadores.isEmpty) return;

    var minLat = marcadores.first.position.latitude;
    var maxLat = marcadores.first.position.latitude;
    var minLng = marcadores.first.position.longitude;
    var maxLng = marcadores.first.position.longitude;

    for (final marker in marcadores) {
      minLat = minLat > marker.position.latitude ? marker.position.latitude : minLat;
      maxLat = maxLat < marker.position.latitude ? marker.position.latitude : maxLat;
      minLng = minLng > marker.position.longitude ? marker.position.longitude : minLng;
      maxLng = maxLng < marker.position.longitude ? marker.position.longitude : maxLng;
    }

    final bounds = LatLngBounds(
      southwest: LatLng(minLat, minLng),
      northeast: LatLng(maxLat, maxLng),
    );

    try {
      _mapController.animateCamera(CameraUpdate.newLatLngBounds(bounds, 50));
    } catch (e) {
      // Fallback: center camera if bounds fail
      final center = LatLng((minLat + maxLat) / 2, (minLng + maxLng) / 2);
      _mapController.animateCamera(CameraUpdate.newLatLng(center));
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // Header
          SliverAppBar(
            backgroundColor: AppColors.background,
            floating: true,
            elevation: 0,
            title: Text(
              'Explorar Rutas',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ),

          // Barra de búsqueda
          SliverToBoxAdapter(
            child: HeaderBusqueda(
              hint: '¿A dónde vas?',
              controller: _busquedaController,
              onChanged: (value) => setState(() {}),
            ),
          ),

          // Mostrar mensaje de error si existe
          if (errorMessage != null)
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.error.withOpacity(0.1),
                  border: Border.all(color: AppColors.error),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  errorMessage!,
                  style: const TextStyle(color: AppColors.error),
                ),
              ),
            ),

          // Mapa interactivo
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: SizedBox(
                  height: 250,
                  child: GoogleMap(
                    initialCameraPosition: const CameraPosition(
                      target: medellinLocation,
                      zoom: 13,
                    ),
                    markers: markers,
                    polylines: polylines,
                    onMapCreated: (GoogleMapController controller) {
                      _mapController = controller;
                    },
                    zoomControlsEnabled: true,
                    myLocationButtonEnabled: false,
                    mapToolbarEnabled: true,
                  ),
                ),
              ),
            ),
          ),

          // Mostrar rutas buscadas o rutas populares/recientes
          if (isBuscando && rutasBuscadas.isEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Center(
                  child: Column(
                    children: [
                      const Icon(
                        Icons.search_off,
                        size: 48,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'No se encontraron rutas',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            )
          else if (isBuscando && rutasBuscadas.isNotEmpty)
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final ruta = rutasBuscadas[index];
                  return _construirTarjetaRuta(ruta);
                },
                childCount: rutasBuscadas.length,
              ),
            )
          else if (!isLoading)
            ..._construirListaRutasNormales(),
        ],
      ),
    );

  List<Widget> _construirListaRutasNormales() => [
          // Rutas populares
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Rutas Populares',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: Text(
                      'Ver todo',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.primary,
                          ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Grid de rutas populares
          if (isLoading)
            SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 1.2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) => Container(
                  margin: const EdgeInsets.symmetric(horizontal: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      LoadingSkeleton(width: 80, height: 24),
                      const SizedBox(height: 12),
                      LoadingSkeleton(width: double.infinity, height: 16),
                    ],
                  ),
                ),
                childCount: rutasPopulares.isEmpty ? 2 : rutasPopulares.length,
              ),
            )
          else
            SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 1.2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final ruta = rutasPopulares[index];
                  return _construirCardRutaPopular(ruta);
                },
                childCount: rutasPopulares.length,
              ),
            ),

          // Espacio
          const SliverToBoxAdapter(child: SizedBox(height: 12)),

          // Rutas recientes
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
              child: Text(
                'Rutas Recientes',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ),
          ),

          // Lista de rutas recientes
          if (isLoading)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  children: List.generate(
                    3,
                    (index) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            LoadingSkeleton(width: 50, height: 50),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  LoadingSkeleton(
                                    width: 100,
                                    height: 16,
                                  ),
                                  const SizedBox(height: 8),
                                  LoadingSkeleton(
                                    width: double.infinity,
                                    height: 14,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            )
          else
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final ruta = rutasRecientes[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    child: _construirItemRutaReciente(ruta),
                  );
                },
                childCount: rutasRecientes.length,
              ),
            ),

          // Espacio final
          const SliverToBoxAdapter(
            child: SizedBox(height: 24),
          ),
        ];

  Widget _construirCardRutaPopular(Ruta ruta) => GestureDetector(
      onTap: () {
        _mostrarDetallesRuta(ruta);
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
          boxShadow: AppShadows.small,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    ruta.code,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  ruta.name,
                  style: Theme.of(context).textTheme.bodySmall,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  '${ruta.startStop} → ${ruta.endStop}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondary,
                    fontSize: 11,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '${ruta.stops.length} paradas',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.primary,
                      fontSize: 10,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );

  Widget _construirTarjetaRuta(Ruta ruta) => GestureDetector(
      onTap: () => _mostrarDetallesRuta(ruta),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
          boxShadow: AppShadows.small,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ruta.code,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      ruta.name,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.success.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'Activa',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.success,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.location_on, size: 16, color: AppColors.textSecondary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '${ruta.startStop} → ${ruta.endStop}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '${ruta.stops.length} paradas',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                if (ruta.conductors.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.info.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      '${ruta.conductors.length} conductor(es)',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.info,
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );

  void _mostrarDetallesRuta(Ruta ruta) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        color: AppColors.background,
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${ruta.code} - ${ruta.name}',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 16),
            _construirFila('Origen:', ruta.startStop),
            _construirFila('Destino:', ruta.endStop),
            _construirFila('Paradas:', '${ruta.stops.length}'),
            _construirFila('Conductores:', '${ruta.conductors.length}'),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cerrar'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _construirFila(String label, String value) => Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );

  Widget _construirItemRutaReciente(Ruta ruta) => Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          // Ícono o número de ruta
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Text(
                ruta.code.isNotEmpty ? ruta.code : ruta.numero,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Información
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  ruta.code.isNotEmpty ? ruta.code : ruta.numero,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  ruta.name.isNotEmpty ? ruta.name : ruta.nombre,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),

          // Flecha
          const Icon(
            Icons.arrow_forward,
            color: AppColors.textSecondary,
            size: 18,
          ),
        ],
      ),
    );

}

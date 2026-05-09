import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../models/ruta.dart';
import '../../widgets/components.dart';

class PantallaExplorarRutas extends StatefulWidget {
  const PantallaExplorarRutas({Key? key}) : super(key: key);

  @override
  State<PantallaExplorarRutas> createState() => _PantallaExplorarRutasState();
}

class _PantallaExplorarRutasState extends State<PantallaExplorarRutas> {
  final TextEditingController _busquedaController = TextEditingController();
  List<Ruta> rutasPopulares = [];
  List<Ruta> rutasRecientes = [];
  bool isLoading = false;
  
  // Google Maps
  late GoogleMapController _mapController;
  Set<Marker> markers = {};
  static const LatLng medellínLocation = LatLng(6.2442, -75.5898);

  @override
  void initState() {
    super.initState();
    _cargarRutas();
    _inicializarMarcadores();
  }

  void _inicializarMarcadores() {
    markers = {
      const Marker(
        markerId: MarkerId('ruta_135'),
        position: LatLng(6.2450, -75.5890),
        infoWindow: InfoWindow(title: 'Ruta 135', snippet: 'Línea 4 - 2.5 km'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
      ),
      const Marker(
        markerId: MarkerId('ruta_301'),
        position: LatLng(6.2430, -75.5910),
        infoWindow: InfoWindow(title: 'Ruta 301', snippet: 'Línea 1 - 3.2 km'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
      ),
      const Marker(
        markerId: MarkerId('express_88'),
        position: LatLng(6.2460, -75.5870),
        infoWindow: InfoWindow(title: 'Express 88', snippet: 'Expreso - 1.8 km'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
      ),
    };
  }

  void _cargarRutas() {
    setState(() => isLoading = true);

    Future.delayed(const Duration(milliseconds: 600), () {
      setState(() {
        // Rutas populares
        rutasPopulares = [
          Ruta(
            id: '1',
            numero: 'Ruta 135',
            nombre: 'Estación Central',
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
        ];

        // Rutas recientes
        rutasRecientes = [
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
          Ruta(
            id: '4',
            numero: 'Ruta 42',
            nombre: 'Paraolímpico',
            linea: 'Línea 2',
            estado: 'activa',
            distancia: 4.5,
            tiempoEstimado: 30,
            ubicacionActual: 'Calle Secundaria',
            proximaParada: 'Avenida Este',
            enVivo: true,
            imageUrl: '',
            ultimaActualizacion: DateTime.now(),
          ),
          Ruta(
            id: '5',
            numero: 'Ruta 100',
            nombre: 'Zona Comercial',
            linea: 'Línea 3',
            estado: 'activa',
            distancia: 5.2,
            tiempoEstimado: 35,
            ubicacionActual: 'Avenida Comercio',
            proximaParada: 'Centro Comercial',
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
  Widget build(BuildContext context) {
    return Scaffold(
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

          // Mapa interactivo
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: MapaGoogle(
                  ubicaciónInicial: medellínLocation,
                  markers: markers,
                  altura: 200,
                  onMapCreated: (controller) {
                    _mapController = controller;
                  },
                ),
              ),
            ),
          ),

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
                childAspectRatio: 1.0,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) => Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
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
                childCount: 2,
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
        ],
      ),
    );
  }

  Widget _construirCardRutaPopular(Ruta ruta) {
    return GestureDetector(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Abriendo ${ruta.numero}')),
        );
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
                    ruta.numero,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  ruta.nombre,
                  style: Theme.of(context).textTheme.bodySmall,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
            if (ruta.enVivo)
              IndicadorEstado(
                estado: 'En vivo',
                enLivo: true,
              ),
          ],
        ),
      ),
    );
  }

  Widget _construirItemRutaReciente(Ruta ruta) {
    return Container(
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
                ruta.numero.split(' ').last,
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
                  ruta.numero,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  ruta.nombre,
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

  @override
  void dispose() {
    _busquedaController.dispose();
    super.dispose();
  }
}

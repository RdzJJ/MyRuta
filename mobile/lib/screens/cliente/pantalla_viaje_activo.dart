import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../models/ruta.dart';
import '../../widgets/components.dart';

class PantallaViajeActivo extends StatefulWidget {
  const PantallaViajeActivo({Key? key}) : super(key: key);

  @override
  State<PantallaViajeActivo> createState() => _PantallaViajeActivoState();
}

class _PantallaViajeActivoState extends State<PantallaViajeActivo>
    with SingleTickerProviderStateMixin {
  late ViajeActivo viajeActivo;
  late AnimationController _animationController;
  
  // Google Maps
  late GoogleMapController _mapController;
  Set<Marker> markers = {};
  Set<Polyline> polylines = {};
  static const LatLng medellínLocation = LatLng(6.2442, -75.5898);

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    )..repeat();
    _inicializarViaje();
    _inicializarMarcadores();
  }

  void _inicializarMarcadores() {
    markers = {
      const Marker(
        markerId: MarkerId('usuario'),
        position: medellínLocation,
        infoWindow: InfoWindow(title: 'Tu ubicación actual'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      ),
      const Marker(
        markerId: MarkerId('destino'),
        position: LatLng(6.2500, -75.5850),
        infoWindow: InfoWindow(title: 'Paradero El Tesoro'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
      ),
    };
    
    // Línea de ruta
    polylines = {
      const Polyline(
        polylineId: PolylineId('ruta'),
        points: [
          LatLng(6.2442, -75.5898),
          LatLng(6.2450, -75.5890),
          LatLng(6.2470, -75.5870),
          LatLng(6.2490, -75.5860),
          LatLng(6.2500, -75.5850),
        ],
        color: AppColors.primary,
        width: 4,
      ),
    };
  }

  void _inicializarViaje() {
    viajeActivo = ViajeActivo(
      id: '123',
      rutaId: '1',
      rutaNumero: 'Ruta 135',
      estado: 'en_progreso',
      velocidad: 42.5,
      tiempoEstimado: 12,
      ubicacionActual: 'Calle Principal, Esq. 5ta Avenida',
      destino: 'Paradero El Tesoro',
      paradasRestantes: 4,
      progreso: 0.65,
      horaInicio: DateTime.now().subtract(const Duration(minutes: 15)),
      horaEstimadaLlegada: DateTime.now().add(const Duration(minutes: 12)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Contenido principal
          CustomScrollView(
            slivers: [
              // Header con badge de viaje activo
              SliverAppBar(
                backgroundColor: AppColors.background,
                floating: true,
                elevation: 0,
                title: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      'Viaje Activo',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 4),
                    ScaleTransition(
                      scale: Tween(begin: 0.8, end: 1.0).animate(
                        CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
                      ),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppColors.primary),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              'EN VIVO',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                centerTitle: true,
              ),

              // Mapa simulado del viaje
              SliverToBoxAdapter(
                child: _construirMapaViaje(),
              ),

              // Card principal con información del viaje
              SliverToBoxAdapter(
                child: _construirCardViajeDetalles(),
              ),

              // Información de velocidad y tráfico
              SliverToBoxAdapter(
                child: _construirSeccionEstadoTrafico(),
              ),

              // Próximas paradas
              SliverToBoxAdapter(
                child: _construirSeccionProximasParadas(),
              ),

              // Botones de acción
              SliverToBoxAdapter(
                child: _construirBotonesAccion(),
              ),

              const SliverToBoxAdapter(
                child: SizedBox(height: 24),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _construirMapaViaje() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          children: [
            MapaGoogle(
              ubicaciónInicial: medellínLocation,
              markers: markers,
              polylines: polylines,
              altura: 240,
              onMapCreated: (controller) {
                _mapController = controller;
              },
            ),
            // Badge de velocidad
            Positioned(
              top: 12,
              left: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.background.withOpacity(0.95),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.primary),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '${viajeActivo.velocidad.toStringAsFixed(1)} km/h',
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    Text(
                      'Velocidad',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                    ),
                  ],
                ),
              ),
            ),
            // Badge de tiempo estimado
            Positioned(
              top: 12,
              right: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.background.withOpacity(0.95),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.primary),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '${viajeActivo.tiempoEstimado} min',
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    Text(
                      'Tiempo est.',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _construirCardViajeDetalles() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
          // Destino
          Row(
            children: [
              const Icon(
                Icons.location_on,
                color: AppColors.primary,
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Destino',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                    ),
                    Text(
                      viajeActivo.destino,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),
          Divider(color: AppColors.border, height: 1),
          const SizedBox(height: 16),

          // Tiempo estimado y paradas restantes
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _construirInfoDetalle(
                icono: Icons.schedule,
                etiqueta: 'Tiempo Est.',
                valor: '${viajeActivo.tiempoEstimado} min',
              ),
              _construirInfoDetalle(
                icono: Icons.location_on_outlined,
                etiqueta: 'Paradas',
                valor: '${viajeActivo.paradasRestantes} paradas',
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _construirInfoDetalle({
    required IconData icono,
    required String etiqueta,
    required String valor,
  }) {
    return Column(
      children: [
        Icon(icono, color: AppColors.primary, size: 24),
        const SizedBox(height: 8),
        Text(
          etiqueta,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.textSecondary,
              ),
        ),
        const SizedBox(height: 4),
        Text(
          valor,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
      ],
    );
  }

  Widget _construirSeccionEstadoTrafico() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Estado del viaje',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Velocidad',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${viajeActivo.velocidad.toStringAsFixed(1)} km/h',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Tráfico',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.warning.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'Moderado',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.warning,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _construirSeccionProximasParadas() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Próximas paradas',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 12),
          ...List.generate(3, (index) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: index == 0
                          ? AppColors.primary.withOpacity(0.2)
                          : AppColors.surfaceLight,
                      border: Border.all(
                        color: index == 0 ? AppColors.primary : AppColors.border,
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: index == 0
                        ? const Icon(
                            Icons.check,
                            color: AppColors.primary,
                            size: 12,
                          )
                        : Text(
                            '${index + 1}',
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: AppColors.textSecondary,
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Parada ${index + 1}',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                        Text(
                          'Calle ${index + 1}, ${100 + (index * 50)}m',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.textSecondary,
                              ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _construirBotonesAccion() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        children: [
          BotonPrincipal(
            texto: 'FINALIZAR VIAJE',
            onPressed: () {
              // Lógica para finalizar viaje
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  backgroundColor: AppColors.surface,
                  title: Text(
                    '¿Finalizar viaje?',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  content: Text(
                    'Se completará tu viaje en ${viajeActivo.destino}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancelar'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Confirmar'),
                    ),
                  ],
                ),
              );
            },
            icon: Icons.check_circle,
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
}

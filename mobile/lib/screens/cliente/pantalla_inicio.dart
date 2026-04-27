import 'package:flutter/material.dart';
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
  final TextEditingController _busquedaController = TextEditingController();
  List<Ruta> rutasCercanas = [];
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    _cargarRutasCercanas();
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
  Widget build(BuildContext context) {
    return Scaffold(
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

          // Barra de búsqueda
          SliverToBoxAdapter(
            child: HeaderBusqueda(
              hint: '¿A dónde quieres ir?',
              controller: _busquedaController,
              prefixIcon: const Icon(
                Icons.location_on_outlined,
                color: AppColors.primary,
              ),
              onChanged: (value) => setState(() {}),
            ),
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
  }

  Widget _construirMapaSimulado() {
    return Container(
      height: 200,
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Stack(
        children: [
          // Fondo del mapa
          Container(
            decoration: BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(12),
            ),
          ),

          // Centro
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.2),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.primary,
                      width: 2,
                    ),
                  ),
                  child: const Icon(
                    Icons.location_on,
                    color: AppColors.primary,
                    size: 32,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Tu ubicación',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
              ],
            ),
          ),

          // Botón de centrar en esquina
          Positioned(
            bottom: 12,
            right: 12,
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.primary),
              ),
              child: IconButton(
                onPressed: () {},
                icon: const Icon(
                  Icons.my_location,
                  color: AppColors.primary,
                  size: 20,
                ),
                iconSize: 20,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _construirSkeletonRuta() {
    return Container(
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
  }

  @override
  void dispose() {
    _busquedaController.dispose();
    super.dispose();
  }
}

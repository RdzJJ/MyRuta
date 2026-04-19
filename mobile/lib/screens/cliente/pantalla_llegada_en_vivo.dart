import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../models/ruta.dart';
import '../../widgets/components.dart';

class PantallaLlegadaEnVivo extends StatefulWidget {
  const PantallaLlegadaEnVivo({Key? key}) : super(key: key);

  @override
  State<PantallaLlegadaEnVivo> createState() => _PantallaLlegadaEnVivoState();
}

class _PantallaLlegadaEnVivoState extends State<PantallaLlegadaEnVivo>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  bool notificacionActivada = false;
  int tiempoRestante = 42; // segundos

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();

    // Actualizar tiempo restante
    Future.delayed(const Duration(seconds: 1), _actualizarTiempo);
  }

  void _actualizarTiempo() {
    if (mounted) {
      setState(() => tiempoRestante--);
      if (tiempoRestante > 0) {
        Future.delayed(const Duration(seconds: 1), _actualizarTiempo);
      }
    }
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
              // Header sin AppBar tradicional para más espacio
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Llegada',
                            style: Theme.of(context).textTheme.displaySmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          Text(
                            'En Vivo',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                          ),
                        ],
                      ),
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                ),
              ),

              // Card de llegada (grande y prominente)
              SliverToBoxAdapter(
                child: _construirCardLlegada(),
              ),

              // Información del bus
              SliverToBoxAdapter(
                child: _construirInformacionBus(),
              ),

              // Estado del tráfico
              SliverToBoxAdapter(
                child: _construirEstadoTrafico(),
              ),

              // Información del conductor
              SliverToBoxAdapter(
                child: _construirInformacionConductor(),
              ),

              // Botón principal de notificación
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

  Widget _construirCardLlegada() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.neonGreen,
      ),
      child: Column(
        children: [
          // Contador de tiempo principal
          Column(
            children: [
              Text(
                'Tiempo restante',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                      fontSize: 14,
                    ),
              ),
              const SizedBox(height: 12),
              Stack(
                alignment: Alignment.center,
                children: [
                  // Círculo de progreso animado
                  ScaleTransition(
                    scale: Tween(begin: 0.95, end: 1.05).animate(
                      CurvedAnimation(
                        parent: _animationController,
                        curve: Curves.easeInOut,
                      ),
                    ),
                    child: Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppColors.primary,
                          width: 3,
                        ),
                      ),
                    ),
                  ),
                  // Número de minutos
                  Column(
                    children: [
                      Text(
                        '${(tiempoRestante ~/ 60).toString().padLeft(1, '0')}',
                        style: Theme.of(context).textTheme.displayLarge?.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      Text(
                        'min',
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              color: AppColors.textSecondary,
                            ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 24),
          Divider(color: AppColors.border, height: 1),
          const SizedBox(height: 24),

          // Información resumida
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _construirBadgeInfo(
                icono: Icons.directions_bus,
                label: 'Bus',
                valor: '4022',
              ),
              _construirBadgeInfo(
                icono: Icons.speed,
                label: 'Velocidad',
                valor: '38 km/h',
              ),
              _construirBadgeInfo(
                icono: Icons.location_on_outlined,
                label: 'Distancia',
                valor: '2.3 km',
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _construirBadgeInfo({
    required IconData icono,
    required String label,
    required String valor,
  }) {
    return Column(
      children: [
        Icon(icono, color: AppColors.primary, size: 20),
        const SizedBox(height: 6),
        Text(
          label,
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

  Widget _construirInformacionBus() {
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
            'Información del Bus',
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
                    'Número de ruta',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Ruta 135',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Capacidad',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '32 pasajeros',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Ocupación',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '18/32',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
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

  Widget _construirEstadoTrafico() {
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
          Row(
            children: [
              const Icon(
                Icons.traffic,
                color: AppColors.warning,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Estado del tráfico',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.warning.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.warning.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: const BoxDecoration(
                    color: AppColors.warning,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  'Tráfico Moderado',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.warning,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'La ruta está despejada. Llegada estimada: ${(tiempoRestante ~/ 60).toString().padLeft(1, '0')}:${(tiempoRestante % 60).toString().padLeft(2, '0')}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
        ],
      ),
    );
  }

  Widget _construirInformacionConductor() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          // Avatar
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primary.withOpacity(0.2),
              border: Border.all(color: AppColors.primary),
            ),
            child: const Icon(
              Icons.person,
              color: AppColors.primary,
              size: 28,
            ),
          ),
          const SizedBox(width: 12),

          // Información
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Conductor',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
                Text(
                  'Carlos González',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
          ),

          // Botón de contacto
          IconButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Contactar conductor')),
              );
            },
            icon: const Icon(Icons.phone, color: AppColors.primary),
          ),
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
            texto: 'NOTIFICARME',
            icon: Icons.notifications_active,
            backgroundColor:
                notificacionActivada ? AppColors.primary : AppColors.surface,
            textColor: notificacionActivada ? AppColors.background : null,
            esSecundario: !notificacionActivada,
            onPressed: () {
              setState(() => notificacionActivada = !notificacionActivada);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    notificacionActivada
                        ? '🔔 Notificaciones activadas'
                        : '🔕 Notificaciones desactivadas',
                  ),
                  duration: const Duration(milliseconds: 1000),
                ),
              );
            },
          ),
          const SizedBox(height: 12),
          BotonPrincipal(
            texto: 'Ver detalles de parada',
            icon: Icons.info_outline,
            esSecundario: true,
            onPressed: () {},
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

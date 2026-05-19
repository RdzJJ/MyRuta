# 🧩 Ejemplos de Uso - Nuevos Componentes

Este archivo contiene ejemplos de cómo usar los nuevos componentes mejorados en tus pantallas.

## Tabla de Contenidos
1. [BotónAcción](#botónacción)
2. [BotónIconoEtiqueta](#botóniconoetiqueta)
3. [TarjetaAcción](#tarjetaacción)
4. [MapaGoogle](#mapagoogle)
5. [BadgeEnVivo](#badgeenvivo)

---

## BotónAcción

### Descripción
Botón grande con icono prominente (80x80) y animación al presionar. Ideal para acciones principales.

### Uso Básico
```dart
BotónAcción(
  label: 'Buscar Rutas',
  icon: Icons.search,
  onPressed: () {
    // Tu acción aquí
    print('Buscando rutas...');
  },
)
```

### Con Colores Personalizados
```dart
BotónAcción(
  label: 'Reservar',
  icon: Icons.bookmark,
  onPressed: () {},
  backgroundColor: AppColors.primary,
  iconColor: AppColors.background,
  size: 100, // Tamaño personalizado
)
```

### En una Grid (Galería de Acciones)
```dart
GridView.count(
  crossAxisCount: 2,
  children: [
    BotónAcción(
      label: 'Rutas',
      icon: Icons.directions_bus,
      onPressed: () {},
    ),
    BotónAcción(
      label: 'Mi Viaje',
      icon: Icons.my_location,
      onPressed: () {},
    ),
    BotónAcción(
      label: 'Historial',
      icon: Icons.history,
      onPressed: () {},
    ),
    BotónAcción(
      label: 'Configuración',
      icon: Icons.settings,
      onPressed: () {},
    ),
  ],
)
```

### Propiedades
| Propiedad | Tipo | Obligatorio | Ejemplo |
|-----------|------|-------------|---------|
| `label` | String | ✅ | `'Buscar'` |
| `icon` | IconData | ✅ | `Icons.search` |
| `onPressed` | VoidCallback | ✅ | `() {}` |
| `backgroundColor` | Color | ❌ | `AppColors.primary` |
| `iconColor` | Color | ❌ | `AppColors.background` |
| `size` | double | ❌ | `80` |

---

## BotónIconoEtiqueta

### Descripción
Botón rectangular con icono y texto integrados. Similar a ElevatedButton.icon pero mejorado.

### Uso Básico
```dart
BotónIconoEtiqueta(
  etiqueta: 'Rastrear Bus',
  icon: Icons.directions_bus,
  onPressed: () {
    print('Abriendo rastreador...');
  },
)
```

### Ancho Personalizado
```dart
BotónIconoEtiqueta(
  etiqueta: 'Compartir Viaje',
  icon: Icons.share,
  onPressed: () {},
  width: 200, // Ancho fijo
)
```

### Con Color Secundario
```dart
BotónIconoEtiqueta(
  etiqueta: 'Cancelar',
  icon: Icons.close,
  onPressed: () {},
  backgroundColor: AppColors.error,
  textColor: AppColors.textPrimary,
)
```

### Stack de Botones
```dart
Column(
  spacing: 12,
  children: [
    BotónIconoEtiqueta(
      etiqueta: 'Confirmar Viaje',
      icon: Icons.check_circle,
      onPressed: () {},
    ),
    BotónIconoEtiqueta(
      etiqueta: 'Ver Detalles',
      icon: Icons.info,
      onPressed: () {},
      backgroundColor: AppColors.info,
    ),
  ],
)
```

### Propiedades
| Propiedad | Tipo | Obligatorio | Ejemplo |
|-----------|------|-------------|---------|
| `etiqueta` | String | ✅ | `'Rastrear'` |
| `icon` | IconData | ✅ | `Icons.directions_bus` |
| `onPressed` | VoidCallback | ✅ | `() {}` |
| `backgroundColor` | Color | ❌ | `AppColors.primary` |
| `iconColor` | Color | ❌ | `AppColors.background` |
| `textColor` | Color | ❌ | `AppColors.textPrimary` |
| `width` | double | ❌ | `200` |

---

## TarjetaAcción

### Descripción
Card interactiva con icono, título, descripción y flecha. Perfecta para menús y navegación.

### Uso Básico
```dart
TarjetaAcción(
  título: 'Mi Viaje Actual',
  descripción: 'Ruta 135 - 12 minutos restantes',
  icon: Icons.directions_bus,
  onTap: () {
    Navigator.push(context, MaterialPageRoute(
      builder: (context) => PantallaViajeActivo(),
    ));
  },
)
```

### Con Color Acentuado
```dart
TarjetaAcción(
  título: 'Historial',
  descripción: 'Tus últimos 5 viajes',
  icon: Icons.history,
  onTap: () {},
  accentColor: AppColors.info,
)
```

### Menú de Navegación
```dart
Column(
  spacing: 12,
  children: [
    TarjetaAcción(
      título: 'Mi Perfil',
      descripción: 'Ver y editar tu información',
      icon: Icons.person,
      onTap: () {},
      accentColor: AppColors.primary,
    ),
    TarjetaAcción(
      título: 'Favoritos',
      descripción: 'Rutas guardadas',
      icon: Icons.favorite,
      onTap: () {},
      accentColor: AppColors.warning,
    ),
    TarjetaAcción(
      título: 'Billetera',
      descripción: 'Saldo: \$50.000',
      icon: Icons.wallet_giftcard,
      onTap: () {},
      accentColor: AppColors.success,
    ),
    TarjetaAcción(
      título: 'Configuración',
      descripción: 'Preferencias de la app',
      icon: Icons.settings,
      onTap: () {},
      accentColor: AppColors.textSecondary,
    ),
  ],
)
```

### En ListView
```dart
ListView.builder(
  itemCount: rutas.length,
  itemBuilder: (context, index) {
    final ruta = rutas[index];
    return TarjetaAcción(
      título: ruta.numero,
      descripción: ruta.nombre,
      icon: Icons.directions_bus,
      onTap: () {
        // Navegar a detalles de ruta
      },
    );
  },
)
```

### Propiedades
| Propiedad | Tipo | Obligatorio | Ejemplo |
|-----------|------|-------------|---------|
| `título` | String | ✅ | `'Mi Viaje'` |
| `descripción` | String | ✅ | `'12 min restantes'` |
| `icon` | IconData | ✅ | `Icons.directions_bus` |
| `onTap` | VoidCallback | ✅ | `() {}` |
| `accentColor` | Color | ❌ | `AppColors.primary` |

---

## MapaGoogle

### Descripción
Widget reutilizable de Google Maps con tema oscuro personalizado. Soporta marcadores y polilíneas.

### Uso Básico
```dart
MapaGoogle(
  ubicaciónInicial: LatLng(6.2442, -75.5898), // Medellín
  markers: {
    const Marker(
      markerId: MarkerId('usuario'),
      position: LatLng(6.2442, -75.5898),
      infoWindow: InfoWindow(title: 'Tu ubicación'),
    ),
  },
  altura: 300,
)
```

### Con Múltiples Marcadores
```dart
Set<Marker> buses = {
  const Marker(
    markerId: MarkerId('bus_1'),
    position: LatLng(6.2450, -75.5890),
    infoWindow: InfoWindow(
      title: 'Ruta 135',
      snippet: '2.5 km - 15 min',
    ),
    icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
  ),
  const Marker(
    markerId: MarkerId('bus_2'),
    position: LatLng(6.2430, -75.5910),
    infoWindow: InfoWindow(
      title: 'Ruta 301',
      snippet: '3.2 km - 22 min',
    ),
    icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
  ),
};

MapaGoogle(
  ubicaciónInicial: LatLng(6.2442, -75.5898),
  markers: buses,
  altura: 300,
)
```

### Con Polilíneas (Rutas)
```dart
Set<Polyline> rutas = {
  const Polyline(
    polylineId: PolylineId('ruta_1'),
    points: [
      LatLng(6.2442, -75.5898),
      LatLng(6.2450, -75.5890),
      LatLng(6.2470, -75.5870),
    ],
    color: AppColors.primary,
    width: 4,
  ),
};

MapaGoogle(
  ubicaciónInicial: LatLng(6.2442, -75.5898),
  markers: buses,
  polylines: rutas,
  altura: 300,
)
```

### Con Callback onMapCreated
```dart
late GoogleMapController _mapController;

MapaGoogle(
  ubicaciónInicial: LatLng(6.2442, -75.5898),
  markers: markers,
  altura: 300,
  onMapCreated: (controller) {
    _mapController = controller;
    
    // Puedes hacer cosas con el controller:
    // _mapController.animateCamera(...)
    // _mapController.setMapStyle(...)
  },
)
```

### Códigos de Color de Marcadores
```dart
// Verde (usuario/origen)
BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen)

// Azul (buses/puntos de interés)
BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue)

// Rojo (destino/alerta)
BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed)

// Amarillo (parada)
BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueYellow)

// Naranja
BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange)
```

### Propiedades
| Propiedad | Tipo | Obligatorio | Ejemplo |
|-----------|------|-------------|---------|
| `ubicaciónInicial` | LatLng | ✅ | `LatLng(6.2442, -75.5898)` |
| `markers` | Set<Marker> | ❌ | `{marker1, marker2}` |
| `polylines` | Set<Polyline> | ❌ | `{polyline1}` |
| `onMapCreated` | VoidCallback | ❌ | `(controller) {}` |
| `altura` | double | ❌ | `300` |
| `mostrarControles` | bool | ❌ | `true` |

---

## BadgeEnVivo

### Descripción
Badge animado que indica estado "EN VIVO". Se anima continuamente con escala pulsante.

### Uso Básico
```dart
BadgeEnVivo()
```

### Con Duración Personalizada
```dart
BadgeEnVivo(
  duracionAnimación: Duration(seconds: 2),
)
```

### En AppBar
```dart
AppBar(
  title: Column(
    children: [
      Text('Mi Viaje'),
      const SizedBox(height: 4),
      BadgeEnVivo(),
    ],
  ),
)
```

### Con Información
```dart
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  children: [
    Text('Ruta 135'),
    BadgeEnVivo(),
  ],
)
```

### Propiedades
| Propiedad | Tipo | Obligatorio | Ejemplo |
|-----------|------|-------------|---------|
| `duracionAnimación` | Duration | ❌ | `Duration(seconds: 1)` |

---

## 📝 Ejemplo Completo: Pantalla de Dashboard

```dart
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // Header
          SliverAppBar(
            title: Text(
              'MyRuta',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ),

          // Mapa
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: MapaGoogle(
                  ubicaciónInicial: LatLng(6.2442, -75.5898),
                  markers: {
                    // Tu marcador aquí
                  },
                  altura: 250,
                ),
              ),
            ),
          ),

          // Acciones Rápidas
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                spacing: 16,
                children: [
                  BotónAcción(
                    label: 'Buscar',
                    icon: Icons.search,
                    onPressed: () {},
                  ),
                  BotónAcción(
                    label: 'Favoritos',
                    icon: Icons.favorite,
                    onPressed: () {},
                  ),
                  BotónAcción(
                    label: 'Historial',
                    icon: Icons.history,
                    onPressed: () {},
                  ),
                  BotónAcción(
                    label: 'Más',
                    icon: Icons.more_horiz,
                    onPressed: () {},
                  ),
                ],
              ),
            ),
          ),

          // Menú
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                spacing: 12,
                children: [
                  TarjetaAcción(
                    título: 'Mi Viaje Actual',
                    descripción: 'Ruta 135 - En progreso',
                    icon: Icons.directions_bus,
                    onTap: () {},
                  ),
                  TarjetaAcción(
                    título: 'Mis Favoritos',
                    descripción: '5 rutas guardadas',
                    icon: Icons.favorite,
                    onTap: () {},
                  ),
                  TarjetaAcción(
                    título: 'Configuración',
                    descripción: 'Preferencias y privacidad',
                    icon: Icons.settings,
                    onTap: () {},
                  ),
                ],
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }
}
```

---

## 🎯 Tips de Uso

1. **Siempre usar `AppColors`** para mantener consistencia
2. **Usar `SingleChildScrollView`** o `CustomScrollView` para pantallas con múltiples componentes
3. **Personalizar `altura` del mapa** según el contexto
4. **Agregar `SizedBox`** para espaciado entre componentes
5. **Usar `ClipRRect`** para redondear esquinas del mapa
6. **Reutilizar `MapaGoogle`** en múltiples pantallas

---

**Última actualización**: Mayo 9, 2026  
**Version**: 1.0.0

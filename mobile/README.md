# MyRuta Mobile App - README

## Descripción

Aplicación Flutter para el sistema de monitoreo de transporte público urbano MyRuta.
Soporta dos roles principales:
- **Conductor**: Realiza seguimiento GPS en tiempo real
- **Cliente**: Consulta rutas y tiempos estimados

## Requisitos

- Flutter SDK 3.10+
- Dart 3.0+
- Android Studio / Xcode (para emuladores)
- Java Development Kit (JDK) 11+ para Android

## Instalación

```bash
# Obtener dependencias
flutter pub get

# Generar código necesario (si aplica)
flutter pub run build_runner build

# Ejecutar en desarrollo
flutter run
```

## Estructura del Proyecto

```
lib/
├── main.dart              # Entry point
├── config/                # Configuración
├── models/                # Modelos de datos
├── services/              # API y servicios
├── providers/             # State management (Provider)
├── screens/               # Pantallas de la app
├── widgets/               # Widgets reutilizables
└── utils/                 # Utilidades
```

## Compilación

### Android
```bash
flutter build apk --release
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

## Configuración de Desarrollo

1. Copiar `.env.example` a `.env.local`
2. Actualizar variables de entorno
3. Ejecutar: `flutter pub get`
4. Ejecutar: `flutter run`

## Testing

```bash
flutter test
```

## Troubleshooting

Si encuentras problemas con las dependencias:
```bash
flutter clean
flutter pub get
flutter pub upgrade
```

Para problemas de build:
```bash
flutter clean
cd android && gradlew clean
```

## Licencia

MIT

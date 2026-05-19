# Google Maps Integration - MyRuta Mobile

## 🗺️ Configuración de Google Maps

Este documento explica cómo configurar e integrar Google Maps en la app MyRuta Flutter.

## Requisitos previos

1. **Google Cloud Project creado** en [Google Cloud Console](https://console.cloud.google.com)
2. **APIs habilitadas:**
   - Maps SDK for Android
   - Maps SDK for iOS
   - Directions API
   - Places API
   - Geolocation API

3. **Claves API generadas:**
   - API Key para Android
   - API Key para iOS

## 📱 Configuración Android

### 1. AndroidManifest.xml

Agrega tu API Key en `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
    <application>
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="YOUR_ANDROID_API_KEY_HERE" />
    </application>
</manifest>
```

### 2. build.gradle (nivel de aplicación)

Verifica que el `minSdkVersion` sea al menos 20:

```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        minSdkVersion 20
        // ...
    }
}
```

## 🍎 Configuración iOS

### 1. Info.plist

Agrega tu API Key en `ios/Runner/Info.plist`:

```xml
<key>io.flutter.embedded_views_preview</key>
<true/>
<key>com.google.ios.maps.API_KEY</key>
<string>YOUR_IOS_API_KEY_HERE</string>
```

### 2. Podfile

Asegúrate de que el `platform :ios` sea 11.0 o superior:

```ruby
platform :ios, '11.0'
```

## 🚀 Ejecución de la app

### Opción 1: Con API Keys hardcodeadas (desarrollo)

```bash
# Android
flutter run -d emulator-5554

# iOS
flutter run -d iPhone
```

### Opción 2: Con variables de entorno (recomendado)

```bash
# Android
flutter run \
  --dart-define=GOOGLE_MAPS_ANDROID_KEY="YOUR_ANDROID_KEY" \
  -d emulator-5554

# iOS
flutter run \
  --dart-define=GOOGLE_MAPS_IOS_KEY="YOUR_IOS_KEY" \
  -d iPhone
```

### Opción 3: Desde Visual Studio Code

En `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "MyRuta (Android)",
      "request": "launch",
      "type": "dart",
      "args": [
        "-d", "emulator-5554",
        "--dart-define=GOOGLE_MAPS_ANDROID_KEY=YOUR_KEY_HERE"
      ]
    }
  ]
}
```

## 🎨 Personalización del Mapa

### Estilo Oscuro (Dark Theme)

El widget `MapaGoogle` ya incluye un estilo oscuro personalizado que:
- Fondo oscuro (#1a1a1a)
- Texto blanco
- Bordes grises oscuros (#3a3a3a)
- Elementos de agua negros

### Marcadores Personalizados

Los marcadores ya están colorcodificados:

```dart
// Usuario (Verde)
BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen)

// Buses (Azul)
BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue)

// Destino (Rojo)
BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed)
```

## 📍 Ubicación predeterminada (Medellín, Colombia)

Todas las pantallas usan como referencia:
- **Latitude**: 6.2442°N
- **Longitude**: -75.5898°W
- **Zoom**: 15 (por defecto)

Puedes modificar esto en cada pantalla en las constantes estáticas.

## 🛠️ Troubleshooting

### Error: "Google Maps SDK is not initialized"
- Verifica que la API Key esté correctamente configurada
- Reinicia el emulador/dispositivo
- Limpia el proyecto: `flutter clean && flutter pub get`

### El mapa no se ve (Android)
- Asegúrate de que `minSdkVersion` sea >= 20
- Verifica que la API Key tenga habilitados los permisos necesarios
- Revisa los logs: `flutter logs`

### El mapa no se ve (iOS)
- Verifica la configuración de `ios/Runner/Info.plist`
- Ejecuta `pod install` en la carpeta `ios/`
- Limpia: `flutter clean && flutter pub get`

## 📦 Dependencias incluidas

```yaml
google_maps_flutter: ^2.5.0
```

Ya está agregada en `pubspec.yaml`. Para actualizar:

```bash
flutter pub upgrade google_maps_flutter
```

## 🔒 Seguridad de API Keys

**IMPORTANTE**: Nunca commits API Keys en el repositorio.

### Archivo `.env` (recomendado)

1. Crea `.env` en la raíz del proyecto:

```
GOOGLE_MAPS_ANDROID_KEY=your_android_key_here
GOOGLE_MAPS_IOS_KEY=your_ios_key_here
```

2. Agrega `.env` a `.gitignore`

3. Usa con `flutter_dotenv`:

```dart
import 'package:flutter_dotenv/flutter_dotenv.dart';

final androidKey = dotenv.env['GOOGLE_MAPS_ANDROID_KEY'];
```

## 📚 Recursos adicionales

- [Google Maps Flutter Plugin](https://pub.dev/packages/google_maps_flutter)
- [Google Cloud Console](https://console.cloud.google.com)
- [Maps SDK Documentation](https://developers.google.com/maps/documentation)

---

**Última actualización**: Mayo 9, 2026
**Estado**: ✅ Producción Ready

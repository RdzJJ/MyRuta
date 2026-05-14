# Google Maps Integration - MyRuta Web

## Implementación completada

Se ha integrado exitosamente Google Maps en la plataforma web de MyRuta con las siguientes funcionalidades:

### ✅ Características Implementadas

#### 1. **Búsqueda de Destinos (Places API)**
- Autocompletado de lugares con sesgo hacia Medellín
- Búsqueda limitada a Colombia (`includedRegionCodes: ['co']`)
- Botón "Mi ubicación" para obtener ubicación actual del usuario
- Manejo de errores y estados de carga

**Archivo**: `web/src/services/placesService.js`
**Componente**: `web/src/components/DestinationSearch.jsx`

#### 2. **ETA en Tiempo Real (Routes API)**
- Cálculo de duración y distancia usando `TRAFFIC_AWARE` routing
- Refresco automático cada 30 segundos
- Soporte para múltiples buses (encuentra el más cercano)
- Formato legible de tiempos y distancias

**Archivo**: `web/src/services/routesService.js`
**Componente**: `web/src/components/ETADisplay.jsx`

#### 3. **Integración en Dashboard**
- Página cliente actualizada: `web/src/pages/cliente/TiemposEstimados.jsx`
- Componentes integrados y estilizados con tema oscuro y acentos neon

---

## 🚀 Configuración Requerida

### 1. Clave de API de Google Maps

Obtén una clave en [Google Cloud Console](https://console.cloud.google.com):

1. Crea un nuevo proyecto
2. Habilita las siguientes APIs:
   - **Maps SDK for JavaScript**
   - **Places API**
   - **Routes API**
3. Crea una clave de API (tipo: Clave de API)

### 2. Variables de Entorno

Copia `.env.example` a `.env.local` y actualiza:

```bash
# Copia el archivo
cp .env.example .env.local
```

Edita `.env.local`:
```env
VITE_GOOGLE_MAPS_API_KEY=tu_clave_aqui
```

---

## 📁 Estructura de Archivos

```
web/
├── src/
│   ├── components/
│   │   ├── DestinationSearch.jsx      (Nueva)
│   │   ├── ETADisplay.jsx             (Nueva)
│   │   └── ...
│   ├── services/
│   │   ├── placesService.js           (Nueva)
│   │   ├── routesService.js           (Nueva)
│   │   └── ...
│   ├── pages/
│   │   └── cliente/
│   │       └── TiemposEstimados.jsx   (Actualizada)
│   └── ...
├── .env.example                        (Actualizada)
└── ...
```

---

## 🎯 Uso de Componentes

### DestinationSearch

```jsx
import DestinationSearch from '@/components/DestinationSearch'

function MyComponent() {
  const handleSelectDestination = (place) => {
    console.log(place)
    // place = {
    //   placeId, displayName, address,
    //   latitude, longitude, photos, types
    // }
  }

  return (
    <DestinationSearch 
      onDestinationSelect={handleSelectDestination}
      placeholder="Busca un lugar..."
      showMyLocation={true}
    />
  )
}
```

### ETADisplay

```jsx
import ETADisplay from '@/components/ETADisplay'

function MyComponent() {
  const busLocation = { latitude: 6.24, longitude: -75.58 }
  const destination = { latitude: 6.20, longitude: -75.50 }

  return (
    <ETADisplay 
      busLocation={busLocation}
      destination={destination}
      refreshInterval={30000}  // 30 segundos
      showDistance={true}
    />
  )
}
```

---

## 🧪 Pruebas

### Prueba Manual (Desarrollo Local)

1. **Verificar API Key**
   ```bash
   # En la consola del navegador
   console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
   ```

2. **Probar Búsqueda**
   - Abre la página de Tiempos Estimados
   - Escribe un lugar (ej: "Hospital San Vicente")
   - Verifica que aparezcan sugerencias de Medellín

3. **Probar Ubicación**
   - Haz clic en "Mi ubicación"
   - Aprueba el permiso de geolocalización
   - Verifica que tu ubicación se capture

4. **Probar ETA**
   - Selecciona un destino
   - Observa el ETA calculado
   - Verifica que se refresque cada 30 segundos

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "API key inválida" | Clave incorrecta en `.env.local` | Verifica la clave en Google Cloud Console |
| "Acceso denegado" | APIs no habilitadas | Habilita Maps SDK, Places API, Routes API |
| "Ubicación no disponible" | Permiso denegado | Verifica permisos de navegador |
| "No se encontraron resultados" | Búsqueda sin sesgo | La búsqueda siempre está sesgada a Medellín |

---

## ⚙️ API Reference

### Places Service

```javascript
import placesService from '@/services/placesService'

// Inicializar (se hace automáticamente)
await placesService.initializePlacesService()

// Obtener sugerencias
const suggestions = await placesService.getAutocompleteSuggestions('Hospital')

// Obtener detalles de lugar
const details = await placesService.getPlaceDetails(placeId)

// Obtener ubicación actual
const location = await placesService.getUserLocation()
```

### Routes Service

```javascript
import routesService from '@/services/routesService'

// Calcular ruta entre dos puntos
const route = await routesService.computeRoute(origin, destination)
// Retorna: { duration, durationFormatted, distance, distanceFormatted }

// Encontrar bus más cercano
const nearest = await routesService.findNearestBus(buses, destination)
// Retorna: { busIndex, eta, etaFormatted, distance, distanceFormatted }
```

---

## 📊 Costos Estimados (Google Cloud)

- **Places Autocomplete**: $2.83 per 1k requests
- **Routes API**: $2.50 per 1k requests  
- **Geolocation API**: Incluido en Maps SDK

*Los precios varían según región y volumen*

---

## 🔒 Seguridad

1. **API Key Restrictions** (Recomendado en producción):
   - Restringir a origen HTTP (dominio web)
   - Restringir a APIs específicas
   - Limitar cuota diaria

2. **Datos Sensibles**:
   - Nunca publiques `.env.local` en Git
   - Usa variables de entorno en CI/CD
   - Rota claves regularmente

---

## 🚧 Próximas Mejoras

- [ ] Integrar mapa visual con Google Maps SDK
- [ ] Caché de rutas frecuentes
- [ ] Preferencias del usuario (favoritos)
- [ ] Notificaciones de ETA
- [ ] Historial de búsquedas
- [ ] Integración con Firebase para ubicación real-time

---

## 📞 Soporte

Para preguntas o problemas:
1. Revisa los logs de navegador (F12 → Console)
2. Verifica que `.env.local` esté configurado
3. Confirma que las APIs estén habilitadas en Google Cloud


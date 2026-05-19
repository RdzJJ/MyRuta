from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import math
from app.config.firebase_config import init_firebase, get_realtime_db, get_firestore
from app.config.firebase_service import publicar_prediccion_rtdb

init_firebase()
router = APIRouter()

# ── Modelos ────────────────────────────────────────────────

class Waypoint(BaseModel):
    lat: float
    lng: float

class ETARequest(BaseModel):
    bus_id: str
    placa: str
    current_location: Waypoint
    route_id: str
    waypoints: List[Waypoint]
    current_speed: Optional[float] = 40.0

class ETAResponse(BaseModel):
    eta_minutes: float
    estimated_arrival_time: str
    confidence: float
    source: str
    distance_km: float

# ── Helpers ────────────────────────────────────────────────

def haversine_distance(p1: Waypoint, p2: Waypoint) -> float:
    """Distancia en km entre dos coordenadas"""
    R = 6371
    lat1, lng1 = math.radians(p1.lat), math.radians(p1.lng)
    lat2, lng2 = math.radians(p2.lat), math.radians(p2.lng)
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def calculate_route_distance(current: Waypoint, waypoints: List[Waypoint]) -> float:
    """Distancia total desde la ubicación actual hasta el final de la ruta"""
    # Encontrar el waypoint más cercano
    distances = [haversine_distance(current, wp) for wp in waypoints]
    nearest_idx = distances.index(min(distances))

    # Sumar distancia desde el punto más cercano hasta el final
    total = distances[nearest_idx]
    for i in range(nearest_idx, len(waypoints) - 1):
        total += haversine_distance(waypoints[i], waypoints[i + 1])

    return total

def get_historical_avg(route_id: str) -> Optional[float]:
    """Obtener promedio histórico desde Firestore"""
    try:
        fs = get_firestore()
        doc = fs.collection("rutas").document(route_id).get()
        if doc.exists:
            data = doc.to_dict()
            return data.get("avg_time_minutes")
    except Exception:
        pass
    return None

def get_live_speed(bus_id: str) -> Optional[float]:
    """Obtener velocidad en vivo desde Realtime Database"""
    try:
        rtdb = get_realtime_db()
        # Buscar en conductors_location por busId
        locs = rtdb.child("conductors_location").get()
        if locs:
            for conductor_id, data in locs.items():
                if data.get("busId") == bus_id:
                    return data.get("velocidad")
    except Exception:
        pass
    return None

# ── Endpoint principal ─────────────────────────────────────

@router.post("/eta", response_model=ETAResponse)
async def predict_eta(request: ETARequest):
    from datetime import datetime, timedelta

    if not request.waypoints:
        raise HTTPException(status_code=400, detail="Se requieren waypoints")

    # 1. Distancia total restante
    distance_km = calculate_route_distance(
        request.current_location,
        request.waypoints
    )

    # 2. Velocidad: en vivo > request > default
    speed = get_live_speed(request.bus_id) or request.current_speed or 40.0

    # Factor de tráfico simple (horas pico)
    hora = datetime.now().hour
    traffic_factor = 1.4 if hora in range(7, 9) or hora in range(17, 20) else 1.0

    # 3. ETA base
    eta_hours = (distance_km / speed) * traffic_factor
    eta_minutes = round(eta_hours * 60, 1)

    # 4. Ajuste con histórico si existe
    historical = get_historical_avg(request.route_id)
    confidence = 0.75

    if historical:
        # Promedio ponderado: 70% modelo, 30% histórico
        eta_minutes = round(eta_minutes * 0.7 + historical * 0.3, 1)
        confidence = 0.88

    # 5. Tiempo estimado de llegada
    arrival = datetime.now() + timedelta(minutes=eta_minutes)

    # Publicar resultado en Realtime DB
    publicar_prediccion_rtdb(request.bus_id, {
        "eta_minutes": eta_minutes,
        "route_id": request.route_id,
        "distance_km": round(distance_km, 2),
        "confidence": confidence,
        "estimated_arrival_time": arrival.isoformat()
    })

    return ETAResponse(
        eta_minutes=eta_minutes,
        estimated_arrival_time=arrival.isoformat(),
        confidence=confidence,
        source="PREDICTOR_ML",
        distance_km=round(distance_km, 2)
    )

@router.get("/health")
async def health():
    return {"status": "ok", "service": "predictor"}
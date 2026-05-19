from app.config.firebase_client import get_firestore, get_rtdb
from datetime import datetime, timezone

def get_buses_activos() -> list[dict]:
    """Lee todos los buses con ubicación activa del Realtime DB."""
    ref = get_rtdb().child("conductors_location")
    snapshot = ref.get()
    if not snapshot:
        return []
    return [
        {"busId": bus_id, **datos}
        for bus_id, datos in snapshot.items()
    ]

def get_historial_ruta(ruta_id: str, limit: int = 100) -> list[dict]:
    """Lee los últimos N trips completados de una ruta desde Firestore."""
    db = get_firestore()
    docs = (
        db.collection("trips")
        .where("rutaId", "==", ruta_id)
        .where("estado", "==", "completado")
        .order_by("fechaFin", direction="DESCENDING")
        .limit(limit)
        .stream()
    )
    return [{"id": d.id, **d.to_dict()} for d in docs]

def get_paradas_ruta(ruta_id: str) -> list[dict]:
    """Lee las paradas de una ruta desde Firestore."""
    db = get_firestore()
    docs = (
        db.collection("rutas")
        .document(ruta_id)
        .collection("paradas")
        .order_by("orden")
        .stream()
    )
    return [{"id": d.id, **d.to_dict()} for d in docs]

def publicar_prediccion_rtdb(bus_id: str, prediccion: dict):
    """Escribe la predicción de vuelta en Realtime DB para que el frontend la lea en tiempo real."""
    ref = get_rtdb().child(f"predicciones/{bus_id}")
    ref.set({
        **prediccion,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
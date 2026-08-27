"""Controller de salud del servicio.

Es el unico endpoint de la V0.1.0 y su proposito es operativo: verifica
que la aplicacion arranco y que la conexion REAL con Firestore funciona,
ejecutando una operacion de lectura liviana (listar colecciones).
"""

from fastapi import APIRouter

from app.config.firebase import get_firestore_client, is_firebase_initialized

router = APIRouter()


@router.get("/health")
def health() -> dict:
    """Estado del backend y verifica la conexion real con Firestore."""
    firebase_ok = is_firebase_initialized()

    if firebase_ok:
        try:
            db = get_firestore_client()
            # Operacion real contra Firestore: valida autenticacion y conexion.
            list(db.collections())
            return {
                "status": "ok",
                "firestore": {
                    "connected": True,
                    "message": "Conexion real a Firestore verificada.",
                },
            }
        except Exception as exc:  # noqa: BLE001 (health debe responder siempre)
            return {
                "status": "error",
                "firestore": {
                    "connected": False,
                    "message": f"Error de conexion: {exc}",
                },
            }

    return {
        "status": "error",
        "firestore": {
            "connected": False,
            "message": "Firebase no inicializado: verifica FIREBASE_CREDENTIALS_PATH.",
        },
    }
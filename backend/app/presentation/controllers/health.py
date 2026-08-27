"""Controller de salud del servicio.

Es el unico endpoint de la V0.1.0 y su proposito es operativo:
permite verificar que la aplicacion arranco y que Firebase (Firestore)
esta disponible, sin exponer logica de negocio.
"""

from fastapi import APIRouter

from app.config.firebase import is_firebase_initialized

router = APIRouter()


@router.get("/health")
def health() -> dict:
    """Estado del backend y de la conexion a Firebase."""
    return {
        "status": "ok",
        "firebase": {
            "initialized": is_firebase_initialized(),
            "message": (
                "Firestore disponible."
                if is_firebase_initialized()
                else "Firestore no configurado (FIREBASE_CREDENTIALS_PATH)."
            ),
        },
    }
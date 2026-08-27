"""Inicializacion y acceso a Firebase Admin SDK.

Este módulo mantiene UNA sola fuente de verdad para la conexion a
Firebase. El objetivo es la conexion REAL con Firestore: si las
credenciales no estan configuradas, la aplicacion falla de forma
explicita (fail-fast) en lugar de operar en un "modo sin Firestore".
"""

import logging
from pathlib import Path
from typing import Any

import firebase_admin
from firebase_admin import credentials

from app.config.settings import settings

logger = logging.getLogger(__name__)


class FirebaseConfigurationError(RuntimeError):
    """Error de configuracion de Firebase (credenciales faltantes o invalidas)."""


def is_firebase_initialized() -> bool:
    """Indica si Firebase Admin SDK ya tiene una app inicializada."""
    try:
        firebase_admin.get_app()
        return True
    except ValueError:
        return False


def _validar_credenciales() -> Path:
    """Valida que exista el archivo de credenciales configurado.

    Lanza FirebaseConfigurationError con un mensaje claro si la variable
    de entorno no esta definida o si el archivo no existe.
    """
    cred_file = settings.firebase_credentials_file
    if cred_file is None:
        raise FirebaseConfigurationError(
            "Firebase no esta configurado: define FIREBASE_CREDENTIALS_PATH "
            "en .env apuntando al service account de Firebase (archivo JSON)."
        )
    if not cred_file.exists():
        raise FirebaseConfigurationError(
            f"Archivo de credenciales no encontrado: {cred_file}."
        )
    return cred_file


def initialize_firebase() -> bool:
    """Inicializa Firebase Admin SDK con las credenciales configuradas.

    - Es idempotente: si ya hay una app inicializada, no hace nada.
    - Si las credenciales faltan, lanza FirebaseConfigurationError.
    - Si las credenciales estan mal formadas, se delega la validacion real
      del SDK (el archivo JSON debe ser un service account valido).
    - Devuelve True si la inicializacion fue exitosa.
    """
    if is_firebase_initialized():
        return True

    cred_file = _validar_credenciales()
    cred = credentials.Certificate(str(cred_file))
    firebase_admin.initialize_app(cred)
    logger.info("Firebase Admin SDK inicializado correctamente.")
    return True


def get_firestore_client() -> Any:
    """Devuelve el cliente de Firestore listo para usar.

    Requiere que Firebase haya sido inicializado con credenciales validas;
    en caso contrario se delega el error de configuracion.
    """
    initialize_firebase()
    from firebase_admin import firestore

    return firestore.client()
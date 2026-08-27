"""Inicializacion y acceso a Firebase Admin SDK.

Este módulo mantiene UNA sola fuente de verdad para la conexion a
Firebase. La gestion de credenciales queda aislada aqui, sin mezclarse
con la logica de negocio ni con los controllers.
"""

import logging
from typing import Any

import firebase_admin
from firebase_admin import credentials
from firebase_admin.firestore import Client  # noqa: F401  (re-export tipo)

from app.config.settings import settings

logger = logging.getLogger(__name__)


def is_firebase_initialized() -> bool:
    """Indica si Firebase Admin SDK ya tiene una app inicializada."""
    try:
        firebase_admin.get_app()
        return True
    except ValueError:
        return False


def initialize_firebase() -> bool:
    """Inicializa Firebase Admin SDK. Es idempotente y segura.

    - Si ya hay una app inicializada, no hace nada.
    - Si no hay credenciales configuradas, registra una advertencia y
      devuelve False (la aplicacion sigue funcionando sin Firestore).
    - Devuelve True cuando la inicializacion fue exitosa.
    """
    if is_firebase_initialized():
        return True

    cred_file = settings.firebase_credentials_file
    if cred_file is None:
        logger.warning(
            "Firebase no configurado: FIREBASE_CREDENTIALS_PATH no esta "
            "definido. Firestore estara deshabilitado."
        )
        return False

    if not cred_file.exists():
        logger.warning(
            "Firebase no configurado: no se encontro el archivo de "
            "credenciales en %s. Firestore estara deshabilitado.",
            cred_file,
        )
        return False

    cred = credentials.Certificate(str(cred_file))
    firebase_admin.initialize_app(cred)
    logger.info("Firebase Admin SDK inicializado correctamente.")
    return True


def get_firestore_client() -> Any:
    """Devuelve el cliente de Firestore, inicializando primero si hace falta.

    Si Firebase no esta configurado, lanza RuntimeError en lugar de
    devolver un cliente inutilizable.
    """
    initialize_firebase()
    if not is_firebase_initialized():
        raise RuntimeError(
            "Firebase no esta configurado. Verifica FIREBASE_CREDENTIALS_PATH."
        )
    from firebase_admin import firestore

    return firestore.client()
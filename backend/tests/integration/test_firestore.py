"""Prueba de integracion con Firestore (conexion real).

Esta prueba SOLO se ejecuta cuando existe un archivo de credenciales
configurado. En caso contrario se omite (skip), de modo que el resto
de las pruebas no dependan de una base de datos real.

Estrategia segura para probar Firestore:
1. El CI o el desarrollador configuran FIREBASE_CREDENTIALS_PATH en .env.
2. Si la variable esta vacia, la prueba se salta (sin costo ni riesgo).
3. Si esta configurada, se ejecuta una operacion real de lectura
   (listar colecciones) que valida autenticacion y conexion.
"""

import pytest
from firebase_admin import firestore

from app.config.firebase import initialize_firebase, is_firebase_initialized
from app.config.settings import settings

pytestmark = pytest.mark.integration

requires_credentials = pytest.mark.skipif(
    settings.firebase_credentials_file is None,
    reason=(
        "FIREBASE_CREDENTIALS_PATH no esta configurado. "
        "Configura las credenciales en .env para ejecutar esta prueba."
    ),
)


@requires_credentials
def test_conexion_firestore_funciona():
    """Una consulta real debe completarse sin errores de autenticacion."""
    assert initialize_firebase() is True
    assert is_firebase_initialized() is True

    db = firestore.client()
    colecciones = list(db.collections())
    assert colecciones is not None
"""Pruebas unitarias de la inicializacion de Firebase Admin SDK.

Estas pruebas verifican el comportamiento SEGURO de la inicializacion:
no dependen de credenciales reales ni de una base de datos.
"""

import firebase_admin
import pytest

from app.config.firebase import initialize_firebase, is_firebase_initialized


@pytest.fixture(autouse=True)
def _estado_limpio():
    """Elimina cualquier app de Firebase previa para partir de cero."""
    try:
        firebase_admin.delete_app(firebase_admin.get_app())
    except ValueError:
        pass
    yield


def test_is_firebase_initialized_sin_configuracion():
    """Sin credenciales Firebase no debe estar inicializado."""
    assert is_firebase_initialized() is False


def test_initialize_firebase_sin_credenciales_no_rompe():
    """La inicializacion debe ser tolerante y no lanzar excepciones."""
    result = initialize_firebase()
    assert result is False
    assert is_firebase_initialized() is False


def test_initialize_firebase_es_idempotente():
    """Llamar initialize_firebase varias veces debe ser seguro."""
    initialize_firebase()
    initialize_firebase()
    initialize_firebase()
    assert is_firebase_initialized() is False
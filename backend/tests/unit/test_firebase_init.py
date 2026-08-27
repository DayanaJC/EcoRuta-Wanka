"""Pruebas unitarias de la configuracion de Firebase.

Estas pruebas verifican el comportamiento SIN depender de Firebase ni de
una base de datos real. Solo cubren las reglas de configuracion:
presencia de credenciales y errores claros cuando faltan.
La conexion real se prueba en tests/integration (separada).
"""

import firebase_admin
import pytest

from app.config import settings as settings_module
from app.config.firebase import (
    FirebaseConfigurationError,
    initialize_firebase,
    is_firebase_initialized,
)


@pytest.fixture(autouse=True)
def _estado_limpio_sin_credenciales(monkeypatch):
    """Fuerza un estado conocido: sin credenciales configuradas.

    - Elimina cualquier app de Firebase previa.
    - Vacia la ruta de credenciales del patron singleton de Settings
      para que estas pruebas no lean credenciales reales.
    """
    try:
        firebase_admin.delete_app(firebase_admin.get_app())
    except ValueError:
        pass
    monkeypatch.setattr(
        settings_module.settings, "firebase_credentials_path", ""
    )
    yield


def test_is_firebase_initialized_sin_configuracion():
    """Sin credenciales Firebase no debe estar inicializado."""
    assert is_firebase_initialized() is False


def test_initialize_firebase_sin_credenciales_lanza_error_claro():
    """Sin credenciales la inicializacion debe fallar con error explicito."""
    with pytest.raises(FirebaseConfigurationError) as excinfo:
        initialize_firebase()
    assert "FIREBASE_CREDENTIALS_PATH" in str(excinfo.value)


def test_inicializacion_con_archivo_inexistente_lanza_error(monkeypatch):
    """Una ruta hacia un archivo que no existe debe producir error claro."""
    monkeypatch.setattr(
        settings_module.settings,
        "firebase_credentials_path",
        "ruta-inexistente.json",
    )
    with pytest.raises(FirebaseConfigurationError) as excinfo:
        initialize_firebase()
    assert "no encontrado" in str(excinfo.value)
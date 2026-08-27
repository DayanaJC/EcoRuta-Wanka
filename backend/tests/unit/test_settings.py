"""Pruebas unitarias de la configuracion de variables de entorno."""

import os

from app.config import settings as settings_module
from app.config.settings import BASE_DIR, Settings


def test_settings_expone_raiz_del_backend():
    """La raiz del backend debe apuntar a la carpeta backend/."""
    assert (BASE_DIR / "app").is_dir()
    assert (BASE_DIR / "tests").is_dir()


def test_credenciales_sin_variable_devuelven_none():
    """Sin FIREBASE_CREDENTIALS_PATH no debe haber archivo de credenciales.

    Este es el escenario de desarrollo sin Firestore configurado.
    """
    os.environ.pop("FIREBASE_CREDENTIALS_PATH", None)
    settings_instance = Settings()
    assert settings_instance.firebase_credentials_file is None


def test_ruta_relativa_se_resuelve_contra_la_raiz():
    """Una ruta relativa debe resolverse contra la raiz del backend."""
    os.environ["FIREBASE_CREDENTIALS_PATH"] = "credentials/service-account.json"
    settings_instance = Settings()
    path = settings_instance.firebase_credentials_file
    assert path is not None
    assert path.is_absolute()
    assert path == BASE_DIR / "credentials" / "service-account.json"
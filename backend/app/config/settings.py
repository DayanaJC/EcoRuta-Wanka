"""Configuracion de la aplicacion.

Carga las variables de entorno desde el archivo .env ubicado en la raiz
del backend y las expone de forma centralizada.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# backend/  : la raiz del backend es 3 niveles arriba de este archivo.
BASE_DIR = Path(__file__).resolve().parents[2]

# Carga .env (si existe) para poblar os.environ.
load_dotenv(BASE_DIR / ".env")


class Settings:
    """Acceso centralizado a las variables de entorno del proyecto."""

    def __init__(self) -> None:
        # Ruta (texto) hacia el archivo de credenciales de Firebase.
        self.firebase_credentials_path: str = os.getenv(
            "FIREBASE_CREDENTIALS_PATH", ""
        )

    @property
    def firebase_credentials_file(self) -> Path | None:
        """Devuelve la ruta absoluta del archivo de credenciales o None.

        - Si la variable esta vacia, retorna None (Firestore deshabilitado).
        - Si la ruta es relativa, se resuelve contra la raiz del backend.
        - No valida que el archivo exista: eso lo decide firebase.py.
        """
        raw = self.firebase_credentials_path.strip()
        if not raw:
            return None
        path = Path(raw)
        if not path.is_absolute():
            path = BASE_DIR / path
        return path


# Instancia unica de configuracion para toda la aplicacion.
settings = Settings()
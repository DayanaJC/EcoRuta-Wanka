"""Dependencias de FastAPI para el acceso a datos.

Las dependencias son la unica forma en que los controllers obtienen
el cliente de Firestore. Asi los controllers no conocen los detalles
de inicializacion de Firebase.
"""

from typing import Any, Iterator

from app.config.firebase import get_firestore_client


def get_db() -> Iterator[Any]:
    """Dependencia que entrega el cliente de Firestore listo para usar.

    Delega todo el trabajo de inicializacion/validacion a la capa de
    configuracion (app.config.firebase).
    """
    yield get_firestore_client()
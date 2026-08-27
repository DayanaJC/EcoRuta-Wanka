"""Prueba de integracion del repositorio de asignaciones contra Firestore real.

Crea documentos temporales (cliente prefijo TST-) en la coleccion
'asignaciones' y los elimina al terminar. Se omite (skip) si no hay
credenciales configuradas.
"""

import pytest

from app.business.models.asignacion import Asignacion, EstadoAsignacion
from app.config.firebase import initialize_firebase
from app.config.settings import settings
from app.data.repositories.firebase.asignacion_repository import (
    COLECCION,
    FirestoreAsignacionRepository,
)

pytestmark = pytest.mark.integration

requires_credentials = pytest.mark.skipif(
    settings.firebase_credentials_file is None,
    reason=(
        "FIREBASE_CREDENTIALS_PATH no esta configurado. "
        "Configura las credenciales en .env para ejecutar esta prueba."
    ),
)


def _asignacion_prueba(pedido_id: str, vehiculo_id: str) -> Asignacion:
    return Asignacion(
        pedido_id=pedido_id,
        vehiculo_id=vehiculo_id,
        fecha_asignacion="2026-01-01T00:00:00+00:00",
        estado=EstadoAsignacion.ASIGNADA,
        created_at="2026-01-01T00:00:00+00:00",
        updated_at="2026-01-01T00:00:00+00:00",
    )


@requires_credentials
def test_crud_real_del_repositorio_en_firestore():
    """El repositorio persiste, consulta y cancela asignaciones reales."""
    initialize_firebase()
    from firebase_admin import firestore

    db = firestore.client()
    repositorio = FirestoreAsignacionRepository(db)
    creados: list[str] = []
    try:
        creada = repositorio.crear(
            _asignacion_prueba("TST-PED-001", "TST-VEH-001")
        )
        creados.append(creada.id)
        assert creada.id is not None
        assert creada.estado == EstadoAsignacion.ASIGNADA

        obtenida = repositorio.get_by_id(creada.id)
        assert obtenida is not None
        assert obtenida.pedido_id == "TST-PED-001"
        assert obtenida.vehiculo_id == "TST-VEH-001"

        por_pedido = repositorio.get_by_pedido_id("TST-PED-001")
        assert any(a.id == creada.id for a in por_pedido)

        por_vehiculo = repositorio.get_by_vehiculo_id("TST-VEH-001")
        assert any(a.id == creada.id for a in por_vehiculo)

        cancelada = repositorio.actualizar(
            creada.id, {"estado": EstadoAsignacion.CANCELADA.value}
        )
        assert cancelada.estado == EstadoAsignacion.CANCELADA

        todas = repositorio.listar()
        assert any(a.id == creada.id for a in todas)
    finally:
        for id_ in creados:
            db.collection(COLECCION).document(id_).delete()
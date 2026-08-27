"""Prueba de integracion del repositorio de vehiculos contra Firestore real.

Crea documentos temporales (placa prefijo TST-) en la coleccion
'vehiculos' y los elimina al terminar. Se omite (skip) si no hay
credenciales configuradas.
"""

import pytest

from app.business.models.vehiculo import (
    EstadoVehiculo,
    TipoVehiculo,
    Vehiculo,
)
from app.config.firebase import initialize_firebase
from app.config.settings import settings
from app.data.repositories.firebase.vehiculo_repository import (
    COLECCION,
    FirestoreVehiculoRepository,
)

pytestmark = pytest.mark.integration

requires_credentials = pytest.mark.skipif(
    settings.firebase_credentials_file is None,
    reason=(
        "FIREBASE_CREDENTIALS_PATH no esta configurado. "
        "Configura las credenciales en .env para ejecutar esta prueba."
    ),
)


def _vehiculo_prueba(placa: str) -> Vehiculo:
    return Vehiculo(
        placa=placa,
        tipo=TipoVehiculo.FURGON,
        capacidad_carga_kg=800.0,
        consumo_combustible_l100km=7.2,
        factor_emision_co2_kg_l=2.4,
        anio_fabricacion=2021,
        estado=EstadoVehiculo.ACTIVO,
        created_at="2026-01-01T00:00:00+00:00",
        updated_at="2026-01-01T00:00:00+00:00",
    )


@requires_credentials
def test_crud_real_del_repositorio_en_firestore():
    """El repositorio persiste y recupera vehiculos en el Firestore real."""
    initialize_firebase()
    from firebase_admin import firestore

    db = firestore.client()
    repositorio = FirestoreVehiculoRepository(db)
    creados: list[str] = []
    try:
        creado = repositorio.crear(_vehiculo_prueba("TST-101"))
        creados.append(creado.id)
        assert creado.id is not None

        obtenido = repositorio.get_by_id(creado.id)
        assert obtenido is not None
        assert obtenido.placa == "TST-101"
        assert obtenido.tipo == TipoVehiculo.FURGON
        assert obtenido.estado == EstadoVehiculo.ACTIVO

        por_placa = repositorio.get_by_placa("TST-101")
        assert por_placa is not None and por_placa.id == creado.id

        actualizado = repositorio.actualizar(
            creado.id,
            {
                "estado": EstadoVehiculo.INACTIVO.value,
                "capacidad_carga_kg": 900.0,
            },
        )
        assert actualizado.estado == EstadoVehiculo.INACTIVO
        assert actualizado.capacidad_carga_kg == 900.0

        inactivos = repositorio.listar(estado=EstadoVehiculo.INACTIVO)
        assert any(v.id == creado.id for v in inactivos)
    finally:
        for id_ in creados:
            db.collection(COLECCION).document(id_).delete()
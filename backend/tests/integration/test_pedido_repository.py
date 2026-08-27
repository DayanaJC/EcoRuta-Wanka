"""Prueba de integracion del repositorio de pedidos contra Firestore real.

Crea documentos temporales (cliente prefijo TST-) en la coleccion
'pedidos' y los elimina al terminar. Se omite (skip) si no hay
credenciales configuradas.
"""

import pytest

from app.business.models.pedido import (
    EstadoPedido,
    Pedido,
    PrioridadPedido,
    TipoProducto,
)
from app.config.firebase import initialize_firebase
from app.config.settings import settings
from app.data.repositories.firebase.pedido_repository import (
    COLECCION,
    FirestorePedidoRepository,
)

pytestmark = pytest.mark.integration

requires_credentials = pytest.mark.skipif(
    settings.firebase_credentials_file is None,
    reason=(
        "FIREBASE_CREDENTIALS_PATH no esta configurado. "
        "Configura las credenciales en .env para ejecutar esta prueba."
    ),
)


def _pedido_prueba() -> Pedido:
    return Pedido(
        cliente_id="TST-0001",
        cliente_nombre="Farmacia Pilcomayo",
        direccion="Mz. B Lt. 5, Pilcomayo",
        punto_referencia="Frente al parque",
        latitud=-12.0334,
        longitud=-75.1936,
        peso_kg=12.5,
        volumen_m3=0.2,
        ventana_entrega_inicio="10:00",
        ventana_entrega_fin="13:00",
        prioridad=PrioridadPedido.ESTANDAR,
        tipo_producto=TipoProducto.NO_PERECEDERO,
        estado=EstadoPedido.PENDIENTE,
        created_at="2026-01-01T00:00:00+00:00",
        updated_at="2026-01-01T00:00:00+00:00",
    )


@requires_credentials
def test_crud_real_del_repositorio_en_firestore():
    """El repositorio persiste y recupera pedidos en el Firestore real."""
    initialize_firebase()
    from firebase_admin import firestore

    db = firestore.client()
    repositorio = FirestorePedidoRepository(db)
    creados: list[str] = []
    try:
        creado = repositorio.crear(_pedido_prueba())
        creados.append(creado.id)
        assert creado.id is not None

        obtenido = repositorio.get_by_id(creado.id)
        assert obtenido is not None
        assert obtenido.cliente_nombre == "Farmacia Pilcomayo"
        assert obtenido.prioridad == PrioridadPedido.ESTANDAR
        assert obtenido.estado == EstadoPedido.PENDIENTE

        actualizado = repositorio.actualizar(
            creado.id,
            {"estado": EstadoPedido.EN_RUTA.value, "peso_kg": 15.0},
        )
        assert actualizado.estado == EstadoPedido.EN_RUTA
        assert actualizado.peso_kg == 15.0

        todos = repositorio.listar()
        assert any(p.id == creado.id for p in todos)
    finally:
        for id_ in creados:
            db.collection(COLECCION).document(id_).delete()
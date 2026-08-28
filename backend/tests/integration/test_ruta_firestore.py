"""Prueba de integracion del servicio de rutas contra Firestore real.

Compone RutaService con los repositorios Firestore reales (asignaciones,
pedidos y vehiculos) y verifica que la ruta optimizada se genera con datos
persistidos. Crea documentos temporales con prefijo TST- y los elimina al
terminar. Se omite (skip) si no hay credenciales configuradas.
"""

import pytest

from app.business.models.asignacion import Asignacion, EstadoAsignacion
from app.business.models.pedido import (
    EstadoPedido,
    Pedido,
    PrioridadPedido,
    TipoProducto,
)
from app.business.models.ruta import MOTIVO_SIN_COORDENADAS
from app.business.models.vehiculo import EstadoVehiculo, TipoVehiculo, Vehiculo
from app.business.services.ruta_service import RutaService
from app.config.firebase import initialize_firebase
from app.config.settings import settings
from app.data.repositories.firebase.asignacion_repository import (
    FirestoreAsignacionRepository,
)
from app.data.repositories.firebase.pedido_repository import (
    FirestorePedidoRepository,
)
from app.data.repositories.firebase.vehiculo_repository import (
    FirestoreVehiculoRepository,
)
from app.schemas.ruta import RutaRequest

pytestmark = pytest.mark.integration

requires_credentials = pytest.mark.skipif(
    settings.firebase_credentials_file is None,
    reason=(
        "FIREBASE_CREDENTIALS_PATH no esta configurado. "
        "Configura las credenciales en .env para ejecutar esta prueba."
    ),
)


@requires_credentials
def test_generar_ruta_real_con_firestore():
    """El servicio genera una ruta con pedidos reales de Firestore."""
    initialize_firebase()
    from firebase_admin import firestore

    db = firestore.client()
    repo_asignacion = FirestoreAsignacionRepository(db)
    repo_pedido = FirestorePedidoRepository(db)
    repo_vehiculo = FirestoreVehiculoRepository(db)

    vehiculo_id = None
    creados_asignaciones: list[str] = []
    creados_pedidos: list[str] = []
    try:
        vehiculo = repo_vehiculo.crear(
            Vehiculo(
                placa="TST-123",
                tipo=TipoVehiculo.CAMIONETA,
                capacidad_carga_kg=1200.0,
                consumo_combustible_l100km=8.5,
                factor_emision_co2_kg_l=2.3,
                anio_fabricacion=2020,
                estado=EstadoVehiculo.ACTIVO,
            )
        )
        vehiculo_id = vehiculo.id

        pedidos = [
            repo_pedido.crear(
                Pedido(
                    id=None,
                    cliente_id="TST-CLI-001",
                    cliente_nombre="TST Comercial Uno",
                    direccion="Av. Giraldez 100, El Tambo",
                    punto_referencia="",
                    latitud=-12.0670,
                    longitud=-75.2090,
                    peso_kg=30.0,
                    volumen_m3=0.4,
                    ventana_entrega_inicio="09:00",
                    ventana_entrega_fin="12:00",
                    prioridad=PrioridadPedido.ESTANDAR,
                    tipo_producto=TipoProducto.NO_PERECEDERO,
                    estado=EstadoPedido.PENDIENTE,
                )
            ),
            repo_pedido.crear(
                Pedido(
                    id=None,
                    cliente_id="TST-CLI-002",
                    cliente_nombre="TST Comercial Dos",
                    direccion="Jr. Amazonas 200, Huancayo",
                    punto_referencia="",
                    latitud=-12.0640,
                    longitud=-75.2070,
                    peso_kg=20.0,
                    volumen_m3=0.3,
                    ventana_entrega_inicio="10:00",
                    ventana_entrega_fin="14:00",
                    prioridad=PrioridadPedido.ESTANDAR,
                    tipo_producto=TipoProducto.NO_PERECEDERO,
                    estado=EstadoPedido.PENDIENTE,
                )
            ),
            repo_pedido.crear(
                Pedido(
                    id=None,
                    cliente_id="TST-CLI-003",
                    cliente_nombre="TST Sin Coordenadas",
                    direccion="Sin ubicacion registrada",
                    punto_referencia="",
                    latitud=None,
                    longitud=None,
                    peso_kg=10.0,
                    volumen_m3=0.1,
                    ventana_entrega_inicio="09:00",
                    ventana_entrega_fin="12:00",
                    prioridad=PrioridadPedido.ESTANDAR,
                    tipo_producto=TipoProducto.NO_PERECEDERO,
                    estado=EstadoPedido.PENDIENTE,
                )
            ),
        ]
        creados_pedidos.extend(p.id for p in pedidos)

        con_ubicacion = [p.id for p in pedidos[:2]]
        for pedido_id in con_ubicacion:
            asignacion = repo_asignacion.crear(
                Asignacion(
                    pedido_id=pedido_id,
                    vehiculo_id=vehiculo_id,
                    fecha_asignacion="2026-01-01T00:00:00+00:00",
                    estado=EstadoAsignacion.ASIGNADA,
                )
            )
            creados_asignaciones.append(asignacion.id)

        # El tercer pedido tambien se asigna, pero sin coordenadas.
        sin_ubicacion = repo_asignacion.crear(
            Asignacion(
                pedido_id=pedidos[2].id,
                vehiculo_id=vehiculo_id,
                fecha_asignacion="2026-01-01T00:00:00+00:00",
                estado=EstadoAsignacion.ASIGNADA,
            )
        )
        creados_asignaciones.append(sin_ubicacion.id)

        servicio = RutaService(repo_asignacion, repo_pedido, repo_vehiculo)
        ruta = servicio.generar_ruta(RutaRequest(vehiculo_id=vehiculo_id))

        assert ruta.cantidad_paradas == 2
        assert ruta.vehiculo_placa == "TST-123"
        assert {p.pedido_id for p in ruta.paradas} == set(con_ubicacion)
        assert ruta.distancia_total_km > 0
        assert ruta.tiempo_estimado_min > 0
        assert ruta.combustible_estimado_l > 0
        assert ruta.emisiones_co2_kg > 0
        assert any(
            e.pedido_id == pedidos[2].id and e.motivo == MOTIVO_SIN_COORDENADAS
            for e in ruta.paradas_excluidas
        )
    finally:
        for id_ in creados_asignaciones:
            db.collection("asignaciones").document(id_).delete()
        for id_ in creados_pedidos:
            db.collection("pedidos").document(id_).delete()
        if vehiculo_id is not None:
            db.collection("vehiculos").document(vehiculo_id).delete()
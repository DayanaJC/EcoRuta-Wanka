"""Pruebas unitarias del servicio de pedidos con repositorio en memoria.

El servicio se prueba con UN repositorio falso (sin Firestore) para
verificar las reglas de negocio de forma rapida y determinista.
"""

import pytest

from app.business.exceptions.pedido import (
    PedidoEstadoInvalidoError,
    PedidoNotFoundError,
    VentanaEntregaInvalidaError,
)
from app.business.models.pedido import (
    EstadoPedido,
    Pedido,
    PrioridadPedido,
    TipoProducto,
    validar_ventana_entrega,
)
from app.business.services.pedido_service import PedidoService
from app.data.repositories.pedido import PedidoRepository
from app.schemas.pedido import PedidoCreate, PedidoUpdate


class RepositorioMemoria(PedidoRepository):
    """Repositorio en memoria que implementa el mismo contrato."""

    _CAMPOS_ENUM = {
        "prioridad": PrioridadPedido,
        "tipo_producto": TipoProducto,
        "estado": EstadoPedido,
    }

    def __init__(self) -> None:
        self._pedidos: dict[str, Pedido] = {}
        self._contador = 0

    def get_by_id(self, pedido_id: str) -> Pedido | None:
        return self._pedidos.get(pedido_id)

    def listar(self) -> list[Pedido]:
        return list(self._pedidos.values())

    def crear(self, pedido: Pedido) -> Pedido:
        self._contador += 1
        pedido.id = f"p{self._contador}"
        self._pedidos[pedido.id] = pedido
        return pedido

    def actualizar(self, pedido_id: str, datos: dict) -> Pedido:
        pedido = self._pedidos.get(pedido_id)
        if pedido is None:
            raise PedidoNotFoundError(pedido_id)
        for clave, valor in datos.items():
            if clave in self._CAMPOS_ENUM and valor is not None:
                valor = self._CAMPOS_ENUM[clave](valor)
            setattr(pedido, clave, valor)
        return pedido


def _crear_datos(**overrides) -> PedidoCreate:
    datos = {
        "cliente_id": "CLI-0001",
        "cliente_nombre": "Comercial Huancayo",
        "direccion": "Av. Giraldez 1234, El Tambo",
        "punto_referencia": "Frente al mercado",
        "latitud": -12.0664,
        "longitud": -75.2089,
        "peso_kg": 25.0,
        "volumen_m3": 0.4,
        "ventana_entrega_inicio": "09:00",
        "ventana_entrega_fin": "12:00",
        "prioridad": "express",
        "tipo_producto": "perecedero",
    }
    datos.update(overrides)
    return PedidoCreate.model_validate(datos)


def _servicio_con_un_pedido():
    servicio = PedidoService(RepositorioMemoria())
    pedido = servicio.registrar_pedido(_crear_datos())
    return servicio, pedido


def test_registrar_pedido_asigna_id_y_estado_pendiente():
    servicio = PedidoService(RepositorioMemoria())
    creado = servicio.registrar_pedido(_crear_datos())
    assert creado.id is not None
    assert creado.estado == EstadoPedido.PENDIENTE
    assert creado.ventana_entrega_inicio == "09:00"


def test_registrar_pedido_con_ventana_invertida_lanza_error():
    servicio = PedidoService(RepositorioMemoria())
    with pytest.raises(VentanaEntregaInvalidaError):
        servicio.registrar_pedido(
            _crear_datos(ventana_entrega_inicio="15:00", ventana_entrega_fin="09:00")
        )


def test_validar_ventana_rechaza_formato_invalido():
    with pytest.raises(VentanaEntregaInvalidaError):
        validar_ventana_entrega("25:00", "12:00")


def test_obtener_pedido_inexistente_lanza_not_found():
    servicio = PedidoService(RepositorioMemoria())
    with pytest.raises(PedidoNotFoundError):
        servicio.obtener_pedido("no-existe")


def test_listar_filtra_por_estado_prioridad_y_busqueda():
    servicio = PedidoService(RepositorioMemoria())
    servicio.registrar_pedido(_crear_datos())
    servicio.registrar_pedido(
        _crear_datos(
            cliente_id="CLI-0002",
            cliente_nombre="Bodega Chilca",
            prioridad="economico",
            tipo_producto="no_perecedero",
        )
    )
    express = servicio.listar_pedidos(prioridad=PrioridadPedido.EXPRESS)
    assert len(express) == 1 and express[0].cliente_id == "CLI-0001"

    pendientes = servicio.listar_pedidos(estado=EstadoPedido.PENDIENTE)
    assert len(pendientes) == 2

    por_busqueda = servicio.listar_pedidos(busqueda="chilca")
    assert len(por_busqueda) == 1 and por_busqueda[0].cliente_id == "CLI-0002"


def test_actualizar_pedido_campos_parciales():
    servicio, pedido = _servicio_con_un_pedido()
    resultado = servicio.actualizar_pedido(
        pedido.id, PedidoUpdate.model_validate({"peso_kg": 40.0})
    )
    assert resultado.peso_kg == 40.0
    assert resultado.cliente_id == "CLI-0001"


def test_actualizar_pedido_con_ventana_invalida_lanza_error():
    servicio, pedido = _servicio_con_un_pedido()
    with pytest.raises(VentanaEntregaInvalidaError):
        servicio.actualizar_pedido(
            pedido.id, PedidoUpdate.model_validate({"ventana_entrega_fin": "08:00"})
        )


def test_no_se_puede_editar_un_pedido_entregado():
    servicio, pedido = _servicio_con_un_pedido()
    servicio.cambiar_estado_pedido(pedido.id, EstadoPedido.ENTREGADO)
    with pytest.raises(PedidoEstadoInvalidoError):
        servicio.actualizar_pedido(
            pedido.id, PedidoUpdate.model_validate({"peso_kg": 1.0})
        )


def test_no_se_puede_cambiar_estado_de_un_pedido_entregado():
    servicio, pedido = _servicio_con_un_pedido()
    servicio.cambiar_estado_pedido(pedido.id, EstadoPedido.ENTREGADO)
    with pytest.raises(PedidoEstadoInvalidoError):
        servicio.cambiar_estado_pedido(pedido.id, EstadoPedido.EN_RUTA)


def test_cancelar_pedido_es_idempotente_y_bloquea_entregados():
    servicio, pedido = _servicio_con_un_pedido()
    cancelado = servicio.cancelar_pedido(pedido.id)
    assert cancelado.estado == EstadoPedido.CANCELADO
    otro_servicio, entregado = _servicio_con_un_pedido()
    otro_servicio.cambiar_estado_pedido(entregado.id, EstadoPedido.ENTREGADO)
    with pytest.raises(PedidoEstadoInvalidoError):
        otro_servicio.cancelar_pedido(entregado.id)
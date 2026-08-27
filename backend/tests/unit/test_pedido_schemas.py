"""Pruebas unitarias de los esquemas Pydantic del modulo de pedidos."""

import pytest
from pydantic import ValidationError

from app.business.models.pedido import EstadoPedido
from app.schemas.pedido import PedidoCreate, PedidoUpdate


def _datos(**overrides):
    base = {
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
    base.update(overrides)
    return base


def test_pedido_valido_se_construye():
    pedido = PedidoCreate.model_validate(_datos())
    assert pedido.prioridad.value == "express"
    assert pedido.estado == EstadoPedido.PENDIENTE


def test_hora_con_formato_invalido_es_rechazada():
    with pytest.raises(ValidationError):
        PedidoCreate.model_validate(_datos(ventana_entrega_inicio="24:00"))
    with pytest.raises(ValidationError):
        PedidoCreate.model_validate(_datos(ventana_entrega_fin="12:60"))


def test_coordenadas_fuera_de_rango_son_rechazadas():
    with pytest.raises(ValidationError):
        PedidoCreate.model_validate(_datos(latitud=95))
    with pytest.raises(ValidationError):
        PedidoCreate.model_validate(_datos(longitud=181))


def test_prioridad_y_tipo_producto_invalidos_son_rechazados():
    with pytest.raises(ValidationError):
        PedidoCreate.model_validate(_datos(prioridad="urgentisimo"))
    with pytest.raises(ValidationError):
        PedidoCreate.model_validate(_datos(tipo_producto="mineral"))


def test_peso_y_volumen_invalidos_son_rechazados():
    with pytest.raises(ValidationError):
        PedidoCreate.model_validate(_datos(peso_kg=0))
    with pytest.raises(ValidationError):
        PedidoCreate.model_validate(_datos(volumen_m3=-1))


def test_pedido_update_permite_actualizacion_parcial():
    actualizacion = PedidoUpdate.model_validate({"estado": "en_ruta"})
    assert actualizacion.cliente_nombre is None
    assert actualizacion.estado == EstadoPedido.EN_RUTA


def test_pedido_update_valida_hora_si_se_edita_la_ventana():
    with pytest.raises(ValidationError):
        PedidoUpdate.model_validate({"ventana_entrega_inicio": "9am"})
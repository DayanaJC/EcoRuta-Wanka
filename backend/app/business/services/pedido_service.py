"""Servicio de dominio del modulo de pedidos (RF-02).

Orquesta las reglas de negocio apoyandose en el repositorio inyectado.
No conoce Firestore: recibe un PedidoRepository en el constructor
(inyeccion de dependencias desde la capa de presentacion).
"""

from datetime import datetime, timezone
from typing import Optional

from app.business.exceptions.pedido import (
    PedidoEstadoInvalidoError,
    PedidoNotFoundError,
    VentanaEntregaInvalidaError,
)
from app.business.models.pedido import (
    EstadoPedido,
    Pedido,
    PrioridadPedido,
    validar_ventana_entrega,
)
from app.data.repositories.pedido import PedidoRepository
from app.schemas.pedido import PedidoCreate, PedidoUpdate

_ESTADOS_TERMINALES = (EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO)


class PedidoService:
    """Casos de uso del modulo de pedidos."""

    def __init__(self, repository: PedidoRepository) -> None:
        self._repository = repository

    @staticmethod
    def _ahora() -> str:
        return datetime.now(timezone.utc).isoformat()

    def registrar_pedido(self, datos: PedidoCreate) -> Pedido:
        validar_ventana_entrega(
            datos.ventana_entrega_inicio, datos.ventana_entrega_fin
        )
        ahora = self._ahora()
        nuevo = Pedido(
            cliente_id=datos.cliente_id.strip(),
            cliente_nombre=datos.cliente_nombre.strip(),
            direccion=datos.direccion.strip(),
            punto_referencia=datos.punto_referencia.strip(),
            latitud=datos.latitud,
            longitud=datos.longitud,
            peso_kg=datos.peso_kg,
            volumen_m3=datos.volumen_m3,
            ventana_entrega_inicio=datos.ventana_entrega_inicio,
            ventana_entrega_fin=datos.ventana_entrega_fin,
            prioridad=datos.prioridad,
            tipo_producto=datos.tipo_producto,
            estado=datos.estado,
            created_at=ahora,
            updated_at=ahora,
        )
        return self._repository.crear(nuevo)

    def obtener_pedido(self, pedido_id: str) -> Pedido:
        pedido = self._repository.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNotFoundError(f"No existe un pedido con id {pedido_id}.")
        return pedido

    def listar_pedidos(
        self,
        estado: Optional[EstadoPedido] = None,
        prioridad: Optional[PrioridadPedido] = None,
        busqueda: Optional[str] = None,
    ) -> list[Pedido]:
        pedidos = self._repository.listar()

        if estado is not None:
            pedidos = [p for p in pedidos if p.estado == estado]
        if prioridad is not None:
            pedidos = [p for p in pedidos if p.prioridad == prioridad]

        texto = (busqueda or "").strip().lower()
        if texto:
            pedidos = [
                p
                for p in pedidos
                if texto
                in " ".join(
                    [
                        p.cliente_id,
                        p.cliente_nombre,
                        p.direccion,
                        p.punto_referencia,
                    ]
                ).lower()
            ]

        return sorted(
            pedidos,
            key=lambda p: p.created_at or "",
            reverse=True,
        )

    def actualizar_pedido(self, pedido_id: str, datos: PedidoUpdate) -> Pedido:
        actual = self.obtener_pedido(pedido_id)  # valida existencia (404)
        if actual.estado in _ESTADOS_TERMINALES:
            raise PedidoEstadoInvalidoError(
                f"No se puede modificar un pedido con estado '{actual.estado.value}'."
            )

        campos = datos.model_dump(exclude_unset=True)

        if "ventana_entrega_inicio" in campos or "ventana_entrega_fin" in campos:
            inicio = campos.get("ventana_entrega_inicio") or actual.ventana_entrega_inicio
            fin = campos.get("ventana_entrega_fin") or actual.ventana_entrega_fin
            validar_ventana_entrega(inicio, fin)

        for campo in ("prioridad", "tipo_producto", "estado"):
            if campos.get(campo) is not None:
                campos[campo] = campos[campo].value

        campos["updated_at"] = self._ahora()
        return self._repository.actualizar(pedido_id, campos)

    def cambiar_estado_pedido(
        self, pedido_id: str, estado: EstadoPedido
    ) -> Pedido:
        actual = self.obtener_pedido(pedido_id)  # valida existencia (404)
        if actual.estado in _ESTADOS_TERMINALES:
            raise PedidoEstadoInvalidoError(
                f"No se puede cambiar el estado de un pedido '{actual.estado.value}'."
            )
        return self._repository.actualizar(
            pedido_id,
            {"estado": estado.value, "updated_at": self._ahora()},
        )

    def cancelar_pedido(self, pedido_id: str) -> Pedido:
        actual = self.obtener_pedido(pedido_id)  # valida existencia (404)
        if actual.estado == EstadoPedido.ENTREGADO:
            raise PedidoEstadoInvalidoError(
                "No se puede cancelar un pedido que ya fue entregado."
            )
        if actual.estado == EstadoPedido.CANCELADO:
            return actual  # idempotente
        return self._repository.actualizar(
            pedido_id,
            {"estado": EstadoPedido.CANCELADO.value, "updated_at": self._ahora()},
        )
"""Repositorio de pedidos sobre Firestore (RF-02).

Traduce documentos de la coleccion "pedidos" hacia el modelo de dominio
Pedido y viceversa. No aplica reglas de negocio: se limita a persistir.
"""

from typing import Any

from app.business.exceptions.pedido import PedidoNotFoundError
from app.business.models.pedido import (
    EstadoPedido,
    Pedido,
    PrioridadPedido,
    TipoProducto,
)
from app.data.repositories.pedido import PedidoRepository

COLECCION = "pedidos"


class FirestorePedidoRepository(PedidoRepository):
    """Implementacion del repositorio usando el cliente de Firestore."""

    def __init__(self, db: Any) -> None:
        self._coleccion = db.collection(COLECCION)

    @staticmethod
    def _a_dict(pedido: Pedido) -> dict[str, Any]:
        """Convierte el modelo de dominio a un documento de Firestore."""
        return {
            "cliente_id": pedido.cliente_id,
            "cliente_nombre": pedido.cliente_nombre,
            "direccion": pedido.direccion,
            "punto_referencia": pedido.punto_referencia,
            "latitud": pedido.latitud,
            "longitud": pedido.longitud,
            "peso_kg": pedido.peso_kg,
            "volumen_m3": pedido.volumen_m3,
            "ventana_entrega_inicio": pedido.ventana_entrega_inicio,
            "ventana_entrega_fin": pedido.ventana_entrega_fin,
            "prioridad": pedido.prioridad.value,
            "tipo_producto": pedido.tipo_producto.value,
            "estado": pedido.estado.value,
            "created_at": pedido.created_at,
            "updated_at": pedido.updated_at,
        }

    @staticmethod
    def _coordenada(valor: Any) -> float | None:
        """Devuelve una coordenada como float, o None si falta.

        El optimizador de rutas (RF-04) necesita distinguir pedidos SIN
        coordenadas. Por eso la lectura tolera documentos antiguos o
        incompletos: None se traduce a 'sin ubicacion' en negocio.
        """
        if valor is None:
            return None
        return float(valor)

    @staticmethod
    def _desde_documento(id_: str, datos: dict[str, Any]) -> Pedido:
        """Convierte un documento de Firestore al modelo de dominio."""
        return Pedido(
            id=id_,
            cliente_id=datos["cliente_id"],
            cliente_nombre=datos["cliente_nombre"],
            direccion=datos["direccion"],
            punto_referencia=datos.get("punto_referencia") or "",
            latitud=FirestorePedidoRepository._coordenada(datos.get("latitud")),
            longitud=FirestorePedidoRepository._coordenada(datos.get("longitud")),
            peso_kg=float(datos["peso_kg"]),
            volumen_m3=float(datos["volumen_m3"]),
            ventana_entrega_inicio=datos["ventana_entrega_inicio"],
            ventana_entrega_fin=datos["ventana_entrega_fin"],
            prioridad=PrioridadPedido(datos["prioridad"]),
            tipo_producto=TipoProducto(datos["tipo_producto"]),
            estado=EstadoPedido(datos["estado"]),
            created_at=str(datos.get("created_at") or ""),
            updated_at=str(datos.get("updated_at") or ""),
        )

    def _buscar(self, pedido_id: str) -> Pedido | None:
        doc = self._coleccion.document(pedido_id).get()
        if not doc.exists:
            return None
        return self._desde_documento(doc.id, doc.to_dict())

    def get_by_id(self, pedido_id: str) -> Pedido | None:
        return self._buscar(pedido_id)

    def listar(self) -> list[Pedido]:
        return [
            self._desde_documento(d.id, d.to_dict())
            for d in self._coleccion.stream()
        ]

    def crear(self, pedido: Pedido) -> Pedido:
        doc_ref = self._coleccion.document()  # id autogenerado
        doc_ref.set(self._a_dict(pedido))
        creado = self._desde_documento(doc_ref.id, self._a_dict(pedido))
        return creado

    def actualizar(self, pedido_id: str, datos: dict) -> Pedido:
        doc_ref = self._coleccion.document(pedido_id)
        if not doc_ref.get().exists:
            raise PedidoNotFoundError(f"No existe un pedido con id {pedido_id}.")
        doc_ref.update(datos)
        return self._buscar(pedido_id)
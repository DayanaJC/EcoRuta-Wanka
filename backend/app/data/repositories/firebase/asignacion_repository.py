"""Repositorio de asignaciones sobre Firestore (RF-03).

Traduce documentos de la coleccion "asignaciones" hacia el modelo de
dominio Asignacion y viceversa. No aplica reglas de negocio: se limita
a persistir. Las cancelaciones son logicas (actualizan el estado), nunca
se borra fisicamente la asignacion.
"""

from typing import Any

from google.cloud.firestore_v1.base_query import FieldFilter

from app.business.exceptions.asignacion import AsignacionNotFoundError
from app.business.models.asignacion import Asignacion, EstadoAsignacion
from app.data.repositories.asignacion import AsignacionRepository

COLECCION = "asignaciones"


class FirestoreAsignacionRepository(AsignacionRepository):
    """Implementacion del repositorio usando el cliente de Firestore."""

    def __init__(self, db: Any) -> None:
        self._coleccion = db.collection(COLECCION)

    @staticmethod
    def _a_dict(asignacion: Asignacion) -> dict[str, Any]:
        """Convierte el modelo de dominio a un documento de Firestore."""
        return {
            "pedido_id": asignacion.pedido_id,
            "vehiculo_id": asignacion.vehiculo_id,
            "fecha_asignacion": asignacion.fecha_asignacion,
            "estado": asignacion.estado.value,
            "created_at": asignacion.created_at,
            "updated_at": asignacion.updated_at,
        }

    @staticmethod
    def _desde_documento(id_: str, datos: dict[str, Any]) -> Asignacion:
        """Convierte un documento de Firestore al modelo de dominio."""
        return Asignacion(
            id=id_,
            pedido_id=datos["pedido_id"],
            vehiculo_id=datos["vehiculo_id"],
            fecha_asignacion=str(datos.get("fecha_asignacion") or ""),
            estado=EstadoAsignacion(datos["estado"]),
            created_at=str(datos.get("created_at") or ""),
            updated_at=str(datos.get("updated_at") or ""),
        )

    def _buscar(self, asignacion_id: str) -> Asignacion | None:
        doc = self._coleccion.document(asignacion_id).get()
        if not doc.exists:
            return None
        return self._desde_documento(doc.id, doc.to_dict())

    def get_by_id(self, asignacion_id: str) -> Asignacion | None:
        return self._buscar(asignacion_id)

    def listar(self) -> list[Asignacion]:
        return [
            self._desde_documento(d.id, d.to_dict())
            for d in self._coleccion.stream()
        ]

    def get_by_pedido_id(self, pedido_id: str) -> list[Asignacion]:
        docs = self._coleccion.where(
            filter=FieldFilter("pedido_id", "==", pedido_id)
        )
        return [
            self._desde_documento(d.id, d.to_dict()) for d in docs.stream()
        ]

    def get_by_vehiculo_id(self, vehiculo_id: str) -> list[Asignacion]:
        docs = self._coleccion.where(
            filter=FieldFilter("vehiculo_id", "==", vehiculo_id)
        )
        return [
            self._desde_documento(d.id, d.to_dict()) for d in docs.stream()
        ]

    def crear(self, asignacion: Asignacion) -> Asignacion:
        doc_ref = self._coleccion.document()  # id autogenerado
        doc_ref.set(self._a_dict(asignacion))
        creada = self._desde_documento(doc_ref.id, self._a_dict(asignacion))
        return creada

    def actualizar(self, asignacion_id: str, datos: dict) -> Asignacion:
        doc_ref = self._coleccion.document(asignacion_id)
        if not doc_ref.get().exists:
            raise AsignacionNotFoundError(
                f"No existe una asignacion con id {asignacion_id}."
            )
        doc_ref.update(datos)
        return self._buscar(asignacion_id)
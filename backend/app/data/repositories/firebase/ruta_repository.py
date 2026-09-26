"""Repositorio de rutas sobre Firestore.

Traduce documentos de la coleccion "rutas" hacia el modelo de dominio
Ruta y viceversa.
"""

from typing import Any, Optional

from google.cloud.firestore_v1.base_query import FieldFilter

from app.business.exceptions.ruta import RutaNotFoundError
from app.business.models.ruta import EstadoRuta, Ruta
from app.data.repositories.ruta import RutaRepository

COLECCION = "rutas"


class FirestoreRutaRepository(RutaRepository):
    """Implementacion del repositorio usando el cliente de Firestore."""

    def __init__(self, db: Any) -> None:
        self._coleccion = db.collection(COLECCION)

    @staticmethod
    def _a_dict(ruta: Ruta) -> dict[str, Any]:
        return {
            "vehiculo_id": ruta.vehiculo_id,
            "pedido_ids": ruta.pedido_ids,
            "estado": ruta.estado.value,
            "created_at": ruta.created_at,
            "updated_at": ruta.updated_at,
        }

    @staticmethod
    def _desde_documento(id_: str, datos: dict[str, Any]) -> Ruta:
        return Ruta(
            id=id_,
            vehiculo_id=datos["vehiculo_id"],
            pedido_ids=datos.get("pedido_ids") or [],
            estado=EstadoRuta(datos["estado"]),
            created_at=str(datos.get("created_at") or ""),
            updated_at=str(datos.get("updated_at") or ""),
        )

    def _buscar(self, ruta_id: str) -> Optional[Ruta]:
        doc = self._coleccion.document(ruta_id).get()
        if not doc.exists:
            return None
        return self._desde_documento(doc.id, doc.to_dict())

    def get_by_id(self, ruta_id: str) -> Optional[Ruta]:
        return self._buscar(ruta_id)

    def listar(self) -> list[Ruta]:
        return [
            self._desde_documento(d.id, d.to_dict())
            for d in self._coleccion.stream()
        ]

    def listar_por_vehiculo(self, vehiculo_id: str) -> list[Ruta]:
        docs = (
            self._coleccion.where(
                filter=FieldFilter("vehiculo_id", "==", vehiculo_id)
            )
            .stream()
        )
        return [self._desde_documento(d.id, d.to_dict()) for d in docs]

    def crear(self, ruta: Ruta) -> Ruta:
        doc_ref = self._coleccion.document()
        doc_ref.set(self._a_dict(ruta))
        return self._desde_documento(doc_ref.id, self._a_dict(ruta))

    def actualizar(self, ruta_id: str, datos: dict) -> Ruta:
        doc_ref = self._coleccion.document(ruta_id)
        if not doc_ref.get().exists:
            raise RutaNotFoundError(f"No existe una ruta con id {ruta_id}.")
        doc_ref.update(datos)
        return self._buscar(ruta_id)

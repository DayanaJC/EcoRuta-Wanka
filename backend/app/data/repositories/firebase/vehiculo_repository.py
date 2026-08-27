"""Repositorio de vehiculos sobre Firestore (RF-01).

Traduce documentos de la coleccion "vehiculos" hacia el modelo de dominio
Vehiculo y viceversa. No aplica reglas de negocio: se limita a persistir.
"""

from typing import Any, Optional

from app.business.exceptions.vehiculo import VehiculoNotFoundError
from app.business.models.vehiculo import EstadoVehiculo, TipoVehiculo, Vehiculo
from app.data.repositories.vehiculo import VehiculoRepository

COLECCION = "vehiculos"


class FirestoreVehiculoRepository(VehiculoRepository):
    """Implementacion del repositorio usando el cliente de Firestore."""

    def __init__(self, db: Any) -> None:
        self._coleccion = db.collection(COLECCION)

    @staticmethod
    def _a_dict(vehiculo: Vehiculo) -> dict[str, Any]:
        """Convierte el modelo de dominio a un documento de Firestore."""
        return {
            "placa": vehiculo.placa,
            "tipo": vehiculo.tipo.value,
            "capacidad_carga_kg": vehiculo.capacidad_carga_kg,
            "consumo_combustible_l100km": vehiculo.consumo_combustible_l100km,
            "factor_emision_co2_kg_l": vehiculo.factor_emision_co2_kg_l,
            "anio_fabricacion": vehiculo.anio_fabricacion,
            "estado": vehiculo.estado.value,
            "created_at": vehiculo.created_at,
            "updated_at": vehiculo.updated_at,
        }

    @staticmethod
    def _desde_documento(id_: str, datos: dict[str, Any]) -> Vehiculo:
        """Convierte un documento de Firestore al modelo de dominio."""
        return Vehiculo(
            id=id_,
            placa=datos["placa"],
            tipo=TipoVehiculo(datos["tipo"]),
            capacidad_carga_kg=float(datos["capacidad_carga_kg"]),
            consumo_combustible_l100km=float(datos["consumo_combustible_l100km"]),
            factor_emision_co2_kg_l=float(datos["factor_emision_co2_kg_l"]),
            anio_fabricacion=int(datos["anio_fabricacion"]),
            estado=EstadoVehiculo(datos["estado"]),
            created_at=str(datos.get("created_at") or ""),
            updated_at=str(datos.get("updated_at") or ""),
        )

    def _buscar(self, vehiculo_id: str) -> Optional[Vehiculo]:
        doc = self._coleccion.document(vehiculo_id).get()
        if not doc.exists:
            return None
        return self._desde_documento(doc.id, doc.to_dict())

    def get_by_id(self, vehiculo_id: str) -> Optional[Vehiculo]:
        return self._buscar(vehiculo_id)

    def get_by_placa(self, placa: str) -> Optional[Vehiculo]:
        docs = self._coleccion.where("placa", "==", placa).limit(1).stream()
        for doc in docs:
            return self._desde_documento(doc.id, doc.to_dict())
        return None

    def listar(self, estado: Optional[EstadoVehiculo] = None) -> list[Vehiculo]:
        consulta: Any = self._coleccion
        if estado is not None:
            consulta = consulta.where("estado", "==", estado.value)
        return [self._desde_documento(d.id, d.to_dict()) for d in consulta.stream()]

    def crear(self, vehiculo: Vehiculo) -> Vehiculo:
        doc_ref = self._coleccion.document()  # id autogenerado
        doc_ref.set(self._a_dict(vehiculo))
        creado = self._desde_documento(doc_ref.id, self._a_dict(vehiculo))
        return creado

    def actualizar(self, vehiculo_id: str, datos: dict) -> Vehiculo:
        doc_ref = self._coleccion.document(vehiculo_id)
        if not doc_ref.get().exists:
            raise VehiculoNotFoundError(
                f"No existe un vehiculo con id {vehiculo_id}."
            )
        doc_ref.update(datos)
        return self._buscar(vehiculo_id)
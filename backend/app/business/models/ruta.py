"""Modelos de dominio del modulo de optimizacion de rutas (RF-04).

Contienen las paradas planificadas, los pedidos excluidos y la ruta
resultante. Tambien definen las constantes de configuracion del
algoritmo (punto de partida y parametros de estimacion). El modulo es
agnostico de la infraestructura: no conoce Firestore ni FastAPI.
"""

from dataclasses import dataclass

# Punto de partida por defecto de las rutas: centro urbano de Huancayo.
# Puede sobreescribirse por peticion con latitud_inicio/longitud_inicio.
PUNTO_PARTIDA_DEFECTO_LAT = -12.0664
PUNTO_PARTIDA_DEFECTO_LON = -75.2089

# Parametros por defecto para las estimaciones de distancia/tiempo
# (se pueden ajustar por peticion en RutaRequest).
VELOCIDAD_MEDIA_KMH_DEFECTO = 30.0
TIEMPO_SERVICIO_MIN_DEFECTO = 10
HORA_INICIO_DEFECTO = "08:00"

# Motivos por los que un pedido asignado no se incluye en la ruta.
MOTIVO_SIN_COORDENADAS = "sin_coordenadas"
MOTIVO_PEDIDO_NO_ENCONTRADO = "pedido_no_encontrado"
MOTIVO_ESTADO_NO_ENTREGABLE = "estado_no_entregable"


@dataclass
class ParadaPlanificada:
    """Parada de entrega dentro de la secuencia optimizada."""

    orden: int
    pedido_id: str
    cliente_nombre: str
    direccion: str
    latitud: float
    longitud: float
    peso_kg: float
    ventana_entrega_inicio: str
    ventana_entrega_fin: str
    hora_estimada_llegada: str
    cumple_ventana: bool
    distancia_desde_origen_km: float


@dataclass
class PedidoExcluido:
    """Pedido asignado que no pudo incluirse en la ruta y el motivo."""

    pedido_id: str
    motivo: str


@dataclass
class RutaPlanificada:
    """Ruta optimizada de reparto para un vehiculo."""

    vehiculo_id: str
    vehiculo_placa: str
    punto_partida_latitud: float
    punto_partida_longitud: float
    hora_inicio: str
    velocidad_media_kmh: float
    tiempo_servicio_min: int
    paradas: list[ParadaPlanificada]
    paradas_excluidas: list[PedidoExcluido]
    distancia_total_km: float
    tiempo_estimado_min: float
    cantidad_paradas: int
    combustible_estimado_l: float
    emisiones_co2_kg: float
    peso_total_kg: float
    cumplimiento_ventanas: bool
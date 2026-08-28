"""Servicio de dominio del modulo de optimizacion de rutas (RF-04).

Orquesta las reglas de negocio apoyandose en los repositorios inyectados
(asignaciones, pedidos y vehiculos). El algoritmo de optimizacion vive
AQUI, en la capa de negocio, de modo que se prueba sin Firestore.

Resumen del algoritmo:
1. Traza hacia atras los pedidos asignados activos del vehiculo (RF-03).
2. Excluye los pedidos que no pueden incluirse (sin coordenadas, pedido
   no encontrado, estado no entregable) y los reporta con su motivo.
3. Ordena las paradas con vecino cercano + mejora 2-opt usando distancia
   haversine (gran circulo). Es un TSP de pocos nodos: el heuristico es
   deterministico y no requiere una API de enrutamiento externa.
4. Calcula el horario estimado de llegada respetando la velocidad media,
   el tiempo de servicio y la hora de inicio; si hay pedidos con ventana
   incumplida, intenta un reordenamiento por ventana y elige el plan con
   menos violaciones (empate: menor distancia).
5. Calcula distancia, tiempo, paradas, combustible y emisiones de CO2
   usando los datos reales del vehiculo (consumo y factor de emision).
"""

import math
import re

from app.business.exceptions.asignacion import VehiculoNoDisponibleError
from app.business.exceptions.ruta import SinPedidosAsignadosError
from app.business.exceptions.vehiculo import VehiculoNotFoundError
from app.business.models.asignacion import EstadoAsignacion
from app.business.models.pedido import EstadoPedido
from app.business.models.ruta import (
    HORA_INICIO_DEFECTO,
    MOTIVO_ESTADO_NO_ENTREGABLE,
    MOTIVO_PEDIDO_NO_ENCONTRADO,
    MOTIVO_SIN_COORDENADAS,
    PUNTO_PARTIDA_DEFECTO_LAT,
    PUNTO_PARTIDA_DEFECTO_LON,
    TIEMPO_SERVICIO_MIN_DEFECTO,
    VELOCIDAD_MEDIA_KMH_DEFECTO,
    ParadaPlanificada,
    PedidoExcluido,
    RutaPlanificada,
)
from app.business.models.vehiculo import EstadoVehiculo
from app.data.repositories.asignacion import AsignacionRepository
from app.data.repositories.pedido import PedidoRepository
from app.data.repositories.vehiculo import VehiculoRepository
from app.schemas.ruta import RutaRequest

RADIO_TIERRA_KM = 6371.0088
_PATRON_HORA = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
_ESTADOS_NO_ENTREGABLES = (EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO)


def _radianes(grados: float) -> float:
    return grados * math.pi / 180.0


def distancia_haversine_km(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """Distancia en km entre dos puntos por la formula de Haversine."""
    delta_lat = _radianes(lat2 - lat1)
    delta_lon = _radianes(lon2 - lon1)
    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(_radianes(lat1))
        * math.cos(_radianes(lat2))
        * math.sin(delta_lon / 2) ** 2
    )
    return 2 * RADIO_TIERRA_KM * math.asin(math.sqrt(a))


def _hora_a_minutos(hora: str) -> int:
    horas, minutos = hora.split(":")
    return int(horas) * 60 + int(minutos)


def _minutos_a_hora(total: float) -> str:
    total = max(round(total), 0)
    return f"{total // 60:02d}:{total % 60:02d}"


def _vecino_cercano(matriz: list[list[float]], nodos: list[int]) -> list[int]:
    """Heuristico goloso: desde el deposito (nodo 0) visita el mas cercano."""
    no_visitados = list(nodos)
    actual = 0
    recorrido: list[int] = []
    while no_visitados:
        siguiente = min(no_visitados, key=lambda n: matriz[actual][n])
        recorrido.append(siguiente)
        no_visitados.remove(siguiente)
        actual = siguiente
    return recorrido


def _mejorar_2opt(matriz: list[list[float]], nodos: list[int]) -> list[int]:
    """Mejora 2-opt de un recorrido cerrado (deposito fijo de inicio y fin)."""
    mejor = list(nodos)
    n = len(mejor)
    cambio = True
    while cambio:
        cambio = False
        for i in range(n - 1):
            for j in range(i + 1, n):
                anterior_i = 0 if i == 0 else mejor[i - 1]
                siguiente_j = 0 if j == n - 1 else mejor[j + 1]
                viejo = (
                    matriz[anterior_i][mejor[i]] + matriz[mejor[j]][siguiente_j]
                )
                nuevo = (
                    matriz[anterior_i][mejor[j]] + matriz[mejor[i]][siguiente_j]
                )
                if nuevo < viejo - 1e-9:
                    mejor[i : j + 1] = reversed(mejor[i : j + 1])
                    cambio = True
    return mejor


def _costo_recorrido(matriz: list[list[float]], nodos: list[int]) -> float:
    """Longitud del recorrido cerrado deposito -> nodos -> deposito."""
    puntos = [0, *nodos, 0]
    return sum(
        matriz[puntos[k]][puntos[k + 1]] for k in range(len(puntos) - 1)
    )


class RutaService:
    """Casos de uso del modulo de rutas."""

    def __init__(
        self,
        asignacion_repository: AsignacionRepository,
        pedido_repository: PedidoRepository,
        vehiculo_repository: VehiculoRepository,
    ) -> None:
        self._asignacion_repository = asignacion_repository
        self._pedido_repository = pedido_repository
        self._vehiculo_repository = vehiculo_repository

    @staticmethod
    def _tiene_coordenadas(pedido) -> bool:
        """Considera (0,0) o None como 'sin coordenadas' (no ubicables)."""
        if pedido.latitud is None or pedido.longitud is None:
            return False
        return not (pedido.latitud == 0.0 and pedido.longitud == 0.0)

    def _preparar_paradas(
        self, pedidos_incluidos: list
    ) -> tuple[list[PedidoExcluido], list]:
        """Separa los pedidos asignados en paradas usables y excluidos.

        Recibe una lista de (pedido_id, pedido|None) y devuelve las
        paradas con coordenadas validas mas la lista de exclusiones con
        su motivo, para que el resultado sea transparente al usuario.
        """
        paradas: list = []
        excluidos: list[PedidoExcluido] = []
        for pedido_id, pedido in pedidos_incluidos:
            if pedido is None:
                excluidos.append(
                    PedidoExcluido(pedido_id, MOTIVO_PEDIDO_NO_ENCONTRADO)
                )
            elif pedido.estado in _ESTADOS_NO_ENTREGABLES:
                excluidos.append(
                    PedidoExcluido(pedido_id, MOTIVO_ESTADO_NO_ENTREGABLE)
                )
            elif not self._tiene_coordenadas(pedido):
                excluidos.append(
                    PedidoExcluido(pedido_id, MOTIVO_SIN_COORDENADAS)
                )
            else:
                paradas.append(pedido)
        return paradas, excluidos

    @staticmethod
    def _plan_con_orden(
        paradas: list,
        orden: list[int],
        matriz: list[list[float]],
        origen: tuple[float, float],
        velocidad: float,
        servicio: int,
        hora_inicio: str,
    ) -> tuple[list[ParadaPlanificada], float]:
        """Calcula horario y metricas para un recorrido dado.

        Devuelve las paradas ordenadas (con hora estimada y cumplimiento
        de ventana) y la distancia total del recorrido cerrado.
        """
        actual = float(_hora_a_minutos(hora_inicio))
        acumulada_km = 0.0
        anterior = 0
        distancia_total = 0.0
        resultado: list[ParadaPlanificada] = []

        for idx, nodo in enumerate(orden):
            tramo = matriz[anterior][nodo]
            distancia_total += tramo
            acumulada_km += tramo
            actual += tramo / velocidad * 60.0
            pedido = paradas[nodo - 1]
            fin = _hora_a_minutos(pedido.ventana_entrega_fin)
            resultado.append(
                ParadaPlanificada(
                    orden=idx + 1,
                    pedido_id=pedido.id or "",
                    cliente_nombre=pedido.cliente_nombre,
                    direccion=pedido.direccion,
                    latitud=pedido.latitud,
                    longitud=pedido.longitud,
                    peso_kg=pedido.peso_kg,
                    ventana_entrega_inicio=pedido.ventana_entrega_inicio,
                    ventana_entrega_fin=pedido.ventana_entrega_fin,
                    hora_estimada_llegada=_minutos_a_hora(actual),
                    cumple_ventana=actual <= fin + 1e-9,
                    distancia_desde_origen_km=round(acumulada_km, 2),
                )
            )
            anterior = nodo
            actual += servicio

        distancia_total += matriz[anterior][0]  # retorno al punto de partida
        return resultado, round(distancia_total, 2)

    def generar_ruta(self, datos: RutaRequest) -> RutaPlanificada:
        vehiculo = self._vehiculo_repository.get_by_id(datos.vehiculo_id)
        if vehiculo is None:
            raise VehiculoNotFoundError(
                f"No existe un vehiculo con id {datos.vehiculo_id}."
            )
        if vehiculo.estado != EstadoVehiculo.ACTIVO:
            raise VehiculoNoDisponibleError(
                f"El vehiculo {datos.vehiculo_id} no esta activo."
            )

        activas = [
            a
            for a in self._asignacion_repository.get_by_vehiculo_id(
                datos.vehiculo_id
            )
            if a.estado == EstadoAsignacion.ASIGNADA
        ]
        if not activas:
            raise SinPedidosAsignadosError(
                f"El vehiculo {datos.vehiculo_id} no tiene pedidos "
                "asignados activos para planificar una ruta."
            )

        con_pedido = [
            (a.pedido_id, self._pedido_repository.get_by_id(a.pedido_id))
            for a in activas
        ]
        paradas, excluidos = self._preparar_paradas(con_pedido)

        origen_lat = (
            datos.latitud_inicio
            if datos.latitud_inicio is not None
            else PUNTO_PARTIDA_DEFECTO_LAT
        )
        origen_lon = (
            datos.longitud_inicio
            if datos.longitud_inicio is not None
            else PUNTO_PARTIDA_DEFECTO_LON
        )
        velocidad = datos.velocidad_media_kmh or VELOCIDAD_MEDIA_KMH_DEFECTO
        servicio = datos.tiempo_servicio_min or TIEMPO_SERVICIO_MIN_DEFECTO
        hora_inicio = datos.hora_inicio or HORA_INICIO_DEFECTO

        vacia = RutaPlanificada(
            vehiculo_id=vehiculo.id or datos.vehiculo_id,
            vehiculo_placa=vehiculo.placa,
            punto_partida_latitud=origen_lat,
            punto_partida_longitud=origen_lon,
            hora_inicio=hora_inicio,
            velocidad_media_kmh=velocidad,
            tiempo_servicio_min=servicio,
            paradas=[],
            paradas_excluidas=excluidos,
            distancia_total_km=0.0,
            tiempo_estimado_min=0.0,
            cantidad_paradas=0,
            combustible_estimado_l=0.0,
            emisiones_co2_kg=0.0,
            peso_total_kg=0.0,
            cumplimiento_ventanas=True,
        )
        if not paradas:
            return vacia

        coordenadas = [(origen_lat, origen_lon)] + [
            (p.latitud, p.longitud) for p in paradas
        ]
        matriz = [
            [
                distancia_haversine_km(
                    coordenadas[i][0],
                    coordenadas[i][1],
                    coordenadas[j][0],
                    coordenadas[j][1],
                )
                for j in range(len(coordenadas))
            ]
            for i in range(len(coordenadas))
        ]
        nodos = list(range(1, len(paradas) + 1))

        mejor = _mejorar_2opt(matriz, _vecino_cercano(matriz, nodos))
        plan, distancia_total = self._plan_con_orden(
            paradas,
            mejor,
            matriz,
            (origen_lat, origen_lon),
            velocidad,
            servicio,
            hora_inicio,
        )
        violaciones = sum(1 for p in plan if not p.cumple_ventana)

        alternativo = sorted(
            nodos,
            key=lambda n: _hora_a_minutos(paradas[n - 1].ventana_entrega_inicio),
        )
        alternativo = _mejorar_2opt(matriz, alternativo)
        plan_alt, distancia_alt = self._plan_con_orden(
            paradas,
            alternativo,
            matriz,
            (origen_lat, origen_lon),
            velocidad,
            servicio,
            hora_inicio,
        )
        violaciones_alt = sum(1 for p in plan_alt if not p.cumple_ventana)

        if violaciones_alt < violaciones:
            plan, distancia_total = plan_alt, distancia_alt
        elif (
            violaciones_alt == violaciones
            and _costo_recorrido(matriz, alternativo)
            < _costo_recorrido(matriz, mejor)
        ):
            plan, distancia_total = plan_alt, distancia_alt

        tiempo_total = distancia_total / velocidad * 60.0 + len(plan) * servicio
        combustible = distancia_total * vehiculo.consumo_combustible_l100km / 100
        emisiones = combustible * vehiculo.factor_emision_co2_kg_l
        peso_total = sum(p.peso_kg for p in plan)

        return RutaPlanificada(
            vehiculo_id=vehiculo.id or datos.vehiculo_id,
            vehiculo_placa=vehiculo.placa,
            punto_partida_latitud=origen_lat,
            punto_partida_longitud=origen_lon,
            hora_inicio=hora_inicio,
            velocidad_media_kmh=velocidad,
            tiempo_servicio_min=servicio,
            paradas=plan,
            paradas_excluidas=excluidos,
            distancia_total_km=distancia_total,
            tiempo_estimado_min=round(tiempo_total, 1),
            cantidad_paradas=len(plan),
            combustible_estimado_l=round(combustible, 2),
            emisiones_co2_kg=round(emisiones, 2),
            peso_total_kg=round(peso_total, 1),
            cumplimiento_ventanas=all(p.cumple_ventana for p in plan),
        )
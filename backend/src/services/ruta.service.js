// Servicio de rutas (RF-03): valida los datos, aplica el factor de tráfico (si está habilitado),
// solicita el orden óptimo a la API de optimización y guarda la ruta.

import {
  BultoNoCabeError,
  CapacidadInsuficienteError,
  PedidoNoDisponibleError,
  PedidoNotFoundError,
  RutaNoOptimizableError,
  RutaNotFoundError,
  RutaSinDatosError,
  VehiculoNoDisponibleError,
  VehiculoNotFoundError,
} from "../errors/errores.js";
import { horaASegundos, hoyEn, segundosAHora, tipoDia } from "../utils/tiempo.js";
import { bultosQueNoCaben, capacidadVolumenM3, describirBulto } from "./carga.js";
import { programarHorario } from "./optimizacion/horario.js";
import { ESTADOS_TERMINALES } from "./pedido.service.js";

export const HORA_SALIDA_POR_DEFECTO = "08:00";
export const FACTOR_SIN_TRAFICO = 1;

export function crearRutaService(
  { rutas, vehiculos, pedidos, factoresTrafico },
  { optimizador, almacen, zonaHoraria, traficoHabilitado = false, margenVentanaMin = 15 },
) {
  const obtener = async (id) => {
    const ruta = await rutas.getById(id);
    if (!ruta) throw new RutaNotFoundError(`No existe una ruta con id ${id}.`);
    return ruta;
  };

  const cambiarEstado = async (id, estado) => {
    await obtener(id);
    return rutas.actualizar(id, { estado });
  };

  return {
    obtener,
    cambiarEstado,
    cancelar: (id) => cambiarEstado(id, "cancelada"),

    listar: () => rutas.listar(),
    listarPorVehiculo: (vehiculoId) => rutas.listarPorVehiculo(vehiculoId),

    async generar({ vehiculo_id, pedido_ids, fecha, hora_salida, ajustar_salida = true }) {
      const vehiculo = await vehiculos.getById(vehiculo_id);
      if (!vehiculo) throw new VehiculoNotFoundError(`No existe un vehículo con id ${vehiculo_id}.`);
      if (vehiculo.estado !== "activo") throw new VehiculoNoDisponibleError(`El vehículo ${vehiculo.placa} no está activo.`);

      const ids = [...new Set(pedido_ids)];
      if (!ids.length) throw new RutaSinDatosError("No se proporcionaron pedidos para generar la ruta.");

      const encontrados = await pedidos.getMuchos(ids);
      const faltantes = ids.filter((id) => !encontrados.some((p) => p.id === id));
      if (faltantes.length) throw new PedidoNotFoundError(`No existen los pedidos: ${faltantes.join(", ")}.`);
      // Mantener el orden de selección del operador (sirve de referencia)
      const lista = ids.map((id) => encontrados.find((p) => p.id === id));

      const noDisponibles = lista.filter((p) => ESTADOS_TERMINALES.includes(p.estado));
      if (noDisponibles.length) {
        throw new PedidoNoDisponibleError(
          `Estos pedidos están entregados o cancelados y no pueden incluirse: ${noDisponibles.map((p) => p.cliente_nombre).join(", ")}.`,
        );
      }

      // RN-002: la carga total no puede superar la capacidad del vehículo
      const pesoTotal = lista.reduce((suma, p) => suma + p.peso_kg, 0);
      if (pesoTotal > vehiculo.capacidad_carga_kg) {
        throw new CapacidadInsuficienteError(
          `Los pedidos suman ${Number(pesoTotal.toFixed(2))} kg y el vehículo ${vehiculo.placa} soporta ${vehiculo.capacidad_carga_kg} kg.`,
        );
      }

      // Volumen: la carga total no puede superar el volumen útil del vehículo
      const volumenTotal = lista.reduce((suma, p) => suma + p.volumen_m3, 0);
      const volumenMax = capacidadVolumenM3(vehiculo);
      if (volumenTotal > volumenMax) {
        throw new CapacidadInsuficienteError(
          `Los pedidos ocupan ${Number(volumenTotal.toFixed(3))} m³ y el vehículo ${vehiculo.placa} admite ${volumenMax} m³.`,
        );
      }

      // Dimensiones: cada bulto debe caber físicamente en la caja de carga
      const noCaben = lista.flatMap((p) => bultosQueNoCaben(p, vehiculo).map((b) => `${describirBulto(b)} de ${p.cliente_nombre}`));
      if (noCaben.length) {
        throw new BultoNoCabeError(`No caben en el vehículo ${vehiculo.placa}: ${noCaben.join(", ")}.`);
      }

      const dia = fecha ?? hoyEn(zonaHoraria);
      const salida = hora_salida ?? HORA_SALIDA_POR_DEFECTO;
      // Factores de tráfico: implementación futura. Mientras estén deshabilitados, la API
      // calcula los tiempos con las velocidades promedio de las vías (factor 1).
      const factor = traficoHabilitado
        ? ((await factoresTrafico.buscar(tipoDia(dia), salida))?.factor ?? FACTOR_SIN_TRAFICO)
        : FACTOR_SIN_TRAFICO;

      const resultado = await optimizador.optimizarRuta({
        almacen,
        vehiculo,
        pedidos: lista,
        horaSalida: salida,
        factorVelocidad: factor,
      });

      if (resultado.no_asignados.length) {
        const nombres = lista.filter((p) => resultado.no_asignados.includes(p.id)).map((p) => p.cliente_nombre);
        throw new RutaNoOptimizableError(
          `No es posible atender estos pedidos dentro de su ventana de entrega saliendo a las ${salida}: ${nombres.join(", ")}. ` +
            "Revisa las ventanas de entrega o cambia la hora de salida.",
        );
      }

      // "Antes": el mismo recorrido en el orden elegido por el operador (almacén → pedidos → almacén).
      // Sirve para comparar km y CO₂; si la consulta falla no se bloquea la ruta.
      let distanciaSinOptimizar = null;
      try {
        distanciaSinOptimizar = await optimizador.distanciaRecorrido([almacen, ...lista, almacen]);
      } catch {
        distanciaSinOptimizar = null;
      }

      // hora_salida del operador = hora DISPONIBLE; se calcula la salida óptima
      const pedidoPorId = Object.fromEntries(lista.map((p) => [p.id, p]));
      const horario = programarHorario({
        disponible_s: horaASegundos(salida),
        regreso_s: resultado.regreso_s,
        margen_s: margenVentanaMin * 60,
        ajustarSalida: ajustar_salida,
        paradas: resultado.paradas.map((p) => {
          const pedido = pedidoPorId[p.pedido_id];
          return {
            id: p.pedido_id,
            viaje_s: p.viaje_s,
            servicio_s: (pedido.tiempo_servicio_min ?? 5) * 60,
            ventana_inicio_s: horaASegundos(pedido.ventana_entrega_inicio),
            ventana_fin_s: horaASegundos(pedido.ventana_entrega_fin),
          };
        }),
      });

      return rutas.crearConParadas({
        vehiculo_id,
        fecha: dia,
        hora_disponible: salida,
        hora_salida: segundosAHora(horario.salida_s),
        distancia_estimada_km: Number((resultado.distancia_m / 1000).toFixed(2)),
        distancia_sin_optimizar_km: distanciaSinOptimizar == null ? null : Number((distanciaSinOptimizar / 1000).toFixed(2)),
        tiempo_estimado_min: Math.round((horario.fin_s - horario.salida_s) / 60),
        factor_trafico_aplicado: traficoHabilitado ? factor : null,
        geometria: resultado.geometria,
        estado: "generada",
        paradas: horario.paradas.map((p, i) => ({
          orden: i + 1,
          pedido_id: p.id,
          hora_estimada_llegada: segundosAHora(p.entrega_s),
          espera_min: Math.round(p.espera_s / 60),
        })),
      });
    },
  };
}

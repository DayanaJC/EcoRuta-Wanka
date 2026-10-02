// Servicio de rutas (RF-03): valida los datos, aplica el factor de tráfico (si está habilitado),
// solicita el orden óptimo a la API de optimización y guarda la ruta.

import {
  BultoNoCabeError,
  CapacidadInsuficienteError,
  ParadaNotFoundError,
  ParadaYaRegistradaError,
  PedidoEnOtraRutaError,
  PedidoNoDisponibleError,
  PedidoNotFoundError,
  RutaEstadoInvalidoError,
  RutaNoOptimizableError,
  RutaNotFoundError,
  RutaSinDatosError,
  VehiculoNoDisponibleError,
  VehiculoNotFoundError,
} from "../errors/errores.js";
import { horaASegundos, horaLocal, hoyEn, instanteLocal, segundosAHora, tipoDia } from "../utils/tiempo.js";
import { bultosQueNoCaben, capacidadVolumenM3, describirBulto } from "./carga.js";
import { programarHorario } from "./optimizacion/horario.js";
import { ESTADOS_TERMINALES } from "./pedido.service.js";

export const HORA_SALIDA_POR_DEFECTO = "08:00";
export const FACTOR_SIN_TRAFICO = 1;
export const ESTADOS_RUTA_ACTIVA = ["generada", "en_reparto"];
// Transiciones permitidas; "completada" también ocurre sola al registrar la última parada
const TRANSICIONES_RUTA = { generada: ["en_reparto", "cancelada"], en_reparto: ["completada", "cancelada"] };
const MOTIVOS_SIMULADOS = ["Cliente ausente", "Local cerrado", "Dirección no encontrada"];
const ETIQUETA_RUTA = { generada: "generada", en_reparto: "en reparto", completada: "completada", cancelada: "cancelada" };

export function crearRutaService(
  { rutas, vehiculos, pedidos, factoresTrafico },
  { optimizador, almacen, zonaHoraria, traficoHabilitado = false, margenVentanaMin = 15, reloj = () => new Date(), aleatorio = Math.random },
) {
  const obtener = async (id) => {
    const ruta = await rutas.getById(id);
    if (!ruta) throw new RutaNotFoundError(`No existe una ruta con id ${id}.`);
    return ruta;
  };

  const pendientes = (ruta) => ruta.paradas.filter((p) => (p.estado ?? "pendiente") === "pendiente");
  const porId = async (ids) => Object.fromEntries((await pedidos.getMuchos(ids)).map((p) => [p.id, p]));
  const dentroVentana = (instante, pedido) => {
    const h = horaLocal(instante, zonaHoraria);
    return h >= pedido.ventana_entrega_inicio && h <= pedido.ventana_entrega_fin;
  };

  // Cambios que produce un conjunto de resultados de parada: la parada, su pedido y,
  // si ya no queda ninguna parada pendiente, el cierre automático de la ruta.
  const cambiosPorResultados = (ruta, pedidosPorId, resultados, cambiosRuta = {}) => {
    const paradas = [];
    const cambiosPedidos = [];
    for (const { parada, resultado, motivo, instante, registrado_por } of resultados) {
      const pedido = pedidosPorId[parada.pedido_id];
      if (resultado === "entregada") {
        paradas.push({
          orden: parada.orden, estado: "entregada", entregado_at: instante.toISOString(),
          dentro_ventana: dentroVentana(instante, pedido), motivo_no_entrega: null, registrado_por,
        });
        cambiosPedidos.push({ id: pedido.id, estado: "entregado", fecha_entrega: instante.toISOString() });
      } else {
        paradas.push({ orden: parada.orden, estado: "no_entregada", entregado_at: null, dentro_ventana: null, motivo_no_entrega: motivo, registrado_por });
        // El pedido vuelve a quedar disponible para planificarlo en otra ruta (si estaba en curso)
        if (pedido?.estado === "en_ruta") cambiosPedidos.push({ id: pedido.id, estado: "pendiente" });
      }
    }
    const resueltas = new Set(resultados.map((r) => r.parada.orden));
    const quedan = pendientes(ruta).filter((p) => !resueltas.has(p.orden)).length;
    const ultimo = resultados.length ? resultados[resultados.length - 1].instante : reloj();
    const datosRuta = quedan === 0 ? { ...cambiosRuta, estado: "completada", completada_at: ultimo.toISOString() } : cambiosRuta;
    return { ruta: datosRuta, paradas, pedidos: cambiosPedidos };
  };

  // Iniciar el reparto: los pedidos pasan a 'en_ruta'; los cancelados antes de salir quedan como no entregados
  const cambiosAlIniciar = (ruta, pedidosPorId, instante) => {
    const enCurso = ["pendiente", "en_ruta"];
    const omitidas = pendientes(ruta)
      .filter((p) => !enCurso.includes(pedidosPorId[p.pedido_id]?.estado))
      .map((parada) => ({ parada, resultado: "no_entregada", motivo: "Pedido cancelado antes de salir", instante, registrado_por: "sistema" }));
    const cambios = cambiosPorResultados(ruta, pedidosPorId, omitidas, { estado: "en_reparto", iniciada_at: instante.toISOString() });
    for (const p of pendientes(ruta)) {
      if (pedidosPorId[p.pedido_id]?.estado === "pendiente") cambios.pedidos.push({ id: p.pedido_id, estado: "en_ruta" });
    }
    return cambios;
  };

  const cambiarEstado = async (id, estado) => {
    const ruta = await obtener(id);
    if (ruta.estado === estado) return ruta;
    if (!(TRANSICIONES_RUTA[ruta.estado] ?? []).includes(estado)) {
      throw new RutaEstadoInvalidoError(`Una ruta ${ETIQUETA_RUTA[ruta.estado]} no puede pasar a '${estado}'.`);
    }
    const pedidosPorId = await porId(ruta.pedido_ids);

    if (estado === "en_reparto") return rutas.aplicarCambios(id, cambiosAlIniciar(ruta, pedidosPorId, reloj()));

    if (estado === "completada") {
      const faltan = pendientes(ruta).length;
      if (faltan) {
        throw new RutaEstadoInvalidoError(`Faltan ${faltan} parada(s) por registrar: marca cada una como entregada o no entregada.`);
      }
      return rutas.aplicarCambios(id, { ruta: { estado: "completada", completada_at: reloj().toISOString() } });
    }

    // Cancelar: los pedidos que aún no se resolvieron vuelven a 'pendiente'
    const liberar = pendientes(ruta)
      .map((p) => pedidosPorId[p.pedido_id])
      .filter((p) => p?.estado === "en_ruta")
      .map((p) => ({ id: p.id, estado: "pendiente" }));
    return rutas.aplicarCambios(id, { ruta: { estado: "cancelada" }, pedidos: liberar });
  };

  return {
    obtener,
    cambiarEstado,
    cancelar: (id) => cambiarEstado(id, "cancelada"),

    // Resultado de una parada registrado en el momento (hoy el operador; en la fase 2, el conductor)
    async registrarEntrega(id, orden, { resultado, motivo }, registrado_por = "operador") {
      const ruta = await obtener(id);
      if (ruta.estado !== "en_reparto") {
        throw new RutaEstadoInvalidoError(`Solo se registran entregas en rutas en reparto (esta ruta está ${ETIQUETA_RUTA[ruta.estado]}).`);
      }
      const parada = ruta.paradas.find((p) => p.orden === Number(orden));
      if (!parada) throw new ParadaNotFoundError(`La ruta no tiene la parada ${orden}.`);
      if ((parada.estado ?? "pendiente") !== "pendiente") {
        throw new ParadaYaRegistradaError(`La parada ${orden} ya fue registrada como '${parada.estado}'.`);
      }
      const pedidosPorId = await porId([parada.pedido_id]);
      return rutas.aplicarCambios(id, cambiosPorResultados(ruta, pedidosPorId, [{ parada, resultado, motivo, instante: reloj(), registrado_por }]));
    },

    // Simulador: inicia la ruta (si hace falta) y registra cada parada pendiente, en orden, a su hora
    // estimada más una desviación aleatoria acumulada. Aplica las mismas reglas que una entrega real.
    async simular(id, { variacion_min = 10, probabilidad_no_entrega = 0 } = {}) {
      let ruta = await obtener(id);
      if (!ESTADOS_RUTA_ACTIVA.includes(ruta.estado)) {
        throw new RutaEstadoInvalidoError(`No se puede simular una ruta ${ETIQUETA_RUTA[ruta.estado]}.`);
      }
      let pedidosPorId = await porId(ruta.pedido_ids);
      if (ruta.estado === "generada") {
        const salida = instanteLocal(ruta.fecha, ruta.hora_salida, zonaHoraria);
        ruta = await rutas.aplicarCambios(id, cambiosAlIniciar(ruta, pedidosPorId, salida));
        if (ruta.estado !== "en_reparto") return ruta;
        pedidosPorId = await porId(ruta.pedido_ids);
      }

      const minuto = 60000;
      let anterior = ruta.iniciada_at ? new Date(ruta.iniciada_at) : instanteLocal(ruta.fecha, ruta.hora_salida, zonaHoraria);
      let deriva = 0;
      const resultados = pendientes(ruta).map((parada) => {
        const pedido = pedidosPorId[parada.pedido_id];
        // La entrega se registra al terminar la atención: llegada estimada + tiempo de servicio
        const estimada = parada.hora_estimada_llegada
          ? instanteLocal(ruta.fecha, parada.hora_estimada_llegada, zonaHoraria).getTime() + (pedido.tiempo_servicio_min ?? 5) * minuto
          : anterior.getTime() + 10 * minuto;
        // Los retrasos se arrastran en parte a la parada siguiente
        deriva = Math.max(-variacion_min, Math.min(variacion_min, deriva * 0.5 + (aleatorio() * 2 - 1) * variacion_min));
        const instante = new Date(Math.max(anterior.getTime() + minuto, estimada + Math.round(deriva) * minuto));
        anterior = instante;
        const falla = aleatorio() < probabilidad_no_entrega;
        return {
          parada, instante, registrado_por: "simulador",
          resultado: falla ? "no_entregada" : "entregada",
          motivo: falla ? MOTIVOS_SIMULADOS[Math.floor(aleatorio() * MOTIVOS_SIMULADOS.length)] : undefined,
        };
      });
      return rutas.aplicarCambios(id, cambiosPorResultados(ruta, pedidosPorId, resultados));
    },

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

      // Un pedido no puede estar pendiente de entrega en dos rutas activas a la vez
      const ocupados = new Set(
        (await rutas.listar())
          .filter((r) => ESTADOS_RUTA_ACTIVA.includes(r.estado))
          .flatMap((r) => pendientes(r).map((p) => p.pedido_id)),
      );
      const enOtraRuta = lista.filter((p) => ocupados.has(p.id) || p.estado === "en_ruta");
      if (enOtraRuta.length) {
        throw new PedidoEnOtraRutaError(
          `Estos pedidos ya están en otra ruta activa: ${enOtraRuta.map((p) => p.cliente_nombre).join(", ")}. Cancela esa ruta o espera a que se resuelvan.`,
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

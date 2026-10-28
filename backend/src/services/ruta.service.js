// Servicio de rutas (RF-03): valida los datos, aplica las preferencias de los clientes (RF-09)
// y el factor de tráfico (si está habilitado), solicita el orden óptimo a la API de optimización
// y guarda la ruta. También re-optimiza el tramo restante ante incidentes (RF-07).

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
  RutaSinPendientesError,
  VehiculoNoDisponibleError,
  VehiculoNotFoundError,
} from "../errors/errores.js";
import { fechaLocal, horaASegundos, horaLocal, hoyEn, instanteLocal, segundosAHora, tipoDia } from "../utils/tiempo.js";
import { aplicarPreferencias, ventanasConPreferencias } from "./cliente.service.js";
import { verificarConductorDisponible } from "./conductor.service.js";
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
// Multiplicador de velocidad del resto del recorrido según el incidente (< 1 = más lento)
export const FACTOR_INCIDENTE = { trafico_intenso: 0.7, via_bloqueada: 0.8, accidente: 0.75, lluvia: 0.85, retraso_vehiculo: 1, otro: 1 };
const FIN_DEL_DIA_S = 24 * 3600 - 60;

// Segundos de manejo planificados de cada tramo (por orden de parada) y del regreso al almacén.
// Las rutas nuevas los guardan (viaje_planificado_s); en las anteriores se derivan del horario:
// llegada = hora de entrega estimada - espera, y el tramo empieza al terminar la parada anterior.
export function tramosPlanificados(ruta, servicioS) {
  let finAnterior = horaASegundos(ruta.hora_salida);
  const viajeS = {};
  for (const p of ruta.paradas) {
    const inicio = p.hora_estimada_llegada ? horaASegundos(p.hora_estimada_llegada) : finAnterior;
    viajeS[p.orden] = p.viaje_planificado_s ?? Math.max(0, inicio - (p.espera_min ?? 0) * 60 - finAnterior);
    finAnterior = inicio + servicioS(p.pedido_id);
  }
  const regresoS = Math.max(0, horaASegundos(ruta.hora_salida) + (ruta.tiempo_estimado_min ?? 0) * 60 - finAnterior);
  return { viajeS, regresoS };
}

export function crearRutaService(
  { rutas, vehiculos, pedidos, factoresTrafico, conductores, clientes },
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

    // Simulador: recorre la ruta tramo a tramo como en la calle. Sale del almacén (con una pequeña
    // demora de carga), maneja cada tramo con el tiempo de manejo planificado afectado por el tráfico,
    // espera si llega antes de que abra la ventana, atiende al cliente y registra la entrega al
    // terminar la atención. Los retrasos se acumulan. La ruta se completa con la última parada y
    // regreso_at guarda la llegada al almacén.
    // Aplica las mismas reglas que una entrega real.
    async simular(id, { imprevistos = false, probabilidad_no_entrega = 0 } = {}) {
      let ruta = await obtener(id);
      if (!ESTADOS_RUTA_ACTIVA.includes(ruta.estado)) {
        throw new RutaEstadoInvalidoError(`No se puede simular una ruta ${ETIQUETA_RUTA[ruta.estado]}.`);
      }
      let pedidosPorId = await porId(ruta.pedido_ids);
      const rango = (min, max) => min + aleatorio() * (max - min);
      // Multiplicadores del tiempo planificado: el tráfico casi nunca hace el viaje más rápido
      const trafico = () => (imprevistos ? rango(1.0, 1.6) : rango(0.95, 1.25));
      const atencion = () => (imprevistos ? rango(0.8, 2.0) : rango(0.8, 1.4));
      const instanteDe = (hhmm) => instanteLocal(ruta.fecha, hhmm, zonaHoraria).getTime();

      if (ruta.estado === "generada") {
        const cargaMin = Math.floor(aleatorio() * 3); // 0 a 2 min terminando de cargar
        const salida = new Date(instanteDe(ruta.hora_salida) + cargaMin * 60000);
        ruta = await rutas.aplicarCambios(id, cambiosAlIniciar(ruta, pedidosPorId, salida));
        if (ruta.estado !== "en_reparto") return ruta;
        pedidosPorId = await porId(ruta.pedido_ids);
      }

      // Tramos planificados (segundos): manejo desde el punto anterior hasta cada parada y el regreso
      const servicioS = (pedidoId) => (pedidosPorId[pedidoId]?.tiempo_servicio_min ?? 5) * 60;
      const { viajeS, regresoS } = tramosPlanificados(ruta, servicioS);

      // El reloj arranca en la salida real, en el último registro o, si la ruta se re-optimizó
      // por un incidente, en la hora desde la que se replanificó (el vehículo estuvo detenido)
      const registros = ruta.paradas.map((p) => p.entregado_at).filter(Boolean).map((t) => new Date(t).getTime());
      const replanificada = ruta.hora_replanificacion ? [instanteDe(ruta.hora_replanificacion)] : [];
      let reloj = Math.max(new Date(ruta.iniciada_at ?? instanteDe(ruta.hora_salida)).getTime(), ...registros, ...replanificada);
      const resultados = [];
      for (const parada of pendientes(ruta)) {
        const pedido = pedidosPorId[parada.pedido_id];
        const llegada = reloj + viajeS[parada.orden] * trafico() * 1000;
        const falla = aleatorio() < probabilidad_no_entrega;
        let instante;
        if (falla) {
          // Llega, intenta contactar al cliente unos minutos y sigue
          instante = llegada + rango(2, 5) * 60000;
        } else {
          const inicio = Math.max(llegada, instanteDe(pedido.ventana_entrega_inicio));
          instante = inicio + servicioS(parada.pedido_id) * atencion() * 1000;
        }
        reloj = Math.round(instante / 1000) * 1000;
        resultados.push({
          parada, instante: new Date(reloj), registrado_por: "simulador",
          resultado: falla ? "no_entregada" : "entregada",
          motivo: falla ? MOTIVOS_SIMULADOS[Math.floor(aleatorio() * MOTIVOS_SIMULADOS.length)] : undefined,
        });
      }
      const cambios = cambiosPorResultados(ruta, pedidosPorId, resultados);
      if (cambios.ruta.estado === "completada") {
        // Tramo de regreso: tiempo de manejo planificado afectado por el tráfico
        const vuelta = Math.round((reloj + regresoS * trafico() * 1000) / 1000) * 1000;
        cambios.ruta.regreso_at = new Date(vuelta).toISOString();
      }
      return rutas.aplicarCambios(id, cambios);
    },

    listar: ({ geometria, ...filtros } = {}) => rutas.listar({ ...filtros, conGeometria: geometria === "true" }),

    // RF-08: asigna (o quita, con null) el conductor de la ruta. Solo en rutas por hacer o en curso;
    // una ruta en reparto puede cambiar de conductor, pero no quedarse sin él.
    async asignarConductor(id, conductor_id) {
      const ruta = await obtener(id);
      if (!ESTADOS_RUTA_ACTIVA.includes(ruta.estado)) {
        throw new RutaEstadoInvalidoError(`No se puede cambiar el conductor de una ruta ${ETIQUETA_RUTA[ruta.estado]}.`);
      }
      if (conductor_id === null) {
        if (ruta.estado === "en_reparto") {
          throw new RutaEstadoInvalidoError("La ruta está en reparto: puedes cambiar el conductor, pero no dejarla sin conductor.");
        }
        return rutas.actualizar(id, { conductor_id: null });
      }
      if (ruta.conductor_id === conductor_id) return ruta;
      await verificarConductorDisponible({ conductores, rutas }, conductor_id, ruta);
      return rutas.actualizar(id, { conductor_id });
    },
    listarPorVehiculo: (vehiculoId) => rutas.listarPorVehiculo(vehiculoId),

    async generar({ vehiculo_id, pedido_ids, fecha, hora_salida, ajustar_salida = true, conductor_id = null }) {
      const vehiculo = await vehiculos.getById(vehiculo_id);
      if (!vehiculo) throw new VehiculoNotFoundError(`No existe un vehículo con id ${vehiculo_id}.`);
      if (vehiculo.estado !== "activo") throw new VehiculoNoDisponibleError(`El vehículo ${vehiculo.placa} no está activo.`);
      const dia = fecha ?? hoyEn(zonaHoraria);
      const salida = hora_salida ?? HORA_SALIDA_POR_DEFECTO;
      // Conductor (opcional): se descarta antes de optimizar si no existe o está inactivo;
      // el cruce de horarios se revisa con la salida y duración ya calculadas.
      if (conductor_id) {
        await verificarConductorDisponible({ conductores, rutas }, conductor_id, null);
      }

      const ids = [...new Set(pedido_ids)];
      if (!ids.length) throw new RutaSinDatosError("No se proporcionaron pedidos para generar la ruta.");

      const encontrados = await pedidos.getMuchos(ids);
      const faltantes = ids.filter((id) => !encontrados.some((p) => p.id === id));
      if (faltantes.length) throw new PedidoNotFoundError(`No existen los pedidos: ${faltantes.join(", ")}.`);
      // Mantener el orden de selección del operador (sirve de referencia)
      let lista = ids.map((id) => encontrados.find((p) => p.id === id));

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

      // RF-09: días de recepción y horario preferido de cada cliente registrado
      lista = await aplicarPreferencias({ clientes }, lista, dia);

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

      const horaSalida = segundosAHora(horario.salida_s);
      const tiempoEstimado = Math.round((horario.fin_s - horario.salida_s) / 60);
      if (conductor_id) {
        await verificarConductorDisponible({ conductores, rutas }, conductor_id, { fecha: dia, hora_salida: horaSalida, tiempo_estimado_min: tiempoEstimado });
      }

      return rutas.crearConParadas({
        vehiculo_id,
        conductor_id,
        fecha: dia,
        hora_disponible: salida,
        hora_salida: horaSalida,
        distancia_estimada_km: Number((resultado.distancia_m / 1000).toFixed(2)),
        distancia_sin_optimizar_km: distanciaSinOptimizar == null ? null : Number((distanciaSinOptimizar / 1000).toFixed(2)),
        tiempo_estimado_min: tiempoEstimado,
        factor_trafico_aplicado: traficoHabilitado ? factor : null,
        geometria: resultado.geometria,
        estado: "generada",
        paradas: horario.paradas.map((p, i) => ({
          orden: i + 1,
          pedido_id: p.id,
          hora_estimada_llegada: segundosAHora(p.entrega_s),
          espera_min: Math.round(p.espera_s / 60),
          viaje_planificado_s: Math.round(resultado.paradas[i].viaje_s),
        })),
      });
    },

    // RF-07: registra un incidente en una ruta en reparto y revisa el resto del recorrido.
    // Proyecta el plan actual con las nuevas condiciones (retraso y velocidad); si alguna entrega
    // pendiente queda fuera de su ventana (o el operador lo pide), re-optimiza las paradas
    // pendientes desde la posición del vehículo. Si no hay afectación, mantiene la planificación.
    async registrarIncidente(id, { tipo, descripcion = "", retraso_min = 0, hora, latitud, longitud, forzar = false }) {
      const ruta = await obtener(id);
      if (ruta.estado !== "en_reparto") {
        throw new RutaEstadoInvalidoError(
          `Solo se registran incidentes en rutas en reparto (esta ruta está ${ETIQUETA_RUTA[ruta.estado]}).` +
            (ruta.estado === "generada" ? " Si cambiaron las condiciones antes de salir, cancela la ruta y genera una nueva." : ""),
        );
      }
      const restantes = pendientes(ruta);
      if (!restantes.length) throw new RutaSinPendientesError("La ruta ya no tiene entregas pendientes.");
      const pedidosPorId = await porId(ruta.pedido_ids);
      const ventanas = await ventanasConPreferencias({ clientes }, restantes.map((p) => pedidosPorId[p.pedido_id]));
      const servicioS = (pedidoId) => (pedidosPorId[pedidoId]?.tiempo_servicio_min ?? 5) * 60;
      const nombre = (pedidoId) => pedidosPorId[pedidoId]?.cliente_nombre ?? "Pedido";

      // Hora del incidente: la indicada, la actual si la ruta es de hoy, o la del último registro.
      // Nunca antes de la salida ni del último registro.
      const atendidas = ruta.paradas.filter((p) => (p.estado ?? "pendiente") !== "pendiente");
      const horaDe = (iso) => horaLocal(new Date(iso), zonaHoraria);
      const minimas = [ruta.hora_salida, ruta.iniciada_at && horaDe(ruta.iniciada_at), ...atendidas.map((p) => p.entregado_at && horaDe(p.entregado_at))];
      const horaActual = fechaLocal(reloj(), zonaHoraria) === ruta.fecha ? horaLocal(reloj(), zonaHoraria) : null;
      const horaRef = [hora ?? horaActual, ...minimas].filter(Boolean).sort().at(-1);
      const inicioS = horaASegundos(horaRef) + retraso_min * 60;
      if (inicioS > FIN_DEL_DIA_S) throw new RutaNoOptimizableError("Con ese retraso el reparto pasaría al día siguiente: no se puede replanificar.");
      const factor = FACTOR_INCIDENTE[tipo] ?? 1;

      // Posición del vehículo: la indicada o la última parada atendida (o el almacén si aún no atendió ninguna)
      const ultima = atendidas.at(-1);
      const posicion = latitud != null ? { latitud, longitud } : ultima ? pedidosPorId[ultima.pedido_id] : almacen;

      // Horario de un orden de paradas desde la hora replanificada (espera si llega antes de la ventana)
      const proyectar = (paradas, regresoS) => {
        let t = inicioS;
        const resultado = paradas.map(({ pedido_id, viaje_s }) => {
          const v = ventanas[pedido_id];
          const llegada = t + viaje_s;
          const entrega = Math.max(llegada, horaASegundos(v.inicio));
          t = entrega + servicioS(pedido_id);
          return { pedido_id, viaje_s, entrega_s: entrega, espera_s: entrega - llegada, tarde: entrega > horaASegundos(v.fin) };
        });
        return { paradas: resultado, fin_s: t + regresoS };
      };
      const describir = (plan) => ({
        paradas: plan.paradas.map((p) => ({ pedido_id: p.pedido_id, cliente: nombre(p.pedido_id), hora: segundosAHora(p.entrega_s), fuera_ventana: p.tarde })),
        regreso: segundosAHora(plan.fin_s),
        fuera_ventana: plan.paradas.filter((p) => p.tarde).map((p) => nombre(p.pedido_id)),
      });

      // El plan actual con las nuevas condiciones: mismos tramos, más lentos según el incidente
      const tramos = tramosPlanificados(ruta, servicioS);
      const actual = proyectar(
        restantes.map((p) => ({ pedido_id: p.pedido_id, viaje_s: tramos.viajeS[p.orden] / factor })),
        tramos.regresoS / factor,
      );
      const incidente = {
        tipo, descripcion, retraso_min, factor_velocidad: factor,
        latitud: posicion.latitud, longitud: posicion.longitud, hora_referencia: horaRef,
      };

      if (!actual.paradas.some((p) => p.tarde) && !forzar) {
        return rutas.replanificar(id, {
          incidente: {
            ...incidente,
            resultado: "sin_cambios",
            resumen: {
              mensaje:
                "El incidente no deja ninguna entrega fuera de su ventana: se mantiene la planificación. " +
                `Regreso al almacén estimado a las ${segundosAHora(actual.fin_s)}.`,
              antes: describir(actual),
              despues: null,
            },
          },
        });
      }

      // Re-optimización del tramo restante: sale de la posición actual a la hora replanificada y vuelve al almacén
      const vehiculo = await vehiculos.getById(ruta.vehiculo_id);
      const lista = restantes.map((p) => ({
        ...pedidosPorId[p.pedido_id],
        ventana_entrega_inicio: ventanas[p.pedido_id].inicio,
        ventana_entrega_fin: ventanas[p.pedido_id].fin,
      }));
      const optimizar = (pedidosRuta) =>
        optimizador.optimizarRuta({ almacen, inicio: posicion, vehiculo, pedidos: pedidosRuta, horaSalida: segundosAHora(inicioS), factorVelocidad: factor });
      let resultado = await optimizar(lista);
      if (resultado.no_asignados.length) {
        // Las que ya no llegan a tiempo se entregan igual (tarde): se relaja su ventana hasta el fin del día
        const tarde = new Set(resultado.no_asignados);
        resultado = await optimizar(lista.map((p) => (tarde.has(p.id) ? { ...p, ventana_entrega_inicio: "00:00", ventana_entrega_fin: "23:59" } : p)));
        if (resultado.no_asignados.length) {
          throw new RutaNoOptimizableError(`No se pudo replanificar la entrega de: ${resultado.no_asignados.map(nombre).join(", ")}.`);
        }
      }
      const nuevo = proyectar(resultado.paradas, resultado.regreso_s);

      // Distancia total = lo ya recorrido (almacén → paradas atendidas → posición) + el tramo replanificado
      let recorridoM = 0;
      if (ultima || latitud != null) {
        // Sin puntos repetidos seguidos (la posición suele ser la última parada atendida)
        const puntos = [almacen, ...atendidas.map((p) => pedidosPorId[p.pedido_id]), posicion].filter(
          (p, i, todos) => i === 0 || p.latitud !== todos[i - 1].latitud || p.longitud !== todos[i - 1].longitud,
        );
        try {
          recorridoM = puntos.length > 1 ? await optimizador.distanciaRecorrido(puntos) : 0;
        } catch {
          recorridoM = null;
        }
      }
      const distancia = recorridoM == null ? ruta.distancia_estimada_km : Number(((recorridoM + resultado.distancia_m) / 1000).toFixed(2));

      const ordenCambiado = restantes.map((p) => p.pedido_id).join() !== resultado.paradas.map((p) => p.pedido_id).join();
      const despues = describir(nuevo);
      return rutas.replanificar(id, {
        ruta: {
          distancia_estimada_km: distancia,
          tiempo_estimado_min: Math.round((nuevo.fin_s - horaASegundos(ruta.hora_salida)) / 60),
          geometria: resultado.geometria,
          reoptimizada_at: reloj().toISOString(),
          hora_replanificacion: segundosAHora(inicioS),
        },
        paradas: [
          ...atendidas.map(({ orden, ...p }, i) => ({ ...p, orden: i + 1 })),
          ...nuevo.paradas.map((p, i) => ({
            orden: atendidas.length + i + 1,
            pedido_id: p.pedido_id,
            hora_estimada_llegada: segundosAHora(p.entrega_s),
            espera_min: Math.round(p.espera_s / 60),
            viaje_planificado_s: Math.round(p.viaje_s),
            estado: "pendiente",
          })),
        ],
        incidente: {
          ...incidente,
          resultado: "reoptimizada",
          resumen: {
            mensaje:
              `Ruta actualizada desde las ${segundosAHora(inicioS)}: ${restantes.length} parada(s) pendiente(s) ` +
              `${ordenCambiado ? "reordenadas" : "en el mismo orden, con nuevos horarios"}. ` +
              `Regreso estimado a las ${despues.regreso} (con el plan anterior: ${segundosAHora(actual.fin_s)}).` +
              (despues.fuera_ventana.length ? ` Llegarán fuera de su ventana: ${despues.fuera_ventana.join(", ")}.` : ""),
            antes: describir(actual),
            despues,
            orden_cambiado: ordenCambiado,
            distancia_antes_km: ruta.distancia_estimada_km,
            distancia_despues_km: distancia,
          },
        },
      });
    },
  };
}

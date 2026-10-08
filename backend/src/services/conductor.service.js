// Servicio de conductores (RF-08): registro y disponibilidad para recibir rutas (RN-009).

import { ConductorConRutasError, ConductorExistenteError, ConductorNoDisponibleError, ConductorNotFoundError } from "../errors/errores.js";
import { horaASegundos, segundosAHora } from "../utils/tiempo.js";

const ESTADOS_RUTA_ACTIVA = ["generada", "en_reparto"];

// Franja horaria planificada de una ruta, en segundos desde las 00:00
const franja = (ruta) => {
  const inicio = horaASegundos(ruta.hora_salida);
  return { inicio, fin: inicio + (ruta.tiempo_estimado_min ?? 0) * 60 };
};
const describirFranja = (ruta) => {
  const { inicio, fin } = franja(ruta);
  return `${segundosAHora(inicio)} a ${segundosAHora(fin)}`;
};

// RN-009: solo un conductor registrado, activo y sin otra ruta activa que se cruce en el
// horario del mismo día puede recibir la ruta. Devuelve el conductor si está disponible.
// Sin ruta (aún no se conoce su horario) solo se comprueba que exista y esté activo.
export async function verificarConductorDisponible({ conductores, rutas }, conductorId, ruta) {
  const conductor = await conductores.getById(conductorId);
  if (!conductor) throw new ConductorNotFoundError(`No existe un conductor con id ${conductorId}.`);
  if (conductor.estado !== "activo") {
    throw new ConductorNoDisponibleError(`El conductor ${conductor.nombre} no está disponible: está inactivo.`);
  }
  if (!ruta) return conductor;
  const propia = franja(ruta);
  const cruce = (await rutas.listar({ desde: ruta.fecha, hasta: ruta.fecha, conductor_id: conductorId })).find((otra) => {
    if (otra.id === ruta.id || !ESTADOS_RUTA_ACTIVA.includes(otra.estado)) return false;
    const f = franja(otra);
    return f.inicio < propia.fin && propia.inicio < f.fin;
  });
  if (cruce) {
    throw new ConductorNoDisponibleError(
      `El conductor ${conductor.nombre} no está disponible: ya tiene una ruta el ${ruta.fecha} de ${describirFranja(cruce)}, ` +
        `que se cruza con esta (${describirFranja(ruta)}).`,
    );
  }
  return conductor;
}

export function crearConductorService({ conductores, rutas }) {
  const obtener = async (id) => {
    const conductor = await conductores.getById(id);
    if (!conductor) throw new ConductorNotFoundError(`No existe un conductor con id ${id}.`);
    return conductor;
  };

  const verificarDniLibre = async (dni, idActual = null) => {
    const existente = await conductores.getByDni(dni);
    if (existente && existente.id !== idActual) {
      throw new ConductorExistenteError(`Ya existe un conductor registrado con el DNI ${dni}.`);
    }
  };

  // Un conductor con rutas por hacer no se desactiva: primero se le quitan o se reasignan
  const verificarSinRutasActivas = async (conductor) => {
    const activas = (await rutas.listar({ conductor_id: conductor.id })).filter((r) => ESTADOS_RUTA_ACTIVA.includes(r.estado));
    if (activas.length) {
      throw new ConductorConRutasError(
        `${conductor.nombre} tiene ${activas.length} ruta(s) generada(s) o en reparto. Asigna otro conductor a esas rutas antes de desactivarlo.`,
      );
    }
  };

  const cambiarEstado = async (id, estado) => {
    const conductor = await obtener(id);
    if (conductor.estado === estado) return conductor;
    if (estado === "inactivo") await verificarSinRutasActivas(conductor);
    return conductores.actualizar(id, { estado });
  };

  return {
    obtener,
    cambiarEstado,
    listar: (filtros) => conductores.listar(filtros),

    async registrar(datos) {
      await verificarDniLibre(datos.dni);
      return conductores.crear(datos);
    },

    async actualizar(id, campos) {
      const conductor = await obtener(id);
      if (campos.dni) await verificarDniLibre(campos.dni, id);
      if (campos.estado === "inactivo" && conductor.estado !== "inactivo") await verificarSinRutasActivas(conductor);
      return conductores.actualizar(id, campos);
    },

    // Eliminación lógica: el conductor queda inactivo
    desactivar: (id) => cambiarEstado(id, "inactivo"),
  };
}

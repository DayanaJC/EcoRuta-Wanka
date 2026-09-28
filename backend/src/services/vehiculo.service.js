// Servicio de vehículos (RF-01): reglas de negocio de la flota.

import { VehiculoExistenteError, VehiculoNotFoundError } from "../errors/errores.js";

export function crearVehiculoService({ vehiculos }) {
  const obtener = async (id) => {
    const vehiculo = await vehiculos.getById(id);
    if (!vehiculo) throw new VehiculoNotFoundError(`No existe un vehículo con id ${id}.`);
    return vehiculo;
  };

  const verificarPlacaLibre = async (placa, idActual = null) => {
    const existente = await vehiculos.getByPlaca(placa);
    if (existente && existente.id !== idActual) {
      throw new VehiculoExistenteError(`Ya existe un vehículo registrado con la placa ${placa}.`);
    }
  };

  return {
    obtener,

    listar: (filtros) => vehiculos.listar(filtros),

    async registrar(datos) {
      await verificarPlacaLibre(datos.placa);
      return vehiculos.crear(datos);
    },

    async actualizar(id, campos) {
      await obtener(id);
      if (campos.placa) await verificarPlacaLibre(campos.placa, id);
      return vehiculos.actualizar(id, campos);
    },

    async cambiarEstado(id, estado) {
      await obtener(id);
      return vehiculos.actualizar(id, { estado });
    },

    // Eliminación lógica: el vehículo queda inactivo
    async desactivar(id) {
      await obtener(id);
      return vehiculos.actualizar(id, { estado: "inactivo" });
    },
  };
}

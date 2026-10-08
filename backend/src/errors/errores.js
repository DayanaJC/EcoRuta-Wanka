// Errores de dominio. Cada uno lleva el código HTTP con el que el
// controlador de errores responde, así los servicios no conocen HTTP
// pero la traducción queda en un solo lugar.

export class ErrorDominio extends Error {
  constructor(mensaje, status) {
    super(mensaje);
    this.name = this.constructor.name;
    this.status = status;
  }
}

class NoEncontrado extends ErrorDominio {
  constructor(mensaje) {
    super(mensaje, 404);
  }
}

class Conflicto extends ErrorDominio {
  constructor(mensaje) {
    super(mensaje, 409);
  }
}

class NoProcesable extends ErrorDominio {
  constructor(mensaje) {
    super(mensaje, 422);
  }
}

// Vehículos (RF-01)
export class VehiculoNotFoundError extends NoEncontrado {}
export class VehiculoExistenteError extends Conflicto {}

// Pedidos (RF-02)
export class PedidoNotFoundError extends NoEncontrado {}
export class PedidoEstadoInvalidoError extends Conflicto {}
export class VentanaEntregaInvalidaError extends NoProcesable {}

// Asignaciones
export class AsignacionNotFoundError extends NoEncontrado {}
export class PedidoNoDisponibleError extends Conflicto {}
export class VehiculoNoDisponibleError extends Conflicto {}
export class CapacidadInsuficienteError extends Conflicto {}
export class PedidoYaAsignadoError extends Conflicto {}
export class BultoNoCabeError extends Conflicto {}

// Rutas (RF-03)
export class RutaNotFoundError extends NoEncontrado {}
export class RutaSinDatosError extends NoProcesable {}
export class RutaNoOptimizableError extends NoProcesable {}
export class RutaEstadoInvalidoError extends Conflicto {}
export class PedidoEnOtraRutaError extends Conflicto {}

// Conductores (RF-08)
export class ConductorNotFoundError extends NoEncontrado {}
export class ConductorExistenteError extends Conflicto {}
export class ConductorNoDisponibleError extends Conflicto {}
export class ConductorConRutasError extends Conflicto {}

// Indicadores y reportes de sostenibilidad (RF-05, RF-06)
export class PeriodoInvalidoError extends NoProcesable {}
export class SinDatosError extends NoEncontrado {}

// Entregas (resultado de cada parada)
export class ParadaNotFoundError extends NoEncontrado {}
export class ParadaYaRegistradaError extends Conflicto {}

// Servicio externo de optimización
export class OptimizacionNoConfiguradaError extends ErrorDominio {
  constructor(mensaje) {
    super(mensaje, 503);
  }
}
export class OptimizacionExternaError extends ErrorDominio {
  constructor(mensaje) {
    super(mensaje, 502);
  }
}

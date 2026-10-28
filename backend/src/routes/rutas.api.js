// Definición de los endpoints de la API REST (/api/v1).

import { Router } from "express";
import { validar } from "../middlewares/validar.js";
import * as e from "../schemas/esquemas.js";

export function crearRouterApi(c) {
  const api = Router();

  const vehiculos = Router();
  vehiculos.post("/", validar(e.vehiculoCrear), c.vehiculos.crear);
  vehiculos.get("/", validar(e.filtroVehiculos, "query"), c.vehiculos.listar);
  vehiculos.get("/:id", c.vehiculos.obtener);
  vehiculos.put("/:id", validar(e.vehiculoActualizar), c.vehiculos.actualizar);
  vehiculos.patch("/:id/estado", validar(e.cambiarEstadoVehiculo), c.vehiculos.cambiarEstado);
  vehiculos.delete("/:id", c.vehiculos.desactivar);

  const conductores = Router();
  conductores.post("/", validar(e.conductorCrear), c.conductores.crear);
  conductores.get("/", validar(e.filtroConductores, "query"), c.conductores.listar);
  conductores.get("/:id", c.conductores.obtener);
  conductores.put("/:id", validar(e.conductorActualizar), c.conductores.actualizar);
  conductores.patch("/:id/estado", validar(e.cambiarEstadoConductor), c.conductores.cambiarEstado);
  conductores.delete("/:id", c.conductores.desactivar);

  // Clientes/bodegas y sus preferencias de entrega (RF-09)
  const clientes = Router();
  clientes.post("/", validar(e.clienteCrear), c.clientes.crear);
  clientes.get("/", validar(e.filtroClientes, "query"), c.clientes.listar);
  clientes.get("/:id", c.clientes.obtener);
  clientes.put("/:id", validar(e.clienteActualizar), c.clientes.actualizar);
  clientes.patch("/:id/estado", validar(e.cambiarEstadoCliente), c.clientes.cambiarEstado);

  const pedidos = Router();
  pedidos.post("/", validar(e.pedidoCrear), c.pedidos.crear);
  pedidos.get("/", validar(e.filtroPedidos, "query"), c.pedidos.listar);
  pedidos.get("/:id", c.pedidos.obtener);
  pedidos.put("/:id", validar(e.pedidoActualizar), c.pedidos.actualizar);
  pedidos.patch("/:id/estado", validar(e.cambiarEstadoPedido), c.pedidos.cambiarEstado);
  pedidos.delete("/:id", c.pedidos.cancelar);

  const asignaciones = Router();
  asignaciones.post("/", validar(e.asignacionCrear), c.asignaciones.crear);
  asignaciones.get("/", c.asignaciones.listar);
  asignaciones.get("/pedido/:id", c.asignaciones.listarPorPedido);
  asignaciones.get("/vehiculo/:id", c.asignaciones.listarPorVehiculo);
  asignaciones.get("/:id", c.asignaciones.obtener);
  asignaciones.delete("/:id", c.asignaciones.cancelar);

  const rutas = Router();
  rutas.post("/", validar(e.rutaCrear), c.rutas.generar);
  rutas.get("/", validar(e.filtroRutas, "query"), c.rutas.listar);
  rutas.get("/vehiculo/:id", c.rutas.listarPorVehiculo);
  rutas.get("/:id", c.rutas.obtener);
  rutas.patch("/:id/estado", validar(e.cambiarEstadoRuta), c.rutas.cambiarEstado);
  // Resultado de una parada (entregada / no entregada) y simulación del reparto completo
  rutas.patch("/:id/paradas/:orden", validar(e.registrarEntrega), c.rutas.registrarEntrega);
  rutas.post("/:id/simular", validar(e.simularReparto), c.rutas.simular);
  // Conductor de la ruta (RF-08); { conductor_id: null } lo quita
  rutas.patch("/:id/conductor", validar(e.asignarConductor), c.rutas.asignarConductor);
  // Incidente durante el reparto: revisa la ruta y la re-optimiza si hace falta (RF-07)
  rutas.post("/:id/incidentes", validar(e.registrarIncidente), c.rutas.registrarIncidente);
  rutas.delete("/:id", c.rutas.cancelar);

  const factores = Router();
  factores.get("/", c.factoresTrafico.listar);

  api.get("/geocodificar", validar(e.busquedaDireccion, "query"), c.geocodificar);
  // Dirección de un punto marcado en el mapa
  api.get("/geocodificar/inversa", validar(e.puntoMapa, "query"), c.geocodificarInversa);

  // Sostenibilidad (RF-05 y RF-06): mismos filtros para el dashboard y el PDF
  api.get("/indicadores", validar(e.filtroIndicadores, "query"), c.indicadores);
  api.get("/reportes/sostenibilidad.pdf", validar(e.filtroIndicadores, "query"), c.reporteSostenibilidad);

  api.use("/vehiculos", vehiculos);
  api.use("/conductores", conductores);
  api.use("/clientes", clientes);
  api.use("/pedidos", pedidos);
  api.use("/asignaciones", asignaciones);
  api.use("/rutas", rutas);
  api.use("/factores-trafico", factores);
  return api;
}

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
  rutas.get("/", c.rutas.listar);
  rutas.get("/vehiculo/:id", c.rutas.listarPorVehiculo);
  rutas.get("/:id", c.rutas.obtener);
  rutas.patch("/:id/estado", validar(e.cambiarEstadoRuta), c.rutas.cambiarEstado);
  // Resultado de una parada (entregada / no entregada) y simulación del reparto completo
  rutas.patch("/:id/paradas/:orden", validar(e.registrarEntrega), c.rutas.registrarEntrega);
  rutas.post("/:id/simular", validar(e.simularReparto), c.rutas.simular);
  rutas.delete("/:id", c.rutas.cancelar);

  const factores = Router();
  factores.get("/", c.factoresTrafico.listar);

  api.get("/geocodificar", validar(e.busquedaDireccion, "query"), c.geocodificar);

  api.use("/vehiculos", vehiculos);
  api.use("/pedidos", pedidos);
  api.use("/asignaciones", asignaciones);
  api.use("/rutas", rutas);
  api.use("/factores-trafico", factores);
  return api;
}

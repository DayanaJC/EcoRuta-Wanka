// Controladores (MVC): traducen HTTP <-> servicios. No contienen reglas de negocio.
// Express 5 envía automáticamente al manejador de errores las promesas rechazadas.

export function crearControladores(servicios) {
  const { vehiculos, pedidos, asignaciones, rutas, factoresTrafico, geocodificador, salud } = servicios;
  const creado = (res, datos) => res.status(201).json(datos);

  return {
    vehiculos: {
      crear: async (req, res) => creado(res, await vehiculos.registrar(req.valido)),
      listar: async (req, res) => res.json(await vehiculos.listar(req.valido)),
      obtener: async (req, res) => res.json(await vehiculos.obtener(req.params.id)),
      actualizar: async (req, res) => res.json(await vehiculos.actualizar(req.params.id, req.valido)),
      cambiarEstado: async (req, res) => res.json(await vehiculos.cambiarEstado(req.params.id, req.valido.estado)),
      desactivar: async (req, res) => res.json(await vehiculos.desactivar(req.params.id)),
    },

    pedidos: {
      crear: async (req, res) => creado(res, await pedidos.registrar(req.valido)),
      listar: async (req, res) => res.json(await pedidos.listar(req.valido)),
      obtener: async (req, res) => res.json(await pedidos.obtener(req.params.id)),
      actualizar: async (req, res) => res.json(await pedidos.actualizar(req.params.id, req.valido)),
      cambiarEstado: async (req, res) => res.json(await pedidos.cambiarEstado(req.params.id, req.valido.estado)),
      cancelar: async (req, res) => res.json(await pedidos.cancelar(req.params.id)),
    },

    asignaciones: {
      crear: async (req, res) => creado(res, await asignaciones.asignar(req.valido)),
      listar: async (req, res) => res.json(await asignaciones.listar()),
      listarPorPedido: async (req, res) => res.json(await asignaciones.listarPorPedido(req.params.id)),
      listarPorVehiculo: async (req, res) => res.json(await asignaciones.listarPorVehiculo(req.params.id)),
      obtener: async (req, res) => res.json(await asignaciones.obtener(req.params.id)),
      cancelar: async (req, res) => res.json(await asignaciones.cancelar(req.params.id)),
    },

    rutas: {
      generar: async (req, res) => creado(res, await rutas.generar(req.valido)),
      listar: async (req, res) => res.json(await rutas.listar()),
      listarPorVehiculo: async (req, res) => res.json(await rutas.listarPorVehiculo(req.params.id)),
      obtener: async (req, res) => res.json(await rutas.obtener(req.params.id)),
      cambiarEstado: async (req, res) => res.json(await rutas.cambiarEstado(req.params.id, req.valido.estado)),
      cancelar: async (req, res) => res.json(await rutas.cancelar(req.params.id)),
    },

    factoresTrafico: {
      listar: async (req, res) => res.json(await factoresTrafico.listar()),
    },

    geocodificar: async (req, res) => res.json(await geocodificador.buscar(req.valido.q)),

    salud: async (req, res) => {
      const estado = await salud.verificar();
      res.status(estado.status === "ok" ? 200 : 503).json(estado);
    },
  };
}

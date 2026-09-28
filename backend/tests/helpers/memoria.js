// Repositorios en memoria con el mismo contrato que los de Prisma.
// Permiten probar servicios y endpoints sin conexión a Neon.

import { randomUUID } from "node:crypto";
import { capacidadVolumenM3 } from "../../src/services/carga.js";

const ahora = () => new Date().toISOString();

function tabla() {
  const filas = new Map();
  return {
    filas,
    getById: async (id) => (filas.has(id) ? { ...filas.get(id) } : null),
    crear: async (datos) => {
      const fila = { id: randomUUID(), ...datos, created_at: ahora(), updated_at: ahora() };
      filas.set(fila.id, fila);
      return { ...fila };
    },
    actualizar: async (id, campos) => {
      const fila = { ...filas.get(id), ...campos, updated_at: ahora() };
      filas.set(id, fila);
      return { ...fila };
    },
    todas: () => [...filas.values()].map((f) => ({ ...f })),
  };
}

export function crearRepositoriosMemoria() {
  const v = tabla();
  const p = tabla();
  const a = tabla();
  const r = tabla();
  const factores = [];

  return {
    vehiculos: {
      ...v,
      // Igual que el repositorio real: expone el volumen útil calculado
      crear: async (datos) => v.crear({ aprovechamiento_pct: 80, ...datos, capacidad_volumen_m3: capacidadVolumenM3({ aprovechamiento_pct: 80, ...datos }) }),
      getByPlaca: async (placa) => v.todas().find((x) => x.placa === placa) ?? null,
      listar: async ({ estado } = {}) => v.todas().filter((x) => !estado || x.estado === estado),
    },
    pedidos: {
      ...p,
      crear: (datos) => p.crear({ punto_referencia: "", tiempo_servicio_min: 5, estado: "pendiente", ...datos }),
      getMuchos: async (ids) => p.todas().filter((x) => ids.includes(x.id)),
      listar: async ({ estado, prioridad, busqueda } = {}) => {
        const texto = busqueda?.trim().toLowerCase();
        return p
          .todas()
          .filter((x) => !estado || x.estado === estado)
          .filter((x) => !prioridad || x.prioridad === prioridad)
          .filter((x) => !texto || [x.cliente_id, x.cliente_nombre, x.direccion, x.punto_referencia].join(" ").toLowerCase().includes(texto));
      },
    },
    asignaciones: {
      ...a,
      crear: (datos) => a.crear({ fecha_asignacion: ahora(), ...datos }),
      listar: async () => a.todas(),
      getByPedidoId: async (id) => a.todas().filter((x) => x.pedido_id === id),
      getByVehiculoId: async (id) => a.todas().filter((x) => x.vehiculo_id === id),
    },
    rutas: {
      ...r,
      listar: async () => r.todas(),
      listarPorVehiculo: async (id) => r.todas().filter((x) => x.vehiculo_id === id),
      crearConParadas: async (datos) => r.crear({ ...datos, pedido_ids: datos.paradas.map((x) => x.pedido_id) }),
    },
    factoresTrafico: {
      agregar: (f) => factores.push(f),
      listar: async () => [...factores],
      buscar: async (tipo_dia, hhmm) =>
        factores.find((f) => f.tipo_dia === tipo_dia && f.hora_inicio <= hhmm && hhmm < f.hora_fin) ?? null,
    },
    salud: { ping: async () => 1 },
  };
}

// Optimizador simulado: visita los pedidos en orden inverso, con 10 min de manejo
// por tramo (incluido el regreso), y registra la última llamada
export function crearOptimizadorFalso({ noAsignar = [] } = {}) {
  return {
    configurado: true,
    ultimaLlamada: null,
    async optimizarRuta(datos) {
      this.ultimaLlamada = datos;
      const asignables = datos.pedidos.filter((p) => !noAsignar.includes(p.id)).reverse();
      return {
        paradas: asignables.map((p) => ({ pedido_id: p.id, viaje_s: 600 })),
        regreso_s: 600,
        no_asignados: datos.pedidos.filter((p) => noAsignar.includes(p.id)).map((p) => p.id),
        distancia_m: 12345,
        geometria: [[-12.06, -75.2], [-12.07, -75.21]],
      };
    },
  };
}

export const vehiculoValido = (extra = {}) => ({
  placa: "ABC-123",
  tipo: "camioneta",
  capacidad_carga_kg: 1000,
  consumo_combustible_l100km: 12,
  factor_emision_co2_kg_l: 2.31,
  anio_fabricacion: 2020,
  largo_util_cm: 220,
  ancho_util_cm: 150,
  alto_util_cm: 120,
  ...extra,
});

export const pedidoValido = (extra = {}) => ({
  cliente_id: "CLI-0001",
  cliente_nombre: "Bodega San Carlos",
  direccion: "Jr. Puno 450, Huancayo",
  latitud: -12.0668,
  longitud: -75.206,
  bultos: [{ descripcion: "Caja", cantidad: 1, largo_cm: 50, ancho_cm: 40, alto_cm: 30, peso_kg: 120 }],
  ventana_entrega_inicio: "08:00",
  ventana_entrega_fin: "12:00",
  prioridad: "estandar",
  tipo_producto: "no_perecedero",
  ...extra,
});

// Pruebas de la programación del horario y de la salida óptima.

import { describe, expect, it } from "vitest";
import { programarHorario } from "../src/services/optimizacion/horario.js";

const h = (hhmm) => {
  const [a, b] = hhmm.split(":").map(Number);
  return a * 3600 + b * 60;
};
const min = (n) => n * 60;
const parada = (id, viaje, inicio, fin, servicio = 5) => ({
  id,
  viaje_s: min(viaje),
  servicio_s: min(servicio),
  ventana_inicio_s: h(inicio),
  ventana_fin_s: h(fin),
});

describe("programarHorario", () => {
  // Caso real auditado: Panadería (08:00–12:00) y Ocopilla (13:00–17:00)
  const paradas = [parada("panaderia", 2, "08:00", "12:00"), parada("ocopilla", 5, "13:00", "17:00")];

  it("sin ajuste, sale a la hora disponible y espera en la calle", () => {
    const r = programarHorario({ disponible_s: h("08:00"), paradas, regreso_s: min(4), ajustarSalida: false });
    expect(r.salida_s).toBe(h("08:00"));
    expect(r.paradas[0].entrega_s).toBe(h("08:02"));
    expect(r.paradas[1]).toMatchObject({ entrega_s: h("13:00"), espera_s: h("13:00") - h("08:12") });
    expect(r.fin_s - r.salida_s).toBe(min(309));
  });

  it("retrasa la salida para entregar 15 min antes del cierre y reduce la duración", () => {
    const r = programarHorario({ disponible_s: h("08:00"), paradas, regreso_s: min(4) });
    // La panadería debe entregarse como tarde a las 11:45 (12:00 - 15 min)
    expect(r.salida_s).toBe(h("11:43"));
    expect(r.paradas[0].entrega_s).toBe(h("11:45"));
    expect(r.paradas[1].entrega_s).toBe(h("13:00"));
    expect(r.espera_evitada_s).toBe(h("11:43") - h("08:00"));
    expect(r.fin_s - r.salida_s).toBe(min(86)); // 1 h 26 min en lugar de 5 h 09 min
  });

  it("no retrasa más que la espera total (no tendría beneficio)", () => {
    const r = programarHorario({
      disponible_s: h("08:00"),
      paradas: [parada("a", 10, "09:00", "18:00"), parada("b", 10, "08:00", "18:00")],
      regreso_s: min(10),
    });
    // Llegaría a "a" a las 08:10 y esperaría 50 min: sale a las 08:50
    expect(r.salida_s).toBe(h("08:50"));
    expect(r.paradas.map((p) => p.espera_s)).toEqual([0, 0]);
  });

  it("no retrasa si no hay esperas", () => {
    const r = programarHorario({ disponible_s: h("08:00"), paradas: [parada("a", 10, "08:00", "12:00")], regreso_s: min(10) });
    expect(r.salida_s).toBe(h("08:00"));
    expect(r.espera_evitada_s).toBe(0);
  });

  it("una espera anterior absorbe el retraso: la parada siguiente no empeora", () => {
    const r = programarHorario({
      disponible_s: h("08:00"),
      paradas: [parada("a", 10, "10:00", "18:00"), parada("b", 10, "08:00", "10:30")],
      regreso_s: min(10),
    });
    // Sin ajuste: llega a "a" 08:10 y espera hasta 10:00; "b" a las 10:15.
    // Salir a las 09:50 elimina la espera y "b" sigue a las 10:15.
    expect(r.salida_s).toBe(h("09:50"));
    expect(r.paradas[1].entrega_s).toBe(h("10:15"));
  });

  it("una parada ajustada ANTES de la espera impide retrasar la salida", () => {
    const r = programarHorario({
      disponible_s: h("08:00"),
      paradas: [parada("a", 10, "08:00", "18:00"), parada("b", 10, "08:00", "08:40"), parada("c", 10, "10:00", "18:00")],
      regreso_s: min(10),
    });
    // "b" se entrega a las 08:25 = cierre (08:40) - margen: no admite retraso
    // aunque luego se espere 80 min en "c"
    expect(r.salida_s).toBe(h("08:00"));
    expect(r.paradas[1].entrega_s).toBe(h("08:25"));
    expect(r.paradas[2].espera_s).toBe(min(80));
  });

  it("no empeora una entrega que ya estaba dentro del margen", () => {
    const r = programarHorario({
      disponible_s: h("08:00"),
      paradas: [parada("a", 115, "08:00", "10:00")], // entrega 09:55, dentro de los 15 min finales
      regreso_s: min(10),
    });
    expect(r.salida_s).toBe(h("08:00"));
  });
});

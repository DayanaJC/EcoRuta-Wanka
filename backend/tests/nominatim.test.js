import { describe, expect, it } from "vitest";
import { crearGeocodificador, direccionCorta } from "../src/services/geocodificacion/nominatim.client.js";

// Respuestas reales de Nominatim para Huancayo (recortadas)
const FERROCARRIL = {
  display_name: "Avenida Ferrocarril, San Carlos, Huancayo, Junín, 12001, Perú",
  address: { road: "Avenida Ferrocarril", suburb: "San Carlos", city: "Huancayo", state: "Junín" },
  lat: "-12.0668", lon: "-75.2060",
};
const PUNO = {
  display_name: "Jirón Puno, San José, Hualmitá, San Carlos, Huancayo, Junín, 12001, Perú",
  address: { road: "Jirón Puno", neighbourhood: "San José", quarter: "Hualmitá", suburb: "San Carlos", city: "Huancayo" },
  lat: "-12.0611", lon: "-75.2010",
};

describe("dirección corta (Nominatim)", () => {
  it("arma vía, zona y ciudad", () => {
    expect(direccionCorta(FERROCARRIL)).toBe("Avenida Ferrocarril, San Carlos, Huancayo");
    expect(direccionCorta(PUNO)).toBe("Jirón Puno, San José, Huancayo");
  });

  it("incluye el número y el nombre del lugar", () => {
    expect(direccionCorta({ name: "Mercado Modelo", address: { road: "Jirón Ica", house_number: "450", city: "Huancayo" } })).toBe(
      "Mercado Modelo, Jirón Ica 450, Huancayo",
    );
  });

  it("sin datos de dirección usa el inicio del nombre completo", () => {
    expect(direccionCorta({ display_name: "Pilcomayo, Huancayo, Junín, Perú", address: {} })).toBe("Pilcomayo, Huancayo, Junín");
  });

  it("la búsqueda inversa devuelve la dirección corta o null", async () => {
    const respuestas = [FERROCARRIL, { error: "Unable to geocode" }];
    const fetchImpl = async () => ({ ok: true, json: async () => respuestas.shift() });
    const geo = crearGeocodificador({ fetchImpl, intervaloMs: 0 });
    expect(await geo.invertir(-12.0668, -75.206)).toMatchObject({ direccion: "Avenida Ferrocarril, San Carlos, Huancayo", latitud: -12.0668 });
    expect(await geo.invertir(0, 0)).toBeNull();
  });
});

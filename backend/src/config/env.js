// Configuración leída de variables de entorno (ver backend/.env.example).

const numero = (valor, porDefecto) => {
  const n = Number(valor);
  return Number.isFinite(n) ? n : porDefecto;
};

export const config = {
  puerto: numero(process.env.PORT, 4000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL,
  orsApiKey: process.env.ORS_API_KEY?.trim() || null,
  // Punto de salida y regreso de los vehículos (almacén de WankaLogística S.A.C.).
  // Valor por defecto referencial: Plaza de la Constitución, Huancayo.
  almacen: {
    nombre: process.env.ALMACEN_NOMBRE || "Almacén WankaLogística",
    latitud: numero(process.env.ALMACEN_LATITUD, -12.0681),
    longitud: numero(process.env.ALMACEN_LONGITUD, -75.2104),
  },
  zonaHoraria: "America/Lima",
  // Factores de tráfico por franja horaria: preparados, pero deshabilitados hasta su implementación
  traficoHabilitado: process.env.TRAFICO_HABILITADO === "true",
  // Minutos antes del cierre de cada ventana que se reservan como margen al ajustar la salida
  margenVentanaMin: numero(process.env.MARGEN_VENTANA_MIN, 15),
};

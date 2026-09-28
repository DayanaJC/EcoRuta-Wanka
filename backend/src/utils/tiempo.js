// Conversión entre los formatos de la API ("HH:MM", "YYYY-MM-DD")
// y los tipos TIME / DATE de PostgreSQL, que Prisma maneja como Date en UTC.

export const PATRON_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
export const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/;

export const horaADate = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(1970, 0, 1, h, m));
};

export const dateAHora = (fecha) =>
  fecha ? `${String(fecha.getUTCHours()).padStart(2, "0")}:${String(fecha.getUTCMinutes()).padStart(2, "0")}` : null;

export const fechaADate = (yyyymmdd) => new Date(`${yyyymmdd}T00:00:00Z`);

export const dateAFecha = (fecha) => (fecha ? fecha.toISOString().slice(0, 10) : null);

export const horaASegundos = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 3600 + m * 60;
};

export const segundosAHora = (seg) => {
  const min = Math.round(seg / 60);
  return `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
};

// Fecha de hoy en la zona horaria indicada, como "YYYY-MM-DD"
export const hoyEn = (zonaHoraria) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: zonaHoraria, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

// "laborable" (lunes a viernes) o "fin_semana"
export const tipoDia = (yyyymmdd) => {
  const dia = fechaADate(yyyymmdd).getUTCDay();
  return dia === 0 || dia === 6 ? "fin_semana" : "laborable";
};

export const ahoraIso = () => new Date().toISOString();

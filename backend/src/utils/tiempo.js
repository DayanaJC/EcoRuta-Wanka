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

// Desfase (en minutos) de una zona horaria respecto a UTC en un instante dado
const desfaseMin = (instante, zonaHoraria) => {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: zonaHoraria, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    }).formatToParts(instante).map((p) => [p.type, p.value]),
  );
  const comoUtc = Date.UTC(+partes.year, +partes.month - 1, +partes.day, +partes.hour, +partes.minute);
  return Math.round((comoUtc - Math.floor(instante.getTime() / 60000) * 60000) / 60000);
};

// Instante (Date) que corresponde a "YYYY-MM-DD" + "HH:MM" en la hora local de la zona
export const instanteLocal = (yyyymmdd, hhmm, zonaHoraria) => {
  const comoUtc = new Date(`${yyyymmdd}T${hhmm}:00Z`);
  return new Date(comoUtc.getTime() - desfaseMin(comoUtc, zonaHoraria) * 60000);
};

// Hora local "HH:MM" de un instante en la zona indicada
export const horaLocal = (instante, zonaHoraria) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: zonaHoraria, hourCycle: "h23", hour: "2-digit", minute: "2-digit" }).format(instante);

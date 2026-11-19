// Límite simple de peticiones por IP (en memoria, por instancia). Suficiente para frenar
// que alguien recorra la consulta pública probando teléfonos o documentos uno tras otro.

export function limitarPorIp({ maximo, ventanaMs }) {
  const visitas = new Map();
  return (req, res, next) => {
    const ahora = Date.now();
    const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip || "local";
    const registro = visitas.get(ip);
    if (!registro || ahora - registro.inicio > ventanaMs) {
      visitas.set(ip, { inicio: ahora, total: 1 });
      if (visitas.size > 5000) visitas.clear();
      return next();
    }
    registro.total += 1;
    if (registro.total > maximo) {
      res.set("Retry-After", String(Math.ceil((registro.inicio + ventanaMs - ahora) / 1000)));
      return res.status(429).json({ detail: "Demasiadas consultas seguidas. Espera un minuto e inténtalo de nuevo." });
    }
    next();
  };
}

// Traduce los errores a respuestas HTTP con el formato { detail } que usa el frontend.

import { ErrorDominio } from "../errors/errores.js";

export function rutaNoEncontrada(req, res) {
  res.status(404).json({ detail: `No existe el recurso ${req.method} ${req.originalUrl}.` });
}

// eslint-disable-next-line no-unused-vars
export function manejarErrores(err, req, res, next) {
  if (err instanceof ErrorDominio) return res.status(err.status).json({ detail: err.message });
  if (err?.type === "entity.parse.failed") return res.status(400).json({ detail: "El cuerpo de la petición no es un JSON válido." });
  console.error("[error]", err);
  res.status(500).json({ detail: "Error interno del servidor." });
}

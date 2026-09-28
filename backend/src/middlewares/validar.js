// Valida req.body o req.query con un esquema Zod y deja el resultado en req.valido.
// Si falla, responde 422 con el mismo formato { detail } que el resto de errores.

export const validar = (esquema, origen = "body") => (req, res, next) => {
  const resultado = esquema.safeParse(req[origen] ?? {});
  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((i) => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message))
      .join(" · ");
    return res.status(422).json({ detail: detalle, errores: resultado.error.issues });
  }
  req.valido = resultado.data;
  next();
};

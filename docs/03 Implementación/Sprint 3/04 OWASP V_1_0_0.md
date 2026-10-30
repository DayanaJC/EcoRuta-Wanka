# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 04. Reporte de Seguridad OWASP Top 10 (2025) V_1_0_0

**Versión:** V_1_0_0 | **Fecha:** 30/10/2026 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Nombre del Proyecto:** EcoRuta Wanka
**Herramienta de Escaneo:** SonarQube Cloud (perfil "Sonar way"), complementado con `npm audit` para las dependencias y revisión manual del código.

**Qué se revisó:** rama `main`, versión `e8e117f` (cierre del Sprint 3), backend (`backend/`, Node.js + Express + Prisma) y frontend (`frontend/`, Next.js). Las correcciones de este reporte se aplicaron en la rama `docs/sprint-3-owasp-wcag`.

---

## 1. Matriz de Cumplimiento OWASP Top 10 2025

SonarQube Cloud reportó en la calificación de **Seguridad: B**, con **1 vulnerabilidad** abierta, **0 Security Hotspots** y **31 riesgos en dependencias** (calificación C). Como SonarQube solo detecta lo que se puede ver en el código, cada categoría se revisó además a mano.

| Categoría OWASP 2025 | Estado en Proyecto (Limpio / Vulnerable / Bajo Revisión) | Hallazgos de SonarQube |
|---|---|---|
| A01:2025-Broken Access Control | **Vulnerable** | Sin hallazgos de SonarQube. Revisión manual: la API no tiene autenticación ni control por roles; cualquiera que conozca la URL puede leer y modificar pedidos, rutas y conductores. RN-001 y RNF-02 exigen acceso por rol, pero el módulo de usuarios aún no se implementa. CORS restringido a los orígenes del frontend (no reemplaza al control de acceso). |
| A02:2025-Cryptographic Failures | **Limpio** | Sin hallazgos. Todo el tráfico va por HTTPS (Vercel) y la conexión a Neon usa `sslmode=require&channel_binding=require`. Las credenciales (`DATABASE_URL`, `ORS_API_KEY`) están en variables de entorno y `.env` está en `.gitignore`. No se guardan contraseñas (aún no hay usuarios). |
| A03:2025-Injection | **Limpio** | Sin hallazgos. Todo acceso a datos pasa por Prisma (consultas parametrizadas); el único SQL directo es `SELECT 1` del health check, sin datos del usuario. Las entradas se validan con esquemas Zod (`middlewares/validar.js`) y React escapa el contenido al pintarlo (no se usa `dangerouslySetInnerHTML`). |
| A04:2025-Insecure Design | **Bajo Revisión** | Sin hallazgos. A favor: reglas de negocio validadas en el servidor (capacidad, ventanas horarias, RN-009), límite de 100 kB en el cuerpo JSON, Nominatim limitado a 1 consulta/s. Pendiente: no hay límite de peticiones por cliente (rate limiting) en los endpoints que llaman a OpenRouteService, que consumen la cuota gratuita de la API. |
| A05:2025-Security Misconfiguration | **Limpio** (corregido) | **1 vulnerabilidad (severidad baja):** la cabecera `X-Powered-By: Express` revelaba la tecnología del servidor (`backend/src/server.js`). Revisión manual: `/health` devolvía el mensaje de error interno de la base de datos. Ambos corregidos (ver Hotspot #1 y #2). |
| A06:2025-Vulnerable and Outdated Components | **Limpio** (corregido) | **31 riesgos en dependencias** (calificación C). `npm audit` confirmó 13 vulnerabilidades en el backend (8 altas, 5 moderadas: `body-parser`, `zod`, `prisma`/`mysql2`, `vite`, `vitest`) y 3 en el frontend (1 **crítica** en `next` 16.3.6, 2 altas). Tras la actualización: **0 vulnerabilidades** en ambos. |
| A07:2025-Identification and Authentication Failures | **Vulnerable** | Sin hallazgos de SonarQube (no hay código de autenticación que analizar). No existe inicio de sesión; está diseñado con JWT + bcrypt (Stack tecnológico, sección 5.5) y la tabla `usuarios`, pero planificado para un sprint posterior. |
| A08:2025-Software and Data Integrity Failures | **Limpio** | Sin hallazgos. `package-lock.json` versionado en ambos proyectos, producción se despliega solo desde `main`, al que se llega por Pull Request, migraciones de base de datos versionadas con Prisma. No se cargan scripts de CDN externos. |
| A09:2025-Security Logging and Monitoring Failures | **Bajo Revisión** | Sin hallazgos. Los errores 500 se registran con `console.error` y quedan en los logs de Vercel; la entrega registra `registrado_por` y `entregado_at`. Falta: registro de quién crea, edita o cancela cada recurso (depende de la autenticación) y alertas ante errores repetidos. |
| A10:2025-Server-Side Request Forgery (SSRF) | **Limpio** | Sin hallazgos. El backend solo llama a dos servicios con URL fija en el código (`api.openrouteservice.org` y `nominatim.openstreetmap.org`); el texto del usuario va únicamente como parámetro codificado con `URLSearchParams`, nunca como URL ni host. Las llamadas tienen tiempo límite (`AbortSignal.timeout`). |

**Resumen:** 6 categorías limpias (2 de ellas tras corregir en este sprint), 2 bajo revisión y 2 vulnerables. Las dos vulnerables (A01 y A07) tienen la misma causa: la autenticación aún no está implementada.

### Nota sobre la numeración oficial OWASP Top 10:2025

La plantilla del curso usa los nombres de las categorías de la edición anterior. En la lista oficial 2025 las categorías se renumeraron y se agregaron dos nuevas. La correspondencia con esta evaluación es:

| Oficial OWASP Top 10:2025 | Dónde se evaluó en la matriz |
|---|---|
| A01 Broken Access Control | A01 (Vulnerable) |
| A02 Security Misconfiguration | A05 (Limpio, corregido) |
| A03 Software Supply Chain Failures | A06 + A08 (Limpio, corregido) |
| A04 Cryptographic Failures | A02 (Limpio) |
| A05 Injection | A03 (Limpio) |
| A06 Insecure Design | A04 (Bajo Revisión) |
| A07 Authentication Failures | A07 (Vulnerable) |
| A08 Software or Data Integrity Failures | A08 (Limpio) |
| A09 Security Logging and Alerting Failures | A09 (Bajo Revisión) |
| A10 Mishandling of Exceptional Conditions | Revisado aparte: el middleware `manejarErrores` responde un mensaje genérico en errores 500 y el JSON mal formado devuelve 400. **Limpio** tras la corrección del Hotspot #2. |

---

## 2. Detalles de Security Hotspots y Vulnerabilidades Críticas

SonarQube Cloud no marcó Security Hotspots en esta versión. Abajo están la vulnerabilidad que sí reportó, los riesgos de dependencias y lo encontrado en la revisión manual, con su corrección.

- **Hotspot #1 — Exposición de la tecnología del servidor (A05, severidad baja, SonarQube).**
  - **Descripción:** las respuestas de la API incluían `X-Powered-By: Express`, lo que facilita buscar ataques conocidos para esa tecnología. Confirmado en producción con `curl -I https://ecoruta-backend.vercel.app/api/v1/rutas`.
  - **Ubicación:** `backend/src/server.js`. `aplicacion.js` ya desactivaba la cabecera, pero `server.js` envuelve esa app en otra instancia de Express que la volvía a agregar.
  - **Mitigación aplicada:** `app.disable("x-powered-by")` también en la app de `server.js`.

- **Hotspot #2 — Filtración de detalles internos en `/health` (A05 / A10, revisión manual).**
  - **Descripción:** si la base de datos fallaba, `GET /health` devolvía `database.message` con el texto del error de Prisma, que puede incluir el host de Neon o detalles de la conexión.
  - **Ubicación:** `backend/src/aplicacion.js`, servicio `salud.verificar()`.
  - **Mitigación aplicada:** la respuesta solo indica `{ connected: false }` y el detalle se registra en el log del servidor (`console.error("[health]", e)`).

- **Hotspot #3 — Dependencias con vulnerabilidades conocidas (A06, 31 riesgos en SonarQube; 1 crítica).**
  - **Descripción:** `next` 16.3.6 tenía una vulnerabilidad **crítica** (envenenamiento de caché y filtración de contenido de Draft Mode). En el backend: denegación de servicio en `body-parser` (usado por `express.json`) y en `zod` con colecciones muy grandes, filtración de credenciales en `mysql2` (dependencia de `prisma`), y ejecución de código en herramientas de desarrollo (`vite`, `vitest`).
  - **Ubicación:** `frontend/package.json`, `backend/package-lock.json`, `frontend/package-lock.json`.
  - **Mitigación aplicada:** `next` y `eslint-config-next` a 16.4.3; `npm update` del backend dentro de los rangos de versión declarados. `npm audit`: **0 vulnerabilidades** en backend y frontend. Se verificó que siguen pasando las **109 pruebas** y el build de producción del frontend.

- **Hotspot #4 — API sin autenticación ni control por roles (A01 / A07, revisión manual, severidad alta).**
  - **Descripción:** todos los endpoints de `/api/v1` son públicos. Un tercero podría cancelar pedidos, cambiar conductores o registrar incidentes falsos. Incumple RN-001 y RNF-02.
  - **Ubicación:** `backend/src/routes/rutas.api.js` (ningún middleware de autenticación).
  - **Mitigación propuesta (pendiente, no aplicada):** implementar el módulo de usuarios ya diseñado: inicio de sesión con contraseña cifrada con bcrypt, token JWT con vencimiento, middleware que lo exija en `/api/v1` y verificación del rol (Administrador, Operador, Conductor) por endpoint. Mientras tanto, el riesgo se reduce porque la URL de la API no es pública y CORS solo acepta los orígenes del frontend, aunque esto no protege contra llamadas directas.

- **Hotspot #5 — Sin límite de peticiones a endpoints costosos (A04, revisión manual, severidad media).**
  - **Descripción:** `POST /rutas`, `POST /rutas/:id/incidentes` y la geocodificación llaman a servicios externos con cuota gratuita limitada; muchas peticiones seguidas podrían agotarla y dejar el sistema sin generar rutas.
  - **Mitigación propuesta (pendiente):** agregar un limitador por IP (por ejemplo `express-rate-limit`) en esos endpoints, o el firewall de Vercel, junto con la autenticación.

### Correcciones de calidad atendidas en la misma rama

También se corrigieron las observaciones del [03 Calidad de código](03%20Calidad%20de%20c%C3%B3digo%20V_1_0_0.md) que no son de seguridad: el ordenamiento de horas en `ruta.service.js` (ahora con `localeCompare`), los `autoFocus` de `ConductorRuta.jsx` y `RutaDetalle.jsx`, y el `aria-hidden` de las filas de carga en `ui.jsx`. Las de accesibilidad se detallan en el [05 WCAG](05%20WCAG%20V_1_0_0.md).

### Verificación

1. `npm test` en `backend/`: 109 de 109 pruebas aprobadas. Cobertura de líneas: 87,47 %.
2. `npm audit` en `backend/` y `frontend/`: 0 vulnerabilidades.
3. `next build` del frontend sin errores y ESLint sin observaciones.
4. Pendiente después del merge: nuevo análisis en SonarQube Cloud para confirmar Seguridad = A y comprobar en producción que ya no aparece `X-Powered-By`.

---

[Volver al README principal](../../../README.md)

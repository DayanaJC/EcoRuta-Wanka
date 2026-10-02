# Registro de impedimentos

**Nombre del Proyecto:** EcoRuta Wanka — Optimizador de rutas sostenibles de última milla (WankaLogística S.A.C., Huancayo, Junín)

**Líder del Proyecto:** Javier Curi Dayana

| Versión | Fecha | Sprint | Integrantes |
| --- | --- | --- | --- |
| V_1_0_0 | 02/10/2026 | EW Sprint 1 (11/09/2026 – 02/10/2026) | Javier Curi Dayana (líder), Arroyo Canchari Henry |

[⬅ Volver al README](../../README.md) · Documentos del Sprint 1: [01 Informe de estado](01%20Informe%20de%20estado%20del%20proyecto%20V_1_0_0.md) · [03 Revisión del Sprint](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md) · [04 Retrospectiva del Sprint](04%20Retrospectiva%20del%20Sprint%20V_1_0_0.md)

---

**Prioridad:** Alta = bloquea el Sprint Goal o la Definition of Done · Media = retrasa o degrada el trabajo sin bloquearlo · Baja = molestia con solución temporal.
**Estado:** Resuelto · Cerrado (deja de aplicar) · En seguimiento (se controla, no bloquea) · Pendiente (sin resolver).

| Impedimento # | Fecha de Registro | Descripción del Impedimento así como el Impacto en el Proyecto | Prioridad | Reportado por | Fecha tope de Resolución | Estado | Fecha de Resolución | Resolución/Comentarios |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IMP-01 | 11/09/2026 | **Falta de un módulo de vehículos en el frontend.** La interfaz no permitía gestionar la flota. *Impacto:* bloqueaba US-001 y, con ello, la generación de rutas (US-003 necesita vehículos activos). | Alta | Arroyo Canchari Henry | 25/09/2026 | Resuelto | 25/09/2026 | Se implementó el módulo de Vehículos en el prototipo. Tras CC-01 se rehízo en Next.js con medidas útiles de la caja de carga (PR #6, 28/09/2026). |
| IMP-02 | 11/09/2026 | **La generación de rutas no optimizaba.** El prototipo guardaba los pedidos en el orden de selección, sin calcular orden, distancia ni tiempo. *Impacto:* US-003 (13 SP, 57 % del Sprint) no cumplía su criterio principal. | Alta | Javier Curi Dayana | 25/09/2026 | Resuelto | 28/09/2026 | Se integró la API de OpenRouteService (motor VROOM) con capacidad en peso y volumen y ventanas horarias (PR #6). Se resolvió 3 días después de la fecha tope; motivó la ampliación del Sprint (CC-01). |
| IMP-03 | 11/09/2026 | **Credenciales de Firebase.** La conexión requería archivos de cuenta de servicio que no deben subirse al repositorio. *Impacto:* dificultaba que ambos integrantes ejecutaran el proyecto. | Media | Equipo de desarrollo | 02/10/2026 | Cerrado | 27/09/2026 | Deja de aplicar: con CC-01 Firebase se reemplazó por Neon (PostgreSQL). La configuración de credenciales nuevas continúa en IMP-05. |
| IMP-04 | 11/09/2026 | **Capacidad limitada del equipo.** Dos integrantes para frontend, backend, pruebas, despliegue y documentación. *Impacto:* concentración del trabajo: desde el 11/09/2026, 20 de 26 commits corresponden a un integrante. | Media | Javier Curi Dayana, Arroyo Canchari Henry | 09/10/2026 | En seguimiento | — | Se distribuirá el Sprint 2 por historia completa (frontend + backend) y cada PR será revisado por el otro integrante (ACC-01 y ACC-02 de la Retrospectiva). |
| IMP-05 | 27/09/2026 | **Configuración de entornos sin exponer credenciales.** La cadena de conexión de Neon y la API key de OpenRouteService deben existir en cada entorno (local, Vercel) sin subirse al repositorio. *Impacto:* sin ellas la API no arranca ni optimiza rutas. | Media | Arroyo Canchari Henry | 02/10/2026 | Resuelto | 28/09/2026 | Archivos `.env.example` en `backend/` y `frontend/`, `.env` ignorado por Git y variables configuradas en los proyectos de Vercel. |
| IMP-06 | 27/09/2026 | **Migración del stack (CC-01).** Vehículos, pedidos, asignaciones y rutas debían pasar de FastAPI + Firestore a Node.js + Express + Neon, y la Vista de Vite a Next.js. *Impacto:* retrabajo que ponía en riesgo el cierre del Sprint (RSK-16). | Alta | Javier Curi Dayana, Arroyo Canchari Henry | 02/10/2026 | Resuelto | 28/09/2026 | Migración por módulos reutilizando las reglas de negocio del prototipo (PR #5 documentación, PR #6 código). Pruebas migradas de Pytest a Vitest + Supertest. |
| IMP-07 | 27/09/2026 | **Geocodificación errónea en Huancayo.** El buscador de direcciones de OpenRouteService ubicaba direcciones de Huancayo en otras regiones (por ejemplo, Ica). *Impacto:* pedidos con coordenadas incorrectas producirían rutas inválidas. | Media | Arroyo Canchari Henry | 28/09/2026 | Resuelto | 27/09/2026 | Se usa Nominatim (OpenStreetMap) priorizando la zona de Huancayo; además el punto puede marcarse en el mapa (CC-02). |
| IMP-08 | 27/09/2026 | **Horarios incoherentes del motor de rutas.** VROOM retrasa por su cuenta la salida del vehículo para evitar esperas, por lo que las horas devueltas no coincidían con la hora de salida indicada. *Impacto:* horas de entrega estimadas incorrectas. | Media | Arroyo Canchari Henry | 28/09/2026 | Resuelto | 27/09/2026 | De la API se toman solo el orden y los tiempos de manejo; el horario y la salida óptima se calculan en `backend/src/services/optimizacion/horario.js` (cubierto por pruebas). |
| IMP-09 | 28/09/2026 | **Suspensión de Neon por inactividad.** En el plan gratuito la base se suspende y la primera consulta puede fallar (error P1001). *Impacto:* errores intermitentes al iniciar la demostración. | Baja | Arroyo Canchari Henry | 09/10/2026 | En seguimiento | — | Se reintenta la consulta; antes de cada demostración se abre `/health` para activar la base. Se evaluará el ajuste de suspensión de Neon. |
| IMP-10 | 28/09/2026 | **Despliegue desde un repositorio de otra cuenta.** El repositorio oficial pertenece a la líder y el despliegue gratuito de Vercel se configuró en la cuenta de otro integrante. *Impacto:* sin despliegue no había ambiente para validar ni demostrar. | Media | Arroyo Canchari Henry | 28/09/2026 | Resuelto | 28/09/2026 | Fork HenryACR/EcoRuta-Wanka conectado a los proyectos `ecoruta-backend` y `ecoruta-frontend`; se sincroniza con `main` tras cada PR (PR #7 preparó el backend). |
| IMP-11 | 02/10/2026 | **Flujo de pedidos incompleto.** Los estados de la ruta y del pedido se cambiaban a mano por separado, no se guardaba la hora real de entrega ni existía "no entregado". *Impacto:* el objetivo O2 (entregas fuera de horario < 10 %) no se podía medir. | Alta | Arroyo Canchari Henry | 02/10/2026 | Resuelto | 02/10/2026 | CC-02: la ruta mueve los estados de sus pedidos, cada parada guarda hora real y si fue dentro de la ventana, y existe un simulador del reparto (PR #8). |
| IMP-12 | 02/10/2026 | **Regla de prioridad de pedidos sin definir.** La prioridad (express, estándar, económico) se envía al motor de rutas pero no cambia el orden de entrega y ningún documento define su significado. *Impacto:* un pedido express puede entregarse al final de la ruta. | Media | Arroyo Canchari Henry | 09/10/2026 | Pendiente | — | La líder definirá la regla de negocio en la planificación del Sprint 2; opciones analizadas: ventana acotada para express, dejar fuera primero los económicos y plazos por prioridad. |
| IMP-13 | 02/10/2026 | **Pull Requests sin revisión.** Los PR #5 a #8 se integraron sin revisión de otro integrante. *Impacto:* incumple el criterio 2 de la Definition of Done y concentra el conocimiento del código. | Media | Javier Curi Dayana | 09/10/2026 | Pendiente | — | Revisión retroactiva de los PR #6 y #8 por la líder y protección de la rama `main` que exija una aprobación (ACC-01). |
| IMP-14 | 02/10/2026 | **Sin ambiente de staging.** Solo existen el entorno local y producción. *Impacto:* incumple el criterio 6 de la DoD; los cambios se validan directamente en producción. | Media | Arroyo Canchari Henry | 16/10/2026 | Pendiente | — | Activar los despliegues de vista previa de Vercel por Pull Request y una rama de base de datos de pruebas en Neon (ACC-05). |
| IMP-15 | 02/10/2026 | **Vulnerabilidades en dependencias internas de Prisma.** `npm audit` reporta 4 vulnerabilidades altas (`mysql2`, `deepmerge-ts`) en paquetes que Prisma instala. *Impacto:* bajo — el proyecto usa PostgreSQL y no carga el controlador de MySQL; no hay vulnerabilidades críticas. | Baja | Arroyo Canchari Henry | 16/10/2026 | En seguimiento | — | Actualizar Prisma cuando publique la versión corregida y repetir `npm audit` en cada Sprint. |

### Resumen

| Estado | Cantidad | Impedimentos |
| --- | ---: | --- |
| Resuelto | 8 | IMP-01, IMP-02, IMP-05, IMP-06, IMP-07, IMP-08, IMP-10, IMP-11 |
| Cerrado | 1 | IMP-03 |
| En seguimiento | 3 | IMP-04, IMP-09, IMP-15 |
| Pendiente | 3 | IMP-12, IMP-13, IMP-14 |
| **Total** | **15** | 4 de prioridad alta (todos resueltos), 9 de prioridad media y 2 de prioridad baja |

Los impedimentos de prioridad alta, que bloqueaban el Sprint Goal, quedaron resueltos. Los pendientes se atenderán en la planificación del EW Sprint 2 y tienen una acción asociada en la [Retrospectiva del Sprint](04%20Retrospectiva%20del%20Sprint%20V_1_0_0.md).

---

## Historial de versiones

| Versión | Fecha | Autor | Descripción |
| --- | --- | --- | --- |
| V_0_1_0 | 25/09/2026 | Javier Curi Dayana | Registro inicial con IMP-01 a IMP-04 (prototipo). |
| V_0_2_0 | 27/09/2026 | Arroyo Canchari Henry | Cambio CC-01: cierre de IMP-03 y nuevos IMP-05 e IMP-06. |
| V_1_0_0 | 02/10/2026 | Arroyo Canchari Henry, Javier Curi Dayana | Versión de entrega del Sprint 1 con la plantilla oficial: estado final de IMP-01 a IMP-06 y nuevos IMP-07 a IMP-15. |

> Los borradores V_0_1_0 y V_0_2_0 se publicaron con los nombres `V_1_0_0` y `V_1_1_0`; se renumeraron al consolidar la entrega con el nombre exigido por la consigna.

[⬅ Volver al README](../../README.md)

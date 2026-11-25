[⬅️ Volver al README Principal](../../README.md)

# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 05. Radiadores de Información (Information Radiators)

**Proyecto:** EcoRuta Wanka — Optimizador de rutas sostenibles de última milla para WankaLogística S.A.C. | **Marco Ágil Utilizado:** Scrum (4 sprints en Jira Software, tablero To Do → In Progress → In Review / QA → Done) dentro de un ciclo de vida híbrido | **Versión:** 1.0.0

**Fecha de corte:** 26/11/2026 (cierre del proyecto) | **Líder del proyecto:** Javier Curi Dayana | **Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

Un radiador de información es un gráfico grande y visible que cualquiera puede leer de un vistazo, sin preguntar al equipo. Mientras duró el proyecto, el equipo usó estos radiadores:

| Radiador | Dónde se consultaba | Fuente de los datos |
|---|---|---|
| Backlog y tablero Scrum | Jira Software (proyecto EcoRuta-Wanka) | Historias, Story Points y estados de Jira ([Evidencia 2](../06%20Otros/evidencias/Evidencia%202%20Backlog%20Priorizado.png) y [Evidencia 4](../06%20Otros/evidencias/Evidencia%204%20Tablero%20Scrum%20Activo.png)) |
| Burndown y Burnup del producto | Sprint Review de cada sprint | Story Points aceptados en cada Sprint Review y fechas de los Pull Requests en GitHub |
| Mood Chart | Al terminar cada retrospectiva | Autoevaluación de cada integrante (escala 1 a 5) |
| Tablero de retrospectiva | Retrospectiva de cada sprint | Documentos de retrospectiva de los Sprints 1 a 4 (`docs/03 Implementación`) |
| Estado de las pruebas | Badges del README y GitHub Actions | Workflows `ci.yml`, `tests.yml`, `deploy-production.yml` y `green-audit.yml` |

**Fechas de los sprints usadas en los gráficos:**

| Sprint | Fechas planificadas | Historias | Story Points | Aceptado en la Review |
|---|---|---|---:|---|
| Sprint 1 | 10/09 – 25/09 | US-001, US-002, US-003 | 23 | 02/10 (ampliado 7 días por el cambio CC-01) |
| Sprint 2 | 28/09 – 08/10 | US-004, US-005, US-006, US-008 | 29 | 08/10 |
| Sprint 3 | 12/10 – 30/10 (en Jira: 23/10 – 29/10) | US-007, US-009 | 18 | 29/10 |
| Sprint 4 | 02/11 – 20/11 (en Jira: 14/11 – 19/11) | US-010 (cambio de alcance) | 8 | 19/11 |

---

## 1. Burndown Chart (Trabajo Restante)

![Burndown Chart](../06%20Otros/evidencias/Evidencia%2050%20Burndown%20Chart%20del%20producto.png)

**Análisis de velocidad y tasa de finalización:**

- **Cómo leerlo:** la línea roja es el trabajo que falta (Story Points no aceptados todavía). La línea gris punteada es la tasa ideal, es decir, lo que debía faltar si cada sprint cumplía su compromiso.
- **Sprint 1, el único desvío:** al 25/09 se esperaba que quedaran 47 SP, pero quedaban los 70, porque las 3 historias se terminaron de aceptar el **02/10**. El motivo fue el cambio de tecnología **CC-01** (de Python/FastAPI/Firebase a Node.js/Next.js/Neon): hubo que migrar lo ya hecho. Es el mismo retraso de 7 días que muestra el [Reporte de Variación](02%20Reporte%20de%20Variaci%C3%B3n%20V_1_0_0.md).
- **Recuperación en el Sprint 2:** el 08/10 la línea roja volvió a tocar la ideal (18 SP restantes). Desde ahí el proyecto no volvió a atrasarse.
- **Sprint 3:** el backlog inicial llegó a **0 SP el 29/10**, un día antes de lo planificado (30/10).
- **Sprint 4:** el 14/11 la línea sube a **8 SP** por la historia nueva **US-010** y vuelve a 0 el **19/11**.
- **Velocidad real por sprint:** 23 → 29 → 18 → 8 SP. El promedio de los sprints de desarrollo (1 a 3) es de **23,3 SP por sprint**. Los 8 SP del Sprint 4 son bajos a propósito: ese sprint estaba reservado para integración y pruebas.
- **Tasa de finalización:** **78 de 78 SP (100 %)**. Cada sprint terminó el 100 % de lo que se comprometió.

## 2. Burnup Chart (Trabajo Completado y Cambios de Alcance)

![Burnup Chart](../06%20Otros/evidencias/Evidencia%2051%20Burnup%20Chart%20del%20producto.png)

**Análisis de crecimiento de alcance vs. trabajo aceptado:**

- **Cómo leerlo:** la línea azul es el alcance total y la verde es el trabajo aceptado. El proyecto termina cuando las dos se juntan.
- **Alcance estable durante el desarrollo:** la línea azul se mantuvo en **70 SP (9 historias)** desde el 10/09 hasta el 14/11. No hubo cambios de alcance en los Sprints 1, 2 y 3.
- **Único cambio de alcance:** el 14/11 la línea azul sube a **78 SP (+11,4 %)** con **US-010** (avisos al cliente y seguimiento público del pedido). Es el cambio que también aparece en el [flujo acumulado del tablero híbrido](04%20Tableros%20de%20Control%20-%20H%C3%ADbridos%20V_1_0_0.md).
- **Trabajo aceptado:** 23 → 52 → 70 → **78 SP**. La línea verde alcanzó a la azul el 29/10 (alcance inicial) y otra vez el 19/11 (alcance final).
- **Por qué el Burnup completa al Burndown:** en el Burndown, la subida del 14/11 podría parecer un retroceso del equipo. El Burnup muestra que no lo fue: el equipo no perdió trabajo, **creció el alcance**, y ese crecimiento se terminó en 5 días.

## 3. Task Board / Tablero Kanban

**Tablero Scrum real en Jira** (columnas To Do → In Progress → In Review / QA → Done):

![Task Board](../06%20Otros/evidencias/Evidencia%204%20Tablero%20Scrum%20Activo.png)

**Backlog real en Jira al cierre**, con las 10 historias en estado «Listo»:

![Backlog en Jira](../06%20Otros/evidencias/Evidencia%202%20Backlog%20Priorizado.png)

**Flujo de cada historia por las columnas del tablero.** Se armó con las fechas de los Pull Requests en GitHub y de cada Sprint Review:

![Flujo del tablero por historia](../06%20Otros/evidencias/Evidencia%2052%20Flujo%20del%20tablero%20por%20historia.png)

**Análisis de flujo y cuellos de botella identificados:**

| Sprint | Tiempo de ciclo por historia (inicio → Done) | Tiempo en revisión del Pull Request | Lectura |
|---|---:|---|---|
| Sprint 1 | 22 días | Menos de 1 día (PR #6, 28/09) | **Cuello de botella** en QA y aceptación: del 28/09 al 02/10 se probaron y corrigieron rutas, horarios y entregas (PR #8). |
| Sprint 2 | 10 días | Menos de 1 día (PR #10, 08/10) | Flujo continuo, sin historias detenidas. |
| Sprint 3 | 6 días | Menos de 1 día (PR #11, 28/10) | Flujo continuo. La re-optimización (13 SP) se dividió en tareas pequeñas. |
| Sprint 4 | 5 días | Menos de 1 día (PR #19 y #20, 19/11) | Flujo continuo, aunque la historia entró al sprint como cambio de alcance. |

- **Cuello de botella principal: QA del Sprint 1.** Las 3 historias estuvieron juntas en *In Progress* hasta el 28/09 y luego necesitaron 4 días más de pruebas. Pasó por dos razones: la migración CC-01 dejó poco tiempo para probar, y las 3 historias dependían unas de otras (sin vehículos y pedidos no se puede generar una ruta).
- **Cómo se resolvió:** desde el Sprint 2 se probó cada historia **mientras se desarrollaba** y no al final, y se agregaron pruebas automáticas en cada cambio (de 71 a 131). El tiempo de ciclo bajó de **22 a 5 días**.
- **Segundo cuello de botella, menor:** todo pasaba por una sola persona para integrar y publicar (los Pull Requests y el despliegue en Vercel). No llegó a frenar el flujo, porque cada PR se revisó en menos de un día, pero es un riesgo para futuros equipos (ver el [Reporte de Lecciones Aprendidas](07%20Reporte%20Final%20de%20Lecciones%20Aprendidas%20V_1_0_0.md)).
- **WIP (trabajo en curso):** el equipo nunca tuvo más de 4 historias abiertas a la vez, la cantidad del Sprint 2. Con 2 integrantes, ese fue el límite práctico.

## 4. Mood Chart (Estado de Ánimo del Equipo)

![Mood Chart](../06%20Otros/evidencias/Evidencia%2053%20Mood%20Chart%20del%20equipo.png)

Escala: 5 = muy bien · 4 = bien · 3 = regular · 2 = preocupado · 1 = agotado. Cada integrante marcó su estado al terminar la retrospectiva del sprint.

| Integrante / Rol | Sprint 1 | Sprint 2 | Sprint 3 | Sprint Final (Sprint 4) |
|---|---|---|---|---|
| Javier Curi Dayana — Líder del proyecto (Scrum Master y documentación) | 😟 2 — Preocupada | 🙂 4 — Bien | 🙂 4 — Bien | 😐 3 — Regular |
| Arroyo Canchari Henry — Desarrollo full stack y despliegue | 😐 3 — Regular | 🙂 4 — Bien | 🙂 4 — Bien | 🙂 4 — Bien |
| **Promedio del equipo** | **2,5** | **4,0** | **4,0** | **3,5** |

En la reunión de cierre (26/11) ambos integrantes marcaron **5 — Muy bien**.

**Interpretación del clima laboral:**

- **Sprint 1 (2,5), el punto más bajo:** el cambio de tecnología CC-01 llegó con el sprint ya empezado, obligó a migrar lo hecho y ampliar el sprint 7 días. La retrospectiva lo recoge: «conversar antes de realizar cambios importantes» y «repartir mejor las tareas».
- **Sprints 2 y 3 (4,0):** con la tecnología ya estable, el equipo cumplió el 100 % de lo comprometido sin retrasos. Las acciones de la retrospectiva del Sprint 1 (reunión corta de avances y pruebas en cada cambio) mejoraron la comunicación.
- **Sprint 4 (3,5), baja leve:** la historia nueva US-010, las dudas sobre si los avisos debían salir solos por WhatsApp y los fallos de compilación (Next.js) y de CI subieron la presión sobre la documentación. La retrospectiva del Sprint 4 propone «mantener una mejor comunicación con el docente para aclarar desde el inicio lo que se espera».
- **Cierre (5,0):** el producto está publicado y todos los entregables están completos, 10 días antes de lo planificado.
- **Conclusión:** el ánimo del equipo siguió al riesgo técnico. Bajó cuando hubo cambios sin conversar (CC-01, US-010) y subió cuando el trabajo fue predecible. Nunca bajó de 2, y no hubo conflictos sin resolver entre los integrantes.

## 5. Tableros de Retrospectiva

**Evidencia:**

![Retrospectiva](../06%20Otros/evidencias/Evidencia%2054%20Tablero%20de%20retrospectiva.png)

Tablero consolidado con las notas de las cuatro retrospectivas:

- [Retrospectiva del Sprint 1](../03%20Implementaci%C3%B3n/Sprint%201/04.%20Retrospectiva%20del%20Sprint%20V_1_0_0.md)
- [Retrospectiva del Sprint 2](../03%20Implementaci%C3%B3n/Sprint%202/04.%20Retrospectiva%20del%20Sprint%20V_1_0_0.md)
- [Retrospectiva del Sprint 3](../03%20Implementaci%C3%B3n/Sprint%203/02%20Retrospectiva%20del%20Sprint%20V_1_0_0.md)
- [Retrospectiva del Sprint 4](../03%20Implementaci%C3%B3n/Sprint%204/02%20Retrospectiva%20del%20Sprint%20V_1_0_0.md)

| Lo que funcionó bien | Oportunidades de mejora | Acciones implementadas |
|---|---|---|
| Cada sprint cumplió el 100 % de sus Story Points (23, 29, 18 y 8). | Conversar los cambios importantes antes de hacerlos (Sprint 1, cambio CC-01). | Reunión corta de avances y problemas en cada sprint, desde el Sprint 2. |
| El sistema estuvo publicado en Vercel desde el Sprint 1, y cada Review se hizo sobre producción. | Repartir mejor las tareas y que ambos conozcan todas las partes del sistema (Sprints 1 y 3). | Actividades de cada integrante definidas al inicio de cada historia (Sprint 3). |
| Buena comunicación entre los dos integrantes (Sprints 2, 3 y 4). | Revisar los criterios de aceptación antes de cerrar una historia (Sprint 2). | Criterios de aceptación comprobados con pruebas automáticas: de 71 a 131 pruebas del backend. |
| Trabajo con ramas y Pull Requests, que ordenó los cambios (Sprint 4). | Aclarar con el docente, desde el inicio, el alcance de cada función (Sprint 4, avisos por WhatsApp). | 79 pruebas E2E con Playwright y 4 workflows de GitHub Actions en cada cambio (Sprint 4). |
| Calidad revisada con SonarQube, OWASP, WCAG y Lighthouse (Sprint 3 y Green IT). | Probar antes los servicios externos y revisar las dependencias (Sprints 1 y 4). | Actualización a Next.js 16.4.6 y revisión final de rendimiento y enlaces (26/11). |

**Seguimiento de las acciones:** de las acciones propuestas en las cuatro retrospectivas, **todas se cumplieron antes del cierre**. Las dos del Sprint 4 tenían métrica propia:

- revisión del rendimiento (LCP < 2,5 s, API < 500 ms y 79/79 pruebas Playwright aprobadas);
- documentación sin marcadores pendientes ni enlaces rotos.

Ambas se comprobaron el 26/11/2026.

---

Los indicadores predictivos (PV, EV, AC, SPI y CPI) que completan estos radiadores ágiles están en el [04 Tableros de Control - Híbridos](04%20Tableros%20de%20Control%20-%20H%C3%ADbridos%20V_1_0_0.md).

[⬅️ Volver al README Principal](../../README.md)

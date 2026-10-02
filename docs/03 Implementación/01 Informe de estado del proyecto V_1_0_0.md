# Informe de estado del proyecto

**Nombre del Proyecto:** EcoRuta Wanka — Optimizador de rutas sostenibles de última milla (WankaLogística S.A.C., Huancayo, Junín)

**Líder del Proyecto:** Javier Curi Dayana

| Versión | Fecha | Sprint | Integrantes | Repositorio |
| --- | --- | --- | --- | --- |
| V_1_0_0 | 02/10/2026 | EW Sprint 1 | Javier Curi Dayana (líder), Arroyo Canchari Henry | [github.com/DayanaJC/EcoRuta-Wanka](https://github.com/DayanaJC/EcoRuta-Wanka) |

[⬅ Volver al README](../../README.md) · Documentos del Sprint 1: [02 Registro de Impedimentos](02%20Registro%20de%20Impedimentos%20V_1_0_0.md) · [03 Revisión del Sprint](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md) · [04 Retrospectiva del Sprint](04%20Retrospectiva%20del%20Sprint%20V_1_0_0.md)

---

## Historias de Usuario completadas en este Sprint

### Resumen del Sprint 1

| Elemento | Estado al 02/10/2026 |
| --- | --- |
| Sprint Goal | *"Implementar la gestión básica de vehículos y pedidos para disponer de información válida que permita generar rutas optimizadas de reparto."* — **Cumplido** |
| Periodo planificado | 11/09/2026 – 25/09/2026 (14 días) |
| Periodo real | 11/09/2026 – 02/10/2026. Se amplió 7 días por el cambio de stack CC-01 (27/09/2026), registrado en el [Registro de control de cambios](../04%20Seguimiento_control/01%20Registro%20de%20control%20de%20cambios%20V_1_2_0.md) |
| Historias comprometidas | 3 (US-001, US-002, US-003) |
| Historias completadas | **3 de 3** |
| Story Points | **23 de 23** completados — velocidad del Sprint 1: 23 SP |
| Avance del MVP v1.0.0 | 23 de 78 SP del backlog (**29,5 %**) |
| Estado del producto | Publicado en producción: [ecoruta-frontend.vercel.app](https://ecoruta-frontend.vercel.app) (Vista) y [ecoruta-backend.vercel.app](https://ecoruta-backend.vercel.app/health) (API REST) |

### Estado de las Historias de Usuario

| Historia | SP | Estado | Criterios de aceptación (RF) | Evidencia principal |
| --- | ---: | --- | --- | --- |
| US-001 – Gestión de flota vehicular | 5 | **Completada** | RF-01, escenarios 1 a 3 verificados | Módulo *Vehículos* (registrar, editar, activar/desactivar) con placa `ABC-123`, capacidad en kg y medidas útiles de la caja de carga. Pruebas `vehículos (RF-01)` en `backend/tests/api.test.js` |
| US-002 – Gestión de pedidos de reparto | 5 | **Completada** | RF-02, escenarios 1 a 3 verificados | Módulo *Pedidos*: bultos con medidas y peso, ventana horaria, prioridad, ubicación por texto o mapa. Pruebas `pedidos (RF-02)` |
| US-003 – Generación de rutas optimizadas por vehículo | 13 | **Completada** | RF-03, escenarios 1 a 3 verificados | Orden óptimo calculado con la API de OpenRouteService (VROOM), validando peso, volumen y medidas de los bultos; salida óptima y comparación antes/después. Pruebas `rutas optimizadas (RF-03)` |

### Indicadores del Sprint

| Indicador | Valor | Fuente |
| --- | --- | --- |
| Pruebas automatizadas del backend | **71 pruebas, 71 aprobadas** (5 archivos) | `npm test` en `backend/` |
| Cobertura del backend | **83,86 % de líneas**, 82,42 % de sentencias, 65 % de ramas | `npm run test:coverage` (Vitest + V8) |
| Endpoints de la API REST | 30 endpoints bajo `/api/v1` | `backend/src/routes/rutas.api.js` |
| Integración en `main` | 4 Pull Requests (#5, #6, #7, #8) y 26 commits desde el 11/09/2026 | Historial de GitHub |
| Ahorro demostrado por la optimización | Ruta de 4 paradas: 16,19 km en el orden elegido → **14,48 km optimizada (−11 %)**, −0,47 kg de CO₂ | [Evidencia 11](../06%20Otros/evidencias/Evidencia%2011%20Ruta%20optimizada%20y%20entregas%20registradas.png) |
| Entregas dentro de la ventana horaria (O2) | 100 % (7 de 7 entregas, **todas generadas con el simulador**; aún no hay entregas reales) | Indicador de la vista *Rutas* — [Evidencia 12](../06%20Otros/evidencias/Evidencia%2012%20Indicador%20de%20entregas%20a%20tiempo.png) |

### Trabajo adicional entregado en el Sprint

Durante la ampliación del Sprint se adelantaron partes de historias del backlog que no estaban comprometidas. Se registran como **avance parcial**; las historias completas se planificarán en sprints siguientes:

| Historia del backlog | Avance entregado | Pendiente para completarla |
| --- | --- | --- |
| US-004 – Visualización de rutas en mapa interactivo | Mapa de la ruta (Leaflet + OpenStreetMap), hoja de ruta imprimible, enlace a Google Maps, registro de entregas por parada (entregada / no entregada con motivo, hora real) y simulador del reparto (CC-02) | Seguimiento por el conductor desde su propia aplicación (requiere US-008 y US-010) |
| US-005 – Dashboard de indicadores de sostenibilidad | Comparación antes/después de optimizar (km, combustible y CO₂) por ruta e indicador O2 de entregas a tiempo | Dashboard consolidado por periodo y por vehículo |

### Cumplimiento de la Definition of Done

| # | Criterio de la DoD ([Transformando a ágil, sección 8](../02%20Planificacion/01%20Transformando%20a%20%C3%A1gil%20V_1_2_0.md)) | Estado | Evidencia o acción |
| --- | --- | --- | --- |
| 1 | Rama de trabajo integrada mediante Pull Request | Cumplido | PR #5, #6, #7 y #8 |
| 2 | Revisión por otro integrante | **No cumplido** | Los PR #5 a #8 se integraron sin una revisión registrada en GitHub. Acción ACC-01 de la [Retrospectiva](04%20Retrospectiva%20del%20Sprint%20V_1_0_0.md) e impedimento IMP-13 |
| 3 | Cobertura mínima del 80 % | Cumplido en el backend | 83,86 % de líneas. El frontend aún no tiene pruebas automatizadas (ACC-04) |
| 4 | Sin vulnerabilidades críticas conocidas | Cumplido | `npm audit` (02/10/2026): 0 críticas. Frontend: 0 vulnerabilidades. Backend: 4 altas en dependencias internas de Prisma (`mysql2`, `deepmerge-ts`); el proyecto usa PostgreSQL y no carga el controlador de MySQL. Se actualizará Prisma cuando publique la corrección (IMP-15). Credenciales fuera del repositorio (`.env` ignorado, variables en Vercel) |
| 5 | Criterios de aceptación verificados | Cumplido | Escenarios de RF-01, RF-02 y RF-03 cubiertos por pruebas de la API — ver [Revisión del Sprint](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md) |
| 6 | Validación en ambiente de staging | **Parcial** | Validado en local con datos en memoria y en producción; no existe un ambiente de staging separado (IMP-14, ACC-05) |
| 7 | Contratos de la API documentados | Cumplido | Tabla de endpoints y flujo de entregas en el [README](../../README.md#endpoints-principales) |
| 8 | Documentación actualizada | Cumplido | Documentos V_1_2_0 y [CC-02](../04%20Seguimiento_control/01%20Registro%20de%20control%20de%20cambios%20V_1_2_0.md) |
| 9 | Pruebas de compatibilidad (RNF-09) | **Parcial** | Verificado en Microsoft Edge (motor Chromium) de escritorio a 1366–1440 px y en vista móvil de 390 px; faltan Firefox y Safari (ACC-04) |
| 10 | Evaluación de usabilidad (RNF-05) | **Pendiente** | Se recogerá la valoración del docente en la Sprint Review del 02/10/2026 |

Las tres historias cumplen sus criterios de aceptación y están en producción. Los criterios 2, 6, 9 y 10 de la DoD quedan como compromisos del equipo, registrados como impedimentos y acciones de mejora.

---

## Demostración del trabajo completado

Demostración a los stakeholders de las funcionalidades implementadas.

| Elemento | Detalle |
| --- | --- |
| Stakeholder | Docente del curso Taller de Proyectos 2 (rol de cliente y evaluador del proyecto académico) |
| Fecha | 02/10/2026 — Sprint Review del EW Sprint 1 (programada) |
| Presentan | Javier Curi Dayana (líder) y Arroyo Canchari Henry |
| Entorno | Producción: [ecoruta-frontend.vercel.app](https://ecoruta-frontend.vercel.app) conectado a la API en Vercel y a la base de datos Neon |
| Guion y evidencias | Detallados en la [Revisión del Sprint](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md#demostración-del-trabajo-completado), con capturas del sistema en producción (Evidencias 6 a 12) |

Secuencia de la demostración:

1. Registro de un vehículo con su capacidad y medidas útiles (US-001).
2. Registro de un pedido con bultos, ventana horaria y ubicación por texto o marcada en el mapa (US-002).
3. Generación de una ruta optimizada: orden de entrega, salida óptima, mapa y comparación antes/después en km y CO₂ (US-003).
4. Simulación del reparto: hora real de cada entrega, entregas dentro o fuera de la ventana y regreso al almacén (adelanto de US-004).

Las observaciones del docente se registrarán en la versión V_1_0_1 de la Revisión del Sprint después de la sesión.

---

## Pendientes

| # | Pendiente | Tipo | Responsable | Plazo |
| --- | --- | --- | --- | --- |
| 1 | Revisión cruzada de los PR #6 y #8 y revisión obligatoria de cada PR desde el Sprint 2 (DoD 2) | Calidad | Javier Curi Dayana | 09/10/2026 |
| 2 | Pruebas automatizadas del frontend y pruebas de compatibilidad en Firefox y Safari (DoD 3 y 9) | Calidad | Arroyo Canchari Henry | Sprint 2 |
| 3 | Ambiente de staging con despliegues de vista previa por Pull Request (DoD 6) | Infraestructura | Arroyo Canchari Henry | Sprint 2 |
| 4 | Registrar la valoración de usabilidad del docente (DoD 10, RNF-05) | Calidad | Javier Curi Dayana | 02/10/2026 |
| 5 | Definir la regla de negocio de prioridad de pedidos (express / estándar / económico) | Requisitos | Javier Curi Dayana | 09/10/2026 |
| 6 | Considerar los bultos no apilables en el cálculo de volumen del vehículo | Funcionalidad | Arroyo Canchari Henry | Sprint 2 |
| 7 | Historias del backlog no iniciadas: US-006, US-007, US-008, US-009 y US-010; y completar US-004 y US-005 | Alcance | Equipo | Sprints 2 y siguientes |
| 8 | Aplicación del conductor para registrar entregas desde el celular (fase 2 del flujo de entregas; depende de US-008 y US-010) | Alcance | Equipo | Sprint 2 o 3 |

Los impedimentos que originan estos pendientes están en el [Registro de Impedimentos](02%20Registro%20de%20Impedimentos%20V_1_0_0.md) y las acciones de mejora, en la [Retrospectiva del Sprint](04%20Retrospectiva%20del%20Sprint%20V_1_0_0.md).

---

## Historial de versiones

| Versión | Fecha | Autor | Descripción |
| --- | --- | --- | --- |
| V_0_1_0 | 25/09/2026 | Javier Curi Dayana | Borrador inicial con el estado del prototipo (FastAPI + Firestore). |
| V_0_2_0 | 27/09/2026 | Arroyo Canchari Henry | Actualización por el cambio CC-01: historias en progreso hasta migrar al nuevo stack. |
| V_1_0_0 | 02/10/2026 | Arroyo Canchari Henry, Javier Curi Dayana | Versión de entrega del Sprint 1 con la plantilla oficial: estado real con el stack vigente, 3 de 3 historias completadas, indicadores, DoD y pendientes. |

> Los borradores V_0_1_0 y V_0_2_0 se publicaron con los nombres `V_1_0_0` y `V_1_1_0`; se renumeraron al consolidar la entrega con el nombre exigido por la consigna. Su contenido puede consultarse en el historial de Git.

[⬅ Volver al README](../../README.md)

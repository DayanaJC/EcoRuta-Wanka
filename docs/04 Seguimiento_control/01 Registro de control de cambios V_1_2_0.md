# EcoRuta Wanka

*Optimizador de rutas sostenibles de última milla — Huancayo, Junín*

# 01. Registro de control de cambios

**Versión:** V_1_2_0 | **Fecha:** 02/10/2026 | **Versión anterior:** V_1_1_0 (27/09/2026) – cambio CC-02 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

---

## 1. Objetivo

Este documento registra los cambios que afectan el alcance, la tecnología, la arquitectura o el cronograma de **EcoRuta Wanka**, conforme a las restricciones **R-05** (uso de tecnologías definidas) y **R-22** (cambios en los requisitos), que exigen evaluar cada cambio antes de incorporarlo.

---

## 2. Registro de cambios

| ID    | Fecha      | Tipo                       | Solicitado por        | Estado       |
| ----- | ---------- | -------------------------- | --------------------- | ------------ |
| CC-01 | 27/09/2026 | Tecnología y arquitectura  | Arroyo Canchari Henry | **Implementado** (PR #5 y #6, 28/09/2026) |
| CC-02 | 02/10/2026 | Alcance funcional, datos y cronograma | Arroyo Canchari Henry | **Implementado** (PR #7 y #8; publicado en producción el 02/10/2026); pendiente la revisión de la líder (IMP-13) |

---

## 3. Historial de versiones de la documentación

| Versión | Fecha      | Descripción                                                                                                   |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| V_1_0_0 | 28/08/2026 – 25/09/2026 | Documentación inicial (Inicio, Planificación e Implementación del Sprint 1) con el stack Python + FastAPI, React + Vite y Firebase. |
| V_1_1_0 | 27/09/2026 | Cambio CC-01: stack Node.js + Express, Next.js y Neon; arquitectura cliente-servidor con MVC; estado real del Sprint 1. Solo los documentos afectados pasan a V_1_1_0; los demás se mantienen en V_1_0_0. |
| V_1_2_0 | 02/10/2026 | Cambio CC-02 y cierre del Sprint 1: flujo de entregas, ubicación en el mapa, carga encima por bulto, publicación en Vercel y documentos de *03 Implementación* con las plantillas oficiales. Cada documento afectado sube una versión menor (ver 5.4). |

La versión anterior de cada documento puede consultarse en el historial de Git del repositorio.

---

## 4. CC-01 – Cambio de stack tecnológico y de arquitectura

### 4.1 Descripción del cambio

| Elemento                | Antes                                          | Después                                                     |
| ----------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| Arquitectura            | Arquitectura por capas                         | Arquitectura cliente-servidor                               |
| Organización interna    | Presentación, Negocio, Datos                   | Patrón MVC con capa de servicios (Vista, Controlador, Modelo) |
| Comunicación            | API REST                                       | API REST (sin cambios; se conserva el prefijo `/api/v1`)    |
| Frontend                | React + Vite                                   | Next.js (React)                                             |
| Backend                 | Python + FastAPI + Pydantic                    | Node.js + Express + Zod                                     |
| Base de datos           | Firebase Cloud Firestore (NoSQL documental)    | Neon (PostgreSQL relacional) con Prisma ORM                 |
| Optimización de rutas   | No implementada (se guardaba el orden seleccionado) | API de OpenRouteService (VROOM) + factores de tráfico propios |
| Geocodificación y mapa  | No definido                                    | Nominatim + Leaflet / OpenStreetMap                         |
| Autenticación           | Firebase Authentication (no implementada)      | JWT + bcrypt                                                |
| Pruebas                 | Pytest                                         | Vitest + Supertest                                          |

### 4.2 Motivo

1. **Uso de APIs de optimización en lugar de un algoritmo propio.** Desarrollar un motor de optimización de rutas excede el plazo del PFA. OpenRouteService calcula el orden óptimo de visita sobre calles reales considerando capacidad, ventanas de entrega y tiempos. El backend pasa a orquestar llamadas HTTP con JSON, un tipo de trabajo para el que Node.js está diseñado.
2. **Mejora propia sobre la API: factores de tráfico.** La API no considera el tráfico en tiempo real. EcoRuta Wanka añade factores configurables por franja horaria que ajustan los tiempos estimados.
3. **Modelo de datos relacional.** Las entidades del sistema se relacionan entre sí y el diseño ya aplicaba normalización; PostgreSQL garantiza esas relaciones con claves foráneas y transacciones.
4. **Un solo lenguaje.** JavaScript en el frontend y el backend reduce la curva de aprendizaje de un equipo de dos integrantes.
5. **Momento del proyecto.** El Sprint 1 no ha concluido; realizar el cambio ahora evita un retrabajo mayor en sprints posteriores.

### 4.3 Evaluación del impacto

| Dimensión     | Impacto                                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Alcance       | Sin cambios en los requisitos funcionales. RF-03 precisa que el cálculo se realiza con una API externa y factores de tráfico.            |
| Cronograma    | Alto. Los módulos del prototipo (US-001, US-002, US-003) y sus pruebas deben migrarse (IMP-06, RSK-16).                                  |
| Costo         | Sin incremento: Neon, OpenRouteService, Nominatim, Vercel y Render cuentan con planes gratuitos.                                         |
| Calidad       | Positivo: la integridad de los datos se garantiza en la base de datos y la generación de rutas pasa a ser realmente optimizada.         |
| Riesgos       | Nuevos riesgos RSK-15 (dependencia y límites de la API de optimización) y RSK-16 (retrabajo por la migración).                           |
| Reutilización | Se conservan los requisitos, las reglas de negocio, el diseño de las pantallas, el contrato de la API y la separación de responsabilidades. |

### 4.4 Documentos actualizados

| Documento                                                        | Cambio principal                                                           |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `README.md`                                                      | Tecnologías, arquitectura, estructura, configuración y variables de entorno |
| `01 Inicio/04. Registro de supuestos y restricciones`            | AS-02, AS-13, AS-14, CO-04, CO-05, CO-06                                   |
| `01 Inicio/06. Requisitos funcionales`                           | RF-03: cálculo mediante API de optimización y factores de tráfico          |
| `01 Inicio/10. Stack tecnológico`                                | Nueva evaluación de alternativas y stack definitivo                        |
| `01 Inicio/11. Base de datos`                                    | Modelo relacional en Neon (tablas, claves foráneas, nuevas tablas `ruta_paradas`, `factores_trafico`, `usuarios`) |
| `01 Inicio/12. Modelo C4`                                        | Contenedores y componentes con MVC y sistemas externos                     |
| `01 Inicio/13. Restricciones`                                    | R-05, R-06, R-19, nuevas R-23 y R-24                                       |
| `02 Planificacion/01 Transformando a ágil`                       | EN-006 y relación con la arquitectura                                      |
| `02 Planificacion/03 Registro de riesgos`                        | RSK-01, RSK-10, nuevos RSK-15 y RSK-16                                     |
| `02 Planificacion/04 Presupuesto del proyecto`                   | Servicios cloud (Neon, Vercel, OpenRouteService)                           |
| `03 Implementación/01 a 04`                                      | Estado real del Sprint 1 (en curso) y acciones de migración                |

### 4.5 Plan de implementación

1. Crear el backend en Node.js + Express con la estructura MVC (`controllers`, `services`, `repositories`) y el esquema de Prisma en Neon.
2. Migrar los módulos en orden: vehículos (US-001), pedidos (US-002), asignaciones y rutas (US-003), reutilizando las reglas de negocio del prototipo.
3. Integrar la API de OpenRouteService y los factores de tráfico en el servicio de rutas.
4. Migrar el frontend a Next.js reutilizando los componentes de React y agregar el mapa con Leaflet.
5. Migrar las pruebas a Vitest y Supertest.
6. Retirar el código del prototipo (FastAPI y Firestore) una vez que el nuevo stack cubra todas sus funcionalidades.

---

## 5. CC-02 – Flujo de entregas, ajustes de datos y cierre del Sprint 1

### 5.1 Descripción del cambio

| Elemento | Antes | Después |
| --- | --- | --- |
| Estados del pedido | El operador marcaba a mano *en ruta* y *entregado*, sin relación con la ruta | La ruta determina los estados (RN-013): iniciar el reparto pone los pedidos *en ruta*; cada parada se registra como entregada o no entregada |
| Hora de entrega | No se guardaba (solo la fecha de última modificación) | Fecha y hora real por parada y por pedido, si fue dentro de la ventana, motivo de no entrega, regreso al almacén |
| Simulación | No existía | Simulador del reparto tramo a tramo (salida, manejo con tráfico, espera de ventana, atención y regreso) con las mismas reglas que el registro real |
| Pedidos en rutas | Un pedido podía incluirse en dos rutas activas | Prohibido (RN-014); cancelar una ruta libera sus pedidos |
| Tipo de producto | Obligatorio al registrar un pedido | No se contempla por ahora: opcional en la API, fuera del formulario; la columna se conserva |
| Carga | Casilla "apilable" sin explicación | Pregunta "¿Carga encima? Sí / No" por bulto, aviso en la hoja de ruta |
| Ubicación del pedido | Búsqueda y mapa separados | Dirección con sugerencias o punto marcado en el mapa en primer plano, que propone la dirección (geocodificación inversa) |
| Publicación del backend | Render (planificado) | Vercel, desde el fork HenryACR/EcoRuta-Wanka sincronizado con `main` |
| Duración del Sprint 1 | 11/09/2026 – 25/09/2026 | 11/09/2026 – 02/10/2026 (+7 días) por la migración de CC-01 |
| Documentos del Sprint 1 | `V_1_1_0`, sin las plantillas oficiales | `V_1_0_0` con las plantillas oficiales de la consigna; los borradores previos se renumeran V_0_1_0 y V_0_2_0 en su historial |

### 5.2 Motivo

1. **Medir el objetivo O2.** Sin la hora real de entrega no era posible calcular el porcentaje de entregas fuera de horario (IMP-11).
2. **Consistencia de datos.** Los estados manuales permitían rutas completadas con pedidos pendientes y pedidos en dos rutas a la vez.
3. **Demostración creíble.** El simulador permite mostrar el reparto completo sin conductores reales, que llegarán con US-008 y US-010.
4. **Datos útiles para el operador.** El tipo de producto no se usaba en ningún cálculo; saber si un bulto admite carga encima sí afecta la carga del vehículo.
5. **Cumplimiento de la consigna del Sprint 1.** Nombres exactos `V_1_0_0` y plantillas oficiales en *03 Implementación*.

### 5.3 Evaluación del impacto

| Dimensión | Impacto |
| --- | --- |
| Alcance | Medio. Adelanta parte de US-004 (seguimiento) y US-005 (indicador O2) sin cambiar los requisitos; RF-02 y RF-04 se precisan. |
| Cronograma | Sin impacto adicional: se implementó dentro de la ampliación del Sprint 1. |
| Costo | Sin incremento: Vercel, Neon y Nominatim en planes gratuitos. |
| Calidad | Positivo: 17 pruebas nuevas (de 54 a 71) y cobertura del backend de 83,86 % de líneas. |
| Datos | Migraciones `flujo_entregas` y `regreso_almacen`: solo agregan columnas y marcan como entregadas las paradas cuyos pedidos ya lo estaban; compatibles con la versión publicada. |
| Riesgos | Revisión de RSK-15 y RSK-16 al cierre del Sprint; nuevos impedimentos IMP-07 a IMP-15. |

### 5.4 Documentos actualizados

| Documento | Versión | Cambio principal |
| --- | --- | --- |
| `README.md` | — | Endpoints de entregas y geocodificación, flujo de entregas, estructura del repositorio y enlaces a los documentos del Sprint 1 |
| `01 Inicio/06. Requisitos funcionales` | V_1_1_0 → V_1_2_0 | RF-02 (bultos, ubicación, tipo de producto) y RF-04 (escenario 4: registrar una entrega) |
| `01 Inicio/09. Reglas de negocio` | V_1_0_0 → V_1_1_0 | Nuevas RN-013 y RN-014 |
| `01 Inicio/10. Stack tecnológico` | V_1_1_0 → V_1_2_0 | Backend publicado en Vercel |
| `01 Inicio/11. Base de datos` | V_1_1_0 → V_1_2_0 | Columnas del flujo de entregas y estado de implementación de las tablas |
| `02 Planificacion/01 Transformando a ágil` | V_1_1_0 → V_1_2_0 | Periodo real del Sprint 1 |
| `02 Planificacion/03 Registro de riesgos` | V_1_1_0 → V_1_2_0 | Revisión de riesgos al cierre del Sprint 1 |
| `03 Implementación/01 a 04` | V_1_0_0 | Documentos del Sprint 1 con las plantillas oficiales |
| `04 Seguimiento_control/01 Registro de control de cambios` | V_1_1_0 → V_1_2_0 | Este cambio |

Los documentos no listados se mantienen en su versión porque el Sprint 1 no modificó su contenido.

### 5.5 Implementación

| Paso | Evidencia |
| --- | --- |
| Backend publicado en Vercel | PR #7 (28/09/2026) |
| Flujo de entregas, simulador, regreso al almacén, carga encima y ubicación en el mapa | PR #8 (integrado y publicado el 02/10/2026) |
| Documentación del Sprint 1 | Commit de documentación del 02/10/2026 |

---

## Historial de versiones

| Versión | Fecha | Descripción |
| --- | --- | --- |
| V_1_1_0 | 27/09/2026 | Creación del registro con el cambio CC-01. |
| V_1_2_0 | 02/10/2026 | Cambio CC-02; CC-01 pasa a implementado. |

[⬅ Volver al README](../../README.md)

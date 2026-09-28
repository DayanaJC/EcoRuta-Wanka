# EcoRuta Wanka

*Optimizador de rutas sostenibles de última milla — Huancayo, Junín*

# 01. Registro de control de cambios

**Versión:** V_1_1_0 | **Fecha:** 27/09/2026 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

---

## 1. Objetivo

Este documento registra los cambios que afectan el alcance, la tecnología, la arquitectura o el cronograma de **EcoRuta Wanka**, conforme a las restricciones **R-05** (uso de tecnologías definidas) y **R-22** (cambios en los requisitos), que exigen evaluar cada cambio antes de incorporarlo.

---

## 2. Registro de cambios

| ID    | Fecha      | Tipo                       | Solicitado por        | Estado       |
| ----- | ---------- | -------------------------- | --------------------- | ------------ |
| CC-01 | 27/09/2026 | Tecnología y arquitectura  | Arroyo Canchari Henry | **Aprobado para documentación**; implementación en curso |

---

## 3. Historial de versiones de la documentación

| Versión | Fecha      | Descripción                                                                                                   |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| V_1_0_0 | 28/08/2026 – 25/09/2026 | Documentación inicial (Inicio, Planificación e Implementación del Sprint 1) con el stack Python + FastAPI, React + Vite y Firebase. |
| V_1_1_0 | 27/09/2026 | Cambio CC-01: stack Node.js + Express, Next.js y Neon; arquitectura cliente-servidor con MVC; estado real del Sprint 1. Solo los documentos afectados pasan a V_1_1_0; los demás se mantienen en V_1_0_0. |

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

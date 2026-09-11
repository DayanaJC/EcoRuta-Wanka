**PROYECTO FINAL DE CARRERA (PFA)**
**EcoRuta Wanka**
*Optimizador de rutas sostenibles de última milla — Huancayo, Junín*

# 03. Registro de riesgos

**Versión:** V_1_0_0   |   **Fecha:** 11/09/2026   |   **Organización:** WankaLogística S.A.C.   |   **Ubicación:** Huancayo, Junín, Perú   |   **Repositorio:** [github.com/DayanaJC/EcoRuta-Wanka](https://github.com/DayanaJC/EcoRuta-Wanka)
**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

---

## 1. Objeto del documento

Este documento consolida la gestión de riesgos de EcoRuta Wanka conforme a los lineamientos de **PMBOK®** (gestión de riesgos como área de conocimiento) y **CMMI** (Risk Management — RSKM, identificación y mitigación proactiva). Actualiza y formaliza en una **Matriz de Evaluación de Riesgos** cuantitativa los riesgos ya identificados de forma preliminar en el [Acta de constitución](../01%20Inicio/02.%20Acta%20de%20constituci%C3%B3n%20V_1_0_0.md) (R-01 a R-07) y en el [Registro de restricciones](../01%20Inicio/13.%20Restricciones%20V_1_0_0.md) (columna "Riesgo" de la matriz multidimensional), e incorpora riesgos adicionales propios de la fase de planificación (equipo, herramientas, proceso).

---

## 2. Metodología de evaluación

Cada riesgo se califica en dos ejes, con escala entera de 1 a 5:

- **Probabilidad (Prob.):** 1 (Muy baja) · 2 (Baja) · 3 (Media) · 4 (Alta) · 5 (Muy alta).
- **Impacto (Imp.):** 1 (Insignificante) · 2 (Menor) · 3 (Moderado) · 4 (Mayor) · 5 (Catastrófico).

**Severidad (Exposición) = Probabilidad × Impacto**

| Rango de Severidad | Clasificación |
| --- | --- |
| 1 – 6 | **Low / Baja** |
| 8 – 12 | **Medium / Media** |
| 15 – 25 | **High / Alta** |

> Nota: dado que Probabilidad e Impacto son enteros de 1 a 5, los únicos productos posibles son {1,2,3,4,5,6,8,9,10,12,15,16,20,25}; no existen valores intermedios (7, 11, 13, 14) que generen ambigüedad de clasificación.

Cada riesgo incluye un **Plan de Mitigación (Preventivo)** —acción para reducir probabilidad o impacto antes de que el riesgo se materialice— y un **Plan de Contingencia (Reactivo)** —acción a ejecutar si el riesgo ya se materializó—, siguiendo la distinción estándar de PMBOK entre respuesta proactiva y reactiva.

---

## 3. Matriz de Evaluación de Riesgos

| ID | Descripción del Riesgo | Categoría | Prob. | Imp. | Severidad | Plan de Mitigación (Preventivo) | Plan de Contingencia (Reactivo) | Responsable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RSK-01 | Indisponibilidad de servicios Cloud en el proveedor (Firebase/Firestore) por límites de cuota. | Técnica / Infraestructura | 2 | 4 | 8 (Media) | Monitorear consumo de cuotas e implementar alertas de umbral al 70%. | Migrar temporalmente los contenedores/servicios a una cuenta secundaria de respaldo. | DevOps Engineer |
| RSK-02 | Curva de aprendizaje elevada en el framework del frontend (React 19 / Vite 8). | Recursos Humanos / Capacidades | 3 | 3 | 9 (Media) | Realizar 2 jornadas de Pair Programming y pases de conocimiento al inicio del Sprint. | Reasignar las tareas de mayor complejidad al arquitecto de software. | Scrum Master |
| RSK-03 | Baja precisión de los datos de tráfico en tiempo real (Waze/Google Maps) en zonas periféricas de Huancayo. | Técnica / Datos | 4 | 2 | 8 (Media) | Habilitar carga manual de reportes de conductores como fuente complementaria de validación. | Usar promedios históricos de congestión por franja horaria mientras se corrige la fuente de datos. | Software Architect |
| RSK-04 | Conectividad limitada (2G/3G) en Chilca, Pilcomayo y zonas altas del valle del Mantaro. | Infraestructura / Operativo | 3 | 4 | 12 (Media) | Diseñar el "modo conductor" bajo un enfoque offline-first con sincronización diferida. | Habilitar modo de solo lectura con la última versión de ruta cacheada en el dispositivo. | Software Architect |
| RSK-05 | Resistencia al cambio por bajo nivel de alfabetización digital de conductores y bodegueros. | Organizacional | 3 | 3 | 9 (Media) | Capacitación previa y "modo conductor" simplificado, validado con pruebas de usabilidad tempranas (RNF-05). | Habilitar soporte telefónico/asistido durante las primeras semanas de operación. | UI/UX Designer |
| RSK-06 | Cambios en la normativa de tránsito o de protección de datos durante el desarrollo (Ley N° 29733, Ley N° 30224, MTC). | Regulatorio | 2 | 4 | 8 (Media) | Monitoreo normativo periódico y motor de reglas de negocio modular y aislado (RN-003, RN-008). | Ajustar las reglas de negocio afectadas sin retrabajo arquitectónico, aprovechando el aislamiento de la capa `business`. | Project Manager |
| RSK-07 | El motor de optimización de rutas no alcanza el objetivo de rendimiento (≤45 s / ≤30 s re-optimización) en escenarios de alto volumen. | Técnico / Rendimiento | 4 | 4 | 16 (Alta) | Pruebas de carga progresivas por iteración; paralelización y ajuste de hiperparámetros de la metaheurística propuesta (RF-03, RNF-01). | Degradar temporalmente a la heurística más rápida (vecino cercano sin 2-opt) cuando se exceda el umbral. | Senior Developer |
| RSK-08 | Heladas y neblina en temporada de invierno afectan tiempos de entrega y seguridad vial. | Ambiental | 4 | 3 | 12 (Media) | Incorporar reglas de ruteo sensibles al clima (RN-010) con alertas visibles al conductor. | Suspender o reprogramar entregas en tramos de alto riesgo climático reportado. | QA Engineer |
| RSK-09 | La ausencia de una empresa afiliada real limita el acceso a datos operativos representativos. | Alcance | 4 | 2 | 8 (Media) | Uso de datos sintéticos validados mediante estudio de campo (entrevistas y observación directa, doc. 06 §1.1). | Ampliar el estudio de campo (más bodegas/conductores) si los datos sintéticos resultan insuficientes para validar el MVP. | Project Manager |
| RSK-10 | Se exceden las cuotas gratuitas del plan Spark de Firestore por crecimiento del volumen de datos de prueba. | Financiero / Técnico | 2 | 3 | 6 (Baja) | Monitorear cuotas de lectura/escritura; migrar filtros en memoria a índices compuestos antes de escalar el volumen. | Migración puntual y acotada en el tiempo al plan Blaze (pago por uso), financiada por el equipo. | DevOps Engineer |
| RSK-11 | Fuga de credenciales de la cuenta de servicio de Firebase si se versionan accidentalmente en el repositorio. | Seguridad | 2 | 5 | 10 (Media) | `.gitignore` de `credentials/`, revisión obligatoria de Pull Request (CO-10) y escaneo de secretos en CI. | Rotación inmediata de credenciales y revocación de la clave de servicio expuesta. | Software Architect |
| RSK-12 | Retrasos por disponibilidad limitada del equipo (2 integrantes) frente a otras obligaciones académicas. | Recursos Humanos / Cronograma | 4 | 4 | 16 (Alta) | Planificación de sprints con margen, tablero Kanban con límites de WIP y reuniones semanales de seguimiento. | Repriorizar el backlog (MoSCoW) para proteger el alcance mínimo viable (RF-01, RF-02, RF-03). | Scrum Master |
| RSK-13 | Conflictos de integración de código entre ramas `feature/*`, `develop` y `main` (convención Git Flow). | Técnico / Proceso | 2 | 2 | 4 (Baja) | Pull Requests pequeños y frecuentes, revisión obligatoria de al menos un integrante, integración continua. | Congelar temporalmente `develop` y resolver conflictos en una sesión dedicada de pair programming. | Software Architect |
| RSK-14 | La ausencia de autenticación (RF-10 propuesto) deja la API sin control de acceso mientras dure su desarrollo. | Seguridad | 3 | 4 | 12 (Media) | Restringir CORS a orígenes de desarrollo (`localhost:5173`, `127.0.0.1:5173`) y no exponer el backend públicamente mientras RF-10 no esté implementado. | Deshabilitar de inmediato cualquier despliegue expuesto a Internet hasta completar RF-10. | Software Architect |

---

## 4. Distribución de severidad

| Severidad | N° de riesgos | IDs |
| --- | --- | --- |
| High / Alta | 2 | RSK-07, RSK-12 |
| Medium / Media | 10 | RSK-01, RSK-02, RSK-03, RSK-04, RSK-05, RSK-06, RSK-08, RSK-09, RSK-11, RSK-14 |
| Low / Baja | 2 | RSK-10, RSK-13 |

Los dos riesgos de severidad **Alta** —rendimiento del motor de optimización (RSK-07) y disponibilidad del equipo frente al cronograma (RSK-12)— coinciden con los dos factores más citados en la documentación previa como condicionantes del alcance del MVP (ver [doc. 06 §3](../01%20Inicio/06.%20Requisitos%20funcionales%20V_1_0_0.md) y [doc. 13 R-13](../01%20Inicio/13.%20Restricciones%20V_1_0_0.md)), por lo que reciben seguimiento prioritario en cada revisión de iteración.

---

## 5. Trazabilidad con documentos previos

| ID de riesgo | Origen / referencia previa |
| --- | --- |
| RSK-03 | R-01 (Acta de constitución, doc. 02) |
| RSK-04 | R-02 (Acta de constitución, doc. 02) |
| RSK-05 | R-03 (Acta de constitución, doc. 02) |
| RSK-06 | R-04 (Acta de constitución, doc. 02) |
| RSK-07 | R-05 (Acta de constitución, doc. 02); RNF-01 (doc. 07) |
| RSK-08 | R-06 (Acta de constitución, doc. 02); RN-010 (doc. 09) |
| RSK-09 | R-07 (Acta de constitución, doc. 02) |
| RSK-10 | R-06 (Restricciones, doc. 13) |
| RSK-11 | R-18 (Restricciones, doc. 13); CO-11 (doc. 04) |
| RSK-12 | R-13 (Restricciones, doc. 13); CO-13 (doc. 04) |
| RSK-13 | R-22 (Restricciones, doc. 13); CO-10 (doc. 04) |
| RSK-14 | R-14, R-20 (Restricciones, doc. 13); RNF-02 (doc. 07) |
| RSK-01, RSK-02 | Riesgos genéricos de gestión de proyecto (sin precedente directo en docs. 01 Inicio) |

---

## 6. Nota sobre responsables

Los roles indicados en la columna "Responsable" (DevOps Engineer, Scrum Master, Software Architect, Senior Developer, QA Engineer, UI/UX Designer, Project Manager) corresponden al **escenario organizacional simulado** de WankaLogística S.A.C., consistente con el usado en el Acta de Constitución (doc. 02). En la **ejecución académica real**, ambos integrantes del equipo —Arroyo Canchari Henry y Javier Curi Dayana— asumen conjuntamente estas funciones, conforme a la restricción R-13 del doc. 13 (equipo de 2 integrantes, perfil académico).

---

## 7. Historial de Control de Cambios

| Versión | Fecha | Descripción del cambio | Autor |
| --- | --- | --- | --- |
| V_1_0_0 | 11/09/2026 | Creación inicial del Registro de Riesgos, consolidando los riesgos preliminares del Acta de Constitución (doc. 02) y del Registro de Restricciones (doc. 13) en formato de matriz cuantitativa PMBOK/CMMI. | Arroyo Canchari Henry, Javier Curi Dayana |

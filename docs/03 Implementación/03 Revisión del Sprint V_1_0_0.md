# Revisión del sprint

**Nombre del Proyecto:** EcoRuta Wanka — Optimizador de rutas sostenibles de última milla (WankaLogística S.A.C., Huancayo, Junín)

**Líder del Proyecto:** Javier Curi Dayana

| Versión | Fecha | Sprint | Sprint Goal | Integrantes |
| --- | --- | --- | --- | --- |
| V_1_0_0 | 02/10/2026 | EW Sprint 1 (11/09/2026 – 02/10/2026) | *"Implementar la gestión básica de vehículos y pedidos para disponer de información válida que permita generar rutas optimizadas de reparto."* — **Cumplido** | Javier Curi Dayana (líder), Arroyo Canchari Henry |

[⬅ Volver al README](../../README.md) · Documentos del Sprint 1: [01 Informe de estado](01%20Informe%20de%20estado%20del%20proyecto%20V_1_0_0.md) · [02 Registro de Impedimentos](02%20Registro%20de%20Impedimentos%20V_1_0_0.md) · [04 Retrospectiva del Sprint](04%20Retrospectiva%20del%20Sprint%20V_1_0_0.md)

---

## Historias de Usuario completadas en este Sprint

| Historia | Épica | SP | Estado | Requisito |
| --- | --- | ---: | --- | --- |
| US-001 – Gestión de flota vehicular | EP-01 | 5 | Completada | RF-01 |
| US-002 – Gestión de pedidos de reparto | EP-02 | 5 | Completada | RF-02 |
| US-003 – Generación de rutas optimizadas por vehículo | EP-03 | 13 | Completada | RF-03 |
| **Total** | | **23** | **23 de 23 SP** | |

Cada escenario de aceptación (formato Gherkin, [06. Requisitos funcionales](../01%20Inicio/06.%20Requisitos%20funcionales%20V_1_2_0.md)) se verifica con pruebas automatizadas de la API (`backend/tests/api.test.js`, 71 pruebas aprobadas) y en la interfaz publicada.

### US-001 – Gestión de flota vehicular (5 SP)

> Como **Administrador**, quiero **registrar, consultar, actualizar y desactivar los vehículos de la flota**, para **mantener organizada la información de los vehículos disponibles para el reparto**.

| Escenario de aceptación (RF-01) | Resultado | Prueba automatizada | Evidencia en la interfaz |
| --- | --- | --- | --- |
| 1. Registrar un vehículo correctamente | Cumple | `registra normalizando la placa a mayúsculas`; `expone el volumen útil calculado con las medidas y el aprovechamiento` | [Evidencia 6](../06%20Otros/evidencias/Evidencia%206%20Gesti%C3%B3n%20de%20veh%C3%ADculos.png) |
| 2. Actualizar la información de un vehículo | Cumple | `filtra por estado, actualiza y desactiva` | Formulario *Editar vehículo* |
| 3. Registrar un vehículo sin información obligatoria | Cumple | `rechaza placas con formato inválido (422)`; `valida capacidad y año de fabricación`; `rechaza placas duplicadas (409)` | Mensajes de validación por campo |

**Entregado:** registro, edición, activación y desactivación de vehículos (camioneta, furgón, moto) con placa peruana `ABC-123`, capacidad en kg, consumo, factor de emisión de CO₂ y medidas útiles de la caja de carga con su porcentaje de aprovechamiento; el sistema calcula el volumen útil en m³.

### US-002 – Gestión de pedidos de reparto (5 SP)

> Como **Operador**, quiero **registrar y gestionar pedidos de reparto**, para **disponer de información válida para la planificación de las entregas**.

| Escenario de aceptación (RF-02) | Resultado | Prueba automatizada | Evidencia en la interfaz |
| --- | --- | --- | --- |
| 1. Registrar un pedido correctamente | Cumple | `registra con valores por defecto`; `calcula peso y volumen a partir de los bultos` | [Evidencia 8](../06%20Otros/evidencias/Evidencia%208%20Registro%20de%20pedido%20con%20ubicaci%C3%B3n.png), [Evidencia 9](../06%20Otros/evidencias/Evidencia%209%20Marcar%20ubicaci%C3%B3n%20en%20el%20mapa.png) |
| 2. Consultar y actualizar un pedido | Cumple | `al editar los bultos recalcula los totales`; `filtra por estado, prioridad y búsqueda de texto`; `no permite modificar ni cambiar el estado de pedidos entregados (409)` | [Evidencia 7](../06%20Otros/evidencias/Evidencia%207%20Gesti%C3%B3n%20de%20pedidos.png) |
| 3. Registrar un pedido con información incompleta | Cumple | `exige al menos un bulto con medidas positivas (422)`; `rechaza hora con formato inválido y ventana invertida (422)` | Aviso "Falta marcar la ubicación de entrega" |

**Entregado:** pedidos con cliente, ubicación (dirección con sugerencias o punto marcado en el mapa), bultos con medidas, peso y si admiten carga encima, ventana horaria, tiempo de atención y prioridad. El peso y el volumen del pedido se calculan a partir de sus bultos. Los estados *en ruta* y *entregado* los registra la ruta (CC-02).

### US-003 – Generación de rutas optimizadas por vehículo (13 SP)

> Como **Operador**, quiero **generar rutas optimizadas para los vehículos**, para **organizar las entregas considerando la capacidad del vehículo y las condiciones de entrega**.

| Escenario de aceptación (RF-03) | Resultado | Prueba automatizada | Evidencia en la interfaz |
| --- | --- | --- | --- |
| 1. Generar una ruta válida | Cumple | `genera la ruta con el orden devuelto por el optimizador`; `retrasa la salida para no esperar en la calle (salida óptima con margen)` | [Evidencia 10](../06%20Otros/evidencias/Evidencia%2010%20Generar%20ruta%20optimizada.png), [Evidencia 11](../06%20Otros/evidencias/Evidencia%2011%20Ruta%20optimizada%20y%20entregas%20registradas.png) |
| 2. Generar una ruta con varios pedidos | Cumple | `informa los pedidos que no caben en su ventana (422)`; `rechaza la ruta si el volumen supera el del vehículo aunque el peso alcance`; `rechaza la ruta si un bulto no cabe físicamente (colchón en moto)` | Orden de entrega, mapa y comparación antes/después |
| 3. Generar una ruta sin información suficiente | Cumple | `valida vehículo, pedidos y capacidad antes de llamar al optimizador`; `rechaza pedidos entregados o cancelados` | Mensaje de error sin generar la ruta |

**Entregado:** orden óptimo de visita calculado con la API de OpenRouteService (motor VROOM) sobre calles reales, con capacidad en peso y volumen, medidas de cada bulto y ventanas horarias; hora estimada de cada entrega, salida óptima del almacén, distancia, duración, trazado en el mapa, enlace a Google Maps, hoja de ruta imprimible y comparación antes/después (km, combustible y CO₂). Los factores de tráfico por franja horaria están implementados y probados, pero **deshabilitados por decisión del equipo** hasta contar con datos de tráfico de Huancayo (`TRAFICO_HABILITADO`).

### Trabajo adicional (adelanto de historias del backlog)

| Historia | Avance entregado | Prueba automatizada |
| --- | --- | --- |
| US-004 – Visualización y seguimiento | Registro de cada parada como entregada o no entregada (con motivo), hora real, entregas dentro o fuera de la ventana, regreso al almacén y simulador del reparto tramo a tramo (CC-02) | 10 pruebas de `flujo de entregas` |
| US-005 – Indicadores de sostenibilidad | Comparación antes/después de optimizar por ruta e indicador O2 de entregas a tiempo | `genera la ruta con el orden devuelto por el optimizador` (distancia optimizada y sin optimizar); `registra la entrega con fecha y hora…` (dentro de la ventana) |

---

## Demostración del trabajo completado

Demostración a los stakeholders de las funcionalidades implementadas.

| Elemento | Detalle |
| --- | --- |
| Stakeholder | Docente del curso Taller de Proyectos 2, en el rol de cliente y evaluador del proyecto académico |
| Fecha y estado | 02/10/2026 — **programada** para la sesión del curso |
| Presentan | Javier Curi Dayana (líder) y Arroyo Canchari Henry |
| Entorno | Producción: [ecoruta-frontend.vercel.app](https://ecoruta-frontend.vercel.app) · API: [ecoruta-backend.vercel.app/health](https://ecoruta-backend.vercel.app/health) · base de datos Neon |
| Datos | Escenario simulado de WankaLogística S.A.C. en Huancayo, El Tambo, Chilca y Pilcomayo |

### Guion de la demostración

| Paso | Historia | Qué se muestra | Resultado esperado | Evidencia |
| --- | --- | --- | --- | --- |
| 1 | US-001 | Lista de vehículos y registro de uno nuevo con capacidad y medidas útiles | El vehículo aparece activo con su volumen útil calculado | ![Evidencia 6: Gestión de vehículos](../06%20Otros/evidencias/Evidencia%206%20Gesti%C3%B3n%20de%20veh%C3%ADculos.png) |
| 2 | US-002 | Lista de pedidos con filtros por estado y prioridad | Pedidos pendientes y entregados de distintos distritos | ![Evidencia 7: Gestión de pedidos](../06%20Otros/evidencias/Evidencia%207%20Gesti%C3%B3n%20de%20pedidos.png) |
| 3 | US-002 | Registro de un pedido: al escribir la dirección aparecen sugerencias | Sugerencias de calles de Huancayo | ![Evidencia 8: Registro de pedido con ubicación](../06%20Otros/evidencias/Evidencia%208%20Registro%20de%20pedido%20con%20ubicaci%C3%B3n.png) |
| 4 | US-002 | "Marcar en el mapa": el punto marcado rellena la dirección | Dirección del punto y botón "Guardar ubicación" | ![Evidencia 9: Marcar ubicación en el mapa](../06%20Otros/evidencias/Evidencia%209%20Marcar%20ubicaci%C3%B3n%20en%20el%20mapa.png) |
| 5 | US-003 | Generación de una ruta: vehículo, hora disponible y pedidos | El sistema solo ofrece pedidos disponibles y vehículos activos | ![Evidencia 10: Generar ruta optimizada](../06%20Otros/evidencias/Evidencia%2010%20Generar%20ruta%20optimizada.png) |
| 6 | US-003 / US-004 | Ruta optimizada: orden, horas, mapa, salida ajustada, antes/después y entregas registradas | 14,48 km frente a 16,19 km sin optimizar (−11 %) y 4 entregas dentro de la ventana | ![Evidencia 11: Ruta optimizada y entregas registradas](../06%20Otros/evidencias/Evidencia%2011%20Ruta%20optimizada%20y%20entregas%20registradas.png) |
| 7 | US-005 | Indicador O2 en la lista de rutas | Porcentaje de entregas dentro de la ventana frente a la meta | ![Evidencia 12: Indicador de entregas a tiempo](../06%20Otros/evidencias/Evidencia%2012%20Indicador%20de%20entregas%20a%20tiempo.png) |

Las capturas se tomaron el 02/10/2026 del sistema en producción. Las entregas que se muestran se generaron con el simulador; aún no hay entregas reales.

### Preguntas para el stakeholder

1. ¿El flujo de registro de pedidos (dirección por texto o mapa) es claro para un operador sin capacitación?
2. ¿Qué debe significar la prioridad *express* en la operación: entregarse primero o dentro de un plazo? (IMP-12)
3. ¿Qué historia debe priorizarse en el Sprint 2: la aplicación del conductor (US-008 + US-010) o el dashboard de sostenibilidad (US-005)?

Las respuestas y la valoración de usabilidad del docente (RNF-05) se registrarán en la versión V_1_0_1 de este documento.

---

## Pendientes

### Compromisos derivados del Sprint 1

| # | Pendiente | Origen | Responsable | Plazo |
| --- | --- | --- | --- | --- |
| 1 | Registrar las observaciones y la valoración de usabilidad del docente | Demostración, DoD 10 | Javier Curi Dayana | 02/10/2026 |
| 2 | Revisar los PR #6 y #8 y exigir una aprobación para integrar en `main` | IMP-13, DoD 2 | Javier Curi Dayana | 09/10/2026 |
| 3 | Definir la regla de negocio de prioridad de pedidos | IMP-12 | Javier Curi Dayana | 09/10/2026 |
| 4 | Ambiente de staging con despliegues de vista previa por PR | IMP-14, DoD 6 | Arroyo Canchari Henry | 16/10/2026 |
| 5 | Pruebas del frontend y de compatibilidad en Firefox y Safari | DoD 3 y 9 | Arroyo Canchari Henry | Sprint 2 |
| 6 | Considerar los bultos no apilables en el cálculo de volumen | Observación del equipo (CC-02) | Arroyo Canchari Henry | Sprint 2 |
| 7 | Habilitar los factores de tráfico con datos de franjas horarias de Huancayo | RF-03 | Equipo | Sprint 3 |

### Historias del backlog para los siguientes sprints

| Historia | SP | Estado |
| --- | ---: | --- |
| US-004 – Visualización de rutas en mapa interactivo | 8 | Iniciada (mapa, registro de entregas y simulador); falta el seguimiento por el conductor |
| US-005 – Dashboard de indicadores de sostenibilidad | 8 | Iniciada (antes/después por ruta e indicador O2); falta el dashboard consolidado |
| US-006 – Reporte de sostenibilidad en PDF | 5 | No iniciada |
| US-007 – Re-optimización dinámica ante incidentes de tránsito | 13 | No iniciada |
| US-008 – Registro y asignación de conductores a rutas | 8 | No iniciada; base de la aplicación del conductor |
| US-009 – Preferencias de entrega de clientes/bodegas | 5 | No iniciada |
| US-010 – Autenticación y control de acceso por roles | 8 | No iniciada |
| **Total pendiente** | **55** | De 78 SP del backlog |

---

## Historial de versiones

| Versión | Fecha | Autor | Descripción |
| --- | --- | --- | --- |
| V_0_1_0 | 25/09/2026 | Javier Curi Dayana | Revisión inicial con el prototipo (FastAPI + Firestore). |
| V_0_2_0 | 27/09/2026 | Arroyo Canchari Henry | Cambio CC-01: historias en progreso hasta migrar al nuevo stack. |
| V_1_0_0 | 02/10/2026 | Arroyo Canchari Henry, Javier Curi Dayana | Versión de entrega del Sprint 1 con la plantilla oficial: 3 historias completadas con trazabilidad a pruebas, guion y evidencias de la demostración y pendientes. |

> Los borradores V_0_1_0 y V_0_2_0 se publicaron con los nombres `V_1_0_0` y `V_1_1_0`; se renumeraron al consolidar la entrega con el nombre exigido por la consigna.

[⬅ Volver al README](../../README.md)

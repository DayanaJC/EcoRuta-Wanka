# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 01. Revisión del Sprint V_1_0_0

**Versión:** V_1_0_0 | **Fecha:** 28/10/2026 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

**Sprint:** EW Sprint 3 (23/10/2026 – 29/10/2026)

**Sprint Goal:** Mejorar la planificación de las entregas mediante la gestión de preferencias de recepción de clientes y la reoptimización dinámica de rutas ante incidentes de tránsito, garantizando una mejor organización de las entregas y el cumplimiento de los horarios establecidos.

---

## Historias de Usuario completadas en este Sprint

Durante el Sprint 3 se completaron las siguientes historias de usuario:

| Historia | Épica | SP | Estado | Requisito |
|---|---|---:|---|---|
| US-007 – Reoptimización dinámica de rutas ante incidentes | EP-04 | 13 | **Completada** | RF-07 |
| US-009 – Preferencias de entrega de clientes y bodegas | EP-01 | 5 | **Completada** | RF-09 |
| **Total** | — | **18** | **18 de 18 SP** | — |

### US-007 – Reoptimización dinámica de rutas ante incidentes

Se implementó la funcionalidad de reoptimización dinámica de rutas para responder a incidentes que pueden afectar el recorrido de los vehículos, como tráfico, bloqueo de vías, accidentes, lluvia y fallas vehiculares. El operador puede registrar el incidente y el tiempo estimado de demora para que el sistema evalúe si es necesario reorganizar las entregas pendientes.

Cuando el incidente no afecta los horarios de entrega, la ruta se mantiene sin modificaciones. Si el incidente ocasiona retrasos que comprometen el cumplimiento de los horarios, el sistema reorganiza las paradas pendientes y muestra la ruta actualizada.

| Escenario | Resultado | Evidencia |
|---|---|---|
| Registrar un incidente de tráfico con una demora de 10 minutos que no afecta los horarios de entrega. | **Cumple.** La ruta se mantiene sin cambios y se muestra el mensaje correspondiente. | Evidencia 22. |
| Registrar un bloqueo de vía con una demora de 120 minutos que afecta una entrega. | **Cumple.** El sistema reorganiza las paradas pendientes para priorizar las entregas afectadas. | Evidencia 23. |
| Consultar la ruta después de registrar un incidente. | **Cumple.** Se muestra el mensaje «Ruta actualizada» y la comparación entre la planificación anterior y la nueva. | Evidencias 21 y 23. |

**Evidencia principal:**

**Evidencia 21: Registro de incidente**

![Evidencia 21: Registro de incidente](../../06%20Otros/evidencias/Evidencia%2021%20Registro%20de%20incidente.jpg)

**Evidencia 22: Incidente sin cambios en la ruta**

![Evidencia 22: Incidente sin cambios en la ruta](../../06%20Otros/evidencias/Evidencia%2022%20Incidente%20sin%20cambios%20en%20la%20ruta.jpg)

**Evidencia 23: Ruta reorganizada por incidente**

![Evidencia 23: Ruta reorganizada por incidente](../../06%20Otros/evidencias/Evidencia%2023%20Ruta%20reorganizada%20por%20incidente.jpg)

---

### US-009 – Preferencias de entrega de clientes y bodegas

Se implementó la funcionalidad de gestión de preferencias de entrega para registrar las condiciones en las que los clientes y las bodegas pueden recibir sus pedidos. El sistema permite configurar los días disponibles para la recepción, los horarios de atención, el tiempo estimado de descarga y las indicaciones para el conductor.

Además, al crear un pedido, se pueden utilizar los datos del cliente registrado. Las preferencias de recepción se consideran durante la planificación de las rutas para organizar las entregas de acuerdo con los horarios establecidos.

| Escenario | Resultado | Evidencia |
|---|---|---|
| Registrar las preferencias de recepción de la Bodega Doña Rosa. | **Cumple.** Se guardan los días y horarios de atención configurados. | Evidencia 17. |
| Modificar las preferencias de un cliente registrado. | **Cumple.** Los cambios se guardan correctamente. | Evidencia 18. |
| Crear un pedido utilizando los datos de un cliente registrado. | **Cumple.** El sistema utiliza los datos disponibles del cliente seleccionado. | Evidencia 19. |
| Generar una ruta considerando el horario de recepción del Minimarket El Tambo. | **Cumple.** La planificación considera el horario de recepción configurado. | Evidencia 20. |

**Evidencia principal:**

**Evidencia 17: Registro de cliente con preferencias de entrega**

![Evidencia 17: Registro de cliente con preferencias de entrega](../../06%20Otros/evidencias/Evidencia%2017%20Registro%20de%20cliente%20con%20preferencias%20de%20entrega.jpg)

**Evidencia 18: Preferencias guardadas del cliente**

![Evidencia 18: Preferencias guardadas del cliente](../../06%20Otros/evidencias/Evidencia%2018%20Preferencias%20guardadas%20del%20cliente.jpg)

**Evidencia 19: Pedido con datos del cliente**

![Evidencia 19: Pedido con datos del cliente](../../06%20Otros/evidencias/Evidencia%2019%20Pedido%20con%20datos%20del%20cliente.jpg)

**Evidencia 20: Ruta que respeta las preferencias de entrega**

![Evidencia 20: Ruta que respeta las preferencias de entrega](../../06%20Otros/evidencias/Evidencia%2020%20Ruta%20que%20respeta%20las%20preferencias.jpg)

---

## Demostración del trabajo completado

Demostración de las funcionalidades implementadas durante el Sprint 3, enfocada en la gestión de preferencias de entrega y la reoptimización dinámica de rutas ante incidentes de tránsito.

| Elemento | Detalle |
|---|---|
| **Stakeholder** | Docente del curso Taller de Proyectos 2, como cliente y evaluador del proyecto académico. |
| **Presentan** | Arroyo Canchari Henry y Javier Curi Dayana. |
| **Entorno** | Aplicación web y API del proyecto EcoRuta Wanka. |
| **Datos utilizados** | Escenario simulado de WankaLogística S.A.C. con bodegas y entregas en Huancayo. |

### Guion de la demostración

| Paso | Historia | Qué se muestra | Resultado esperado | Evidencia |
|---|---|---|---|---|
| 1 | US-009 | Registro de las preferencias de recepción de un cliente. | Las preferencias quedan registradas correctamente. | ![Evidencia 17: Registro de cliente](../../06%20Otros/evidencias/Evidencia%2017%20Registro%20de%20cliente%20con%20preferencias%20de%20entrega.jpg) |
| 2 | US-009 | Consulta y edición de las preferencias del cliente. | Se muestran los datos guardados y los cambios realizados. | ![Evidencia 18: Preferencias del cliente](../../06%20Otros/evidencias/Evidencia%2018%20Preferencias%20guardadas%20del%20cliente.jpg) |
| 3 | US-009 | Creación de un pedido seleccionando un cliente registrado. | Se utilizan los datos del cliente seleccionado. | ![Evidencia 19: Pedido con datos del cliente](../../06%20Otros/evidencias/Evidencia%2019%20Pedido%20con%20datos%20del%20cliente.jpg) |
| 4 | US-009 | Generación de una ruta considerando los horarios de recepción. | La planificación toma en cuenta las preferencias configuradas. | ![Evidencia 20: Ruta con preferencias](../../06%20Otros/evidencias/Evidencia%2020%20Ruta%20que%20respeta%20las%20preferencias.jpg) |
| 5 | US-007 | Registro de un incidente de tránsito y su tiempo de demora. | El incidente queda registrado para evaluar su impacto en la ruta. | ![Evidencia 21: Registro de incidente](../../06%20Otros/evidencias/Evidencia%2021%20Registro%20de%20incidente.jpg) |
| 6 | US-007 | Evaluación de un incidente que no afecta los horarios de entrega. | La ruta se mantiene sin cambios. | ![Evidencia 22: Ruta sin cambios](../../06%20Otros/evidencias/Evidencia%2022%20Incidente%20sin%20cambios%20en%20la%20ruta.jpg) |
| 7 | US-007 | Reoptimización de una ruta afectada por un incidente. | Se muestra la ruta actualizada y la nueva organización de las entregas. | ![Evidencia 23: Ruta reorganizada](../../06%20Otros/evidencias/Evidencia%2023%20Ruta%20reorganizada%20por%20incidente.jpg) |

---

## Resultados del Sprint

- Se completaron las dos historias de usuario comprometidas: US-007 y US-009.
- Se alcanzaron los 18 puntos de historia planificados, equivalentes al **100 % del compromiso del Sprint**.
- Se implementó la gestión de preferencias de recepción de clientes y bodegas.
- Se completó la reoptimización dinámica de rutas ante incidentes de tránsito.
- Se cumplieron los criterios de aceptación y la Definition of Done de las historias planificadas.
- Se completó el objetivo establecido para el Sprint 3.

## Pendientes

No se registran pendientes correspondientes al alcance comprometido para el Sprint 3. Las historias US-007 y US-009 se encuentran completadas y el objetivo del Sprint se considera alcanzado satisfactoriamente.

---

[Volver al README principal](../../../README.md)

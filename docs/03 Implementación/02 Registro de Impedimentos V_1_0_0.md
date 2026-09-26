# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 02. Registro de Impedimentos V_1_0_0

**Versión:** V_1_0_0 | **Fecha:** 25/09/2026 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

**Sprint:** EW Sprint 1 (11/09/2026 – 25/09/2026)

---

## 1. Introducción

El presente documento registra los principales impedimentos identificados durante la ejecución del **Sprint 1** del proyecto **EcoRuta Wanka**, indicando su impacto, prioridad, estado y las acciones realizadas para resolverlos o darles seguimiento.

---

## 2. Registro de impedimentos

| #          | Impedimento                                              | Fecha de registro | Descripción                                                                                                                                                  | Impacto | Prioridad | Reportado por         | Fecha tope de resolución | Estado             | Fecha de resolución | Resolución / Comentarios                                                                                                                                                                                                                                                  |
| ---------- | -------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | --------- | --------------------- | ------------------------ | ------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **IMP-01** | Falta de módulo dedicado para la gestión de vehículos    | 11/09/2026        | El frontend no contaba con un módulo independiente para gestionar los vehículos utilizados en las operaciones de reparto.                                    | Alto    | Alta      | Arroyo Canchari Henry | 25/09/2026               | **Resuelto**       | 25/09/2026          | Se implementó el módulo de Vehículos con las funcionalidades necesarias para su gestión y se incorporó a la navegación del sistema.                                                                                                                                       |
| **IMP-02** | Generación de rutas no implementada al inicio del Sprint | 11/09/2026        | La funcionalidad correspondiente a la US-003, con una estimación de 13 Story Points, no estaba implementada al inicio del Sprint 1.                          | Alto    | Alta      | Javier Curi Dayana    | 25/09/2026               | **Resuelto**       | 25/09/2026          | Se implementó la funcionalidad de generación de rutas, incluyendo los componentes necesarios del backend y frontend para registrar y consultar las rutas.                                                                                                                 |
| **IMP-03** | Configuración del entorno para servicios de Firebase     | 11/09/2026        | La conexión con los servicios de Firebase requiere credenciales y configuración del entorno que no deben incorporarse al repositorio.                        | Medio   | Media     | Equipo de desarrollo  | 02/10/2026               | **Pendiente**      | —                   | La configuración debe mantenerse fuera del repositorio y realizarse correctamente en cada entorno de desarrollo. Este punto será considerado en el siguiente Sprint para las funcionalidades que requieran autenticación y acceso controlado a los servicios de Firebase. |
| **IMP-04** | Capacidad limitada del equipo de desarrollo              | 11/09/2026        | El equipo está conformado por dos integrantes y debe distribuir el trabajo de frontend, backend, pruebas y documentación durante el desarrollo del proyecto. | Medio   | Media     | Ambos integrantes     | 02/10/2026               | **En seguimiento** | —                   | Se requiere una distribución organizada de las tareas y coordinación entre ambos integrantes para mantener el avance del proyecto y evitar concentración de actividades en una sola persona.                                                                              |

---

## 3. Resumen de impedimentos

| Prioridad | Cantidad | IDs            |
| --------- | -------: | -------------- |
| Alta      |        2 | IMP-01, IMP-02 |
| Media     |        2 | IMP-03, IMP-04 |
| Baja      |        0 | —              |

**Impedimentos resueltos:** 2 (IMP-01, IMP-02)

**Impedimentos pendientes:** 1 (IMP-03)

**Impedimentos en seguimiento:** 1 (IMP-04)

---

## 4. Impedimentos resueltos durante el Sprint 1

| ID         | Impedimento                                              | Fecha de resolución | Resolución                                                                                  |
| ---------- | -------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| **IMP-01** | Falta de módulo dedicado para la gestión de vehículos    | 25/09/2026          | Se implementó el módulo de gestión de vehículos y se incorporó a la navegación del sistema. |
| **IMP-02** | Generación de rutas no implementada al inicio del Sprint | 25/09/2026          | Se implementó la funcionalidad de generación de rutas en el backend y frontend.             |

---

## 5. Seguimiento de impedimentos

Los impedimentos pendientes y en seguimiento serán revisados durante la planificación del **EW Sprint 2**, asignando responsables y fechas de atención de acuerdo con las necesidades del siguiente Sprint.

El **IMP-03** deberá ser atendido para garantizar que las funcionalidades que utilicen los servicios de Firebase cuenten con la configuración correspondiente en el entorno de desarrollo, manteniendo las credenciales fuera del repositorio.

El **IMP-04** continuará en seguimiento mediante una distribución organizada de las actividades entre los integrantes del equipo, considerando las tareas de desarrollo, pruebas y documentación.

---

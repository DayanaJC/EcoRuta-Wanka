# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 02. Registro de Impedimentos V_1_1_0

**Versión:** V_1_1_0 | **Fecha:** 27/09/2026 | **Versión anterior:** V_1_0_0 (25/09/2026) – cambio CC-01 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

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
| **IMP-02** | Generación de rutas no implementada al inicio del Sprint | 11/09/2026        | La funcionalidad correspondiente a la US-003, con una estimación de 13 Story Points, no estaba implementada al inicio del Sprint 1.                          | Alto    | Alta      | Javier Curi Dayana    | 25/09/2026               | **En curso**       | —                   | Se implementaron el registro y la consulta de rutas en el prototipo, pero el orden de visita aún no se optimiza. Se completará integrando la API de OpenRouteService con factores de tráfico (CC-01). |
| **IMP-03** | Configuración del entorno para servicios de Firebase     | 11/09/2026        | La conexión con los servicios de Firebase requiere credenciales y configuración del entorno que no deben incorporarse al repositorio.                        | Medio   | Media     | Equipo de desarrollo  | 02/10/2026               | **Cerrado (CC-01)** | 27/09/2026         | Con el cambio de stack (CC-01) Firebase deja de utilizarse. La configuración de credenciales de los nuevos servicios se registra en IMP-05. |
| **IMP-04** | Capacidad limitada del equipo de desarrollo              | 11/09/2026        | El equipo está conformado por dos integrantes y debe distribuir el trabajo de frontend, backend, pruebas y documentación durante el desarrollo del proyecto. | Medio   | Media     | Ambos integrantes     | 02/10/2026               | **En seguimiento** | —                   | Se requiere una distribución organizada de las tareas y coordinación entre ambos integrantes para mantener el avance del proyecto y evitar concentración de actividades en una sola persona.                                                                              |
| **IMP-05** | Configuración del entorno para Neon y la API de optimización | 27/09/2026 | La cadena de conexión de Neon y la API key de OpenRouteService deben configurarse en cada entorno sin incorporarse al repositorio. | Medio | Media | Arroyo Canchari Henry | 02/10/2026 | **Pendiente** | — | Se documentarán las variables necesarias en los archivos `.env.example` del backend y del frontend. |
| **IMP-06** | Migración del stack tecnológico (CC-01) | 27/09/2026 | Los módulos de vehículos, pedidos, asignaciones y rutas, junto con sus pruebas, deben migrarse de FastAPI + Firestore a Node.js + Express + Neon, y el frontend de Vite a Next.js. | Alto | Alta | Ambos integrantes | Cierre del Sprint 1 | **En curso** | — | La migración se realizará por módulos, reutilizando las reglas de negocio validadas en el prototipo. |

---

## 3. Resumen de impedimentos

| Prioridad | Cantidad | IDs            |
| --------- | -------: | -------------- |
| Alta      |        3 | IMP-01, IMP-02, IMP-06 |
| Media     |        3 | IMP-03, IMP-04, IMP-05 |
| Baja      |        0 | —                      |

**Impedimentos resueltos:** 1 (IMP-01)

**Impedimentos cerrados por el cambio de stack:** 1 (IMP-03)

**Impedimentos en curso:** 2 (IMP-02, IMP-06)

**Impedimentos pendientes:** 1 (IMP-05)

**Impedimentos en seguimiento:** 1 (IMP-04)

---

## 4. Impedimentos resueltos durante el Sprint 1

| ID         | Impedimento                                              | Fecha de resolución | Resolución                                                                                  |
| ---------- | -------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| **IMP-01** | Falta de módulo dedicado para la gestión de vehículos    | 25/09/2026          | Se implementó el módulo de gestión de vehículos y se incorporó a la navegación del sistema. |

---

## 5. Seguimiento de impedimentos

Los impedimentos pendientes y en seguimiento serán revisados durante la planificación del **EW Sprint 2**, asignando responsables y fechas de atención de acuerdo con las necesidades del siguiente Sprint.

El **IMP-02** y el **IMP-06** son prioritarios para cerrar el Sprint 1: la migración de los módulos al stack vigente y el cálculo de rutas optimizadas con la API de OpenRouteService.

El **IMP-05** deberá ser atendido para que cada entorno de desarrollo cuente con la configuración de Neon y de la API de optimización, manteniendo las credenciales fuera del repositorio.

El **IMP-04** continuará en seguimiento mediante una distribución organizada de las actividades entre los integrantes del equipo, considerando las tareas de desarrollo, pruebas y documentación.

---

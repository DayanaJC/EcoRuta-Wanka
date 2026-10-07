# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 01. Informe de estado del proyecto V_1_0_0

**Versión:** V_1_0_0 | **Fecha:** 27/09/2026 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

**Sprint:** EW Sprint 1 (11/09/2026 – 25/09/2026)

**Sprint Goal:** Implementar la gestión básica de vehículos y pedidos para disponer de información válida que permita generar rutas optimizadas de reparto.

---

| Variables de control | Descripción del estado                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Alcance**          | Durante el Sprint 1 se planificaron 3 historias de usuario: US-001 Gestión de flota vehicular (5 puntos), US-002 Gestión de pedidos de reparto (5 puntos) y US-003 Generación de rutas optimizadas por vehículo (13 puntos). Las tres historias se consideran **COMPLETADAS**, alcanzando **23 de 23 Story Points planificados**.                                                                                                                                            |
| **Cronograma**       | El Sprint 1 fue planificado para el periodo **11/09/2026 al 25/09/2026**. Durante este periodo, el equipo se comprometió a desarrollar las siguientes historias de usuario: **US-001 Gestión de flota vehicular (5 SP), US-002 Gestión de pedidos de reparto (5 SP) y US-003 Generación de rutas optimizadas por vehículo (13 SP)**. El compromiso total del Sprint fue de **23 Story Points** y las tres historias planificadas fueron completadas al finalizar el periodo. |
| **Costos**           | El proyecto se desarrolló utilizando las herramientas y servicios considerados para su implementación, sin registrar sobrecostos durante el Sprint 1. La ejecución se mantiene dentro de lo previsto.                                                                                                                                                                                                                                                                        |
| **Calidad**          | Se realizaron pruebas para verificar las principales funcionalidades del backend. Se ejecutaron **71 pruebas y las 71 fueron aprobadas**. Además, la cobertura alcanzó **83,86 % en líneas, 82,42 % en sentencias y 65 % en ramas**.                                                                                                                                                                                                                                         |

### **Riesgos**

| **Riesgo**                                                                             | **Responsable**     | **Mitigación**                                                                                                     |
| -------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Dependencia de servicios externos para la geolocalización y optimización de rutas.     | Equipo del proyecto | Verificar el funcionamiento de los servicios utilizados y mantener correctamente configuradas las APIs necesarias. |
| Posibles inconvenientes durante la ejecución del sistema en diferentes entornos.       | Equipo del proyecto | Mantener documentada la configuración necesaria y realizar pruebas antes de cada entrega.                          |
| Posibles cambios o interrupciones en los servicios externos utilizados por el sistema. | Equipo del proyecto | Realizar verificaciones periódicas y mantener configuradas las variables necesarias para la ejecución del sistema. |

### **Próximos avances**

* Realizar pruebas adicionales de las funcionalidades implementadas.
* Mejorar la experiencia de uso de los módulos de vehículos, pedidos y rutas.
* Verificar la generación de rutas con diferentes escenarios de reparto.
* Incorporar pruebas automatizadas para el frontend.
* Realizar pruebas de compatibilidad en Firefox y Safari.
* Implementar un ambiente de staging para realizar pruebas antes de las entregas.
* Continuar con las funcionalidades pendientes del proyecto en los siguientes Sprints.

### **Notas**

#### **Estado de las Historias de Usuario**

| **Historia**                                              | **SP** | **Estado**     | **Criterios de aceptación (RF)**    | **Evidencia principal**                                                                                                         |
| --------------------------------------------------------- | -----: | -------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **US-001 – Gestión de flota vehicular**                   |      5 | **Completada** | RF-01, escenarios 1 a 3 verificados | En la aplicación se puede registrar un vehículo, modificar sus datos y activar o desactivar su estado.                          |
| **US-002 – Gestión de pedidos de reparto**                |      5 | **Completada** | RF-02, escenarios 1 a 3 verificados | En la aplicación se puede registrar un pedido indicando sus bultos, peso, medidas, horario de entrega, prioridad y ubicación.   |
| **US-003 – Generación de rutas optimizadas por vehículo** |     13 | **Completada** | RF-03, escenarios 1 a 3 verificados | En la aplicación se puede generar una ruta optimizada para el vehículo, mostrando el orden de las paradas y la ruta en el mapa. |

**Total del Sprint:** 23/23 Story Points completados.

Durante el Sprint 1 se completó el alcance planificado, correspondiente a las tres historias de usuario: gestión de vehículos, gestión de pedidos y generación de rutas optimizadas por vehículo.

Se realizaron pruebas del backend para verificar el funcionamiento de las principales funcionalidades desarrolladas. En total se ejecutaron **71 pruebas y las 71 fueron aprobadas**.

La demostración del Sprint se realizará directamente en la aplicación, mostrando la gestión de vehículos, la gestión de pedidos y la generación y visualización de rutas optimizadas en el mapa.

[Volver al README principal](../../README.md)

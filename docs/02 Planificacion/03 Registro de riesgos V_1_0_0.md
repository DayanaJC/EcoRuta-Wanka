# EcoRuta Wanka

*Optimizador de rutas sostenibles de última milla — Huancayo, Junín*

# 03. Registro de riesgos

**Versión:** V_1_0_0 | **Fecha:** 11/09/2026 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

---

## 1. Objetivo

El presente documento identifica, analiza y establece acciones de respuesta para los principales riesgos del proyecto **EcoRuta Wanka**.

La evaluación utiliza una matriz cuantitativa basada en **Probabilidad × Impacto**, permitiendo establecer la severidad de cada riesgo y definir medidas preventivas y de contingencia.

---

## 2. Metodología de evaluación

La evaluación utiliza una escala de 1 a 5 para cada riesgo.

### Probabilidad

* **1:** Muy baja
* **2:** Baja
* **3:** Media
* **4:** Alta
* **5:** Muy alta

### Impacto

* **1:** Insignificante
* **2:** Menor
* **3:** Moderado
* **4:** Mayor
* **5:** Catastrófico

**Severidad = Probabilidad × Impacto**

| Severidad | Clasificación |
| --------- | ------------- |
| 1 – 6     | Baja          |
| 8 – 12    | Media         |
| 15 – 25   | Alta          |

Cada riesgo cuenta con una acción preventiva y una acción de contingencia para responder en caso de que llegue a ocurrir.

---

## 3. Matriz de evaluación de riesgos

| ID     | Descripción del riesgo                                                                           | Categoría             | Prob. | Imp. | Severidad | Mitigación preventiva                                                                    | Contingencia reactiva                                                                             | Responsable           |
| ------ | ------------------------------------------------------------------------------------------------ | --------------------- | ----: | ---: | --------: | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------- |
| RSK-01 | Indisponibilidad temporal de Firebase o Firestore durante el desarrollo.                         | Técnica               |     2 |    4 |   8 Media | Revisar periódicamente el estado y consumo de los servicios.                             | Reprogramar las actividades dependientes del servicio hasta restablecerlo.                        | Responsable técnico   |
| RSK-02 | Dificultades del equipo para utilizar las tecnologías seleccionadas.                             | Recursos humanos      |     3 |    3 |   9 Media | Realizar coordinación y revisión técnica entre los integrantes.                          | Reasignar temporalmente las tareas y priorizar las funciones principales.                         | Equipo de desarrollo  |
| RSK-03 | Datos incompletos o incorrectos de pedidos y ubicaciones.                                        | Datos                 |     4 |    3 |  12 Media | Validar los datos antes de utilizarlos para generar rutas.                               | Corregir o completar los registros antes de generar nuevamente la ruta.                           | Operador              |
| RSK-04 | Problemas de conexión a Internet durante el uso del sistema.                                     | Infraestructura       |     3 |    3 |   9 Media | Verificar la conectividad durante las pruebas del sistema.                               | Reprogramar la operación o registrar temporalmente la información para procesarla posteriormente. | Responsable técnico   |
| RSK-05 | Dificultades de los usuarios para utilizar el sistema.                                           | Organizacional        |     3 |    3 |   9 Media | Realizar pruebas de usabilidad y proporcionar orientación básica.                        | Revisar la funcionalidad que presente dificultades y brindar asistencia al usuario.               | Equipo de desarrollo  |
| RSK-06 | Cambios en los requisitos durante el desarrollo del proyecto.                                    | Alcance               |     3 |    4 |  12 Media | Revisar y priorizar los requisitos antes de cada sprint.                                 | Evaluar el cambio y ajustar el backlog sin afectar el alcance principal.                          | Director del proyecto |
| RSK-07 | El sistema no alcanza el rendimiento esperado en operaciones principales.                        | Rendimiento           |     3 |    4 |  12 Media | Realizar pruebas de rendimiento durante el desarrollo.                                   | Optimizar las operaciones que presenten mayor tiempo de respuesta.                                | Responsable técnico   |
| RSK-08 | Condiciones climáticas desfavorables pueden afectar la planificación de los repartos.            | Operativo / Ambiental |     3 |    3 |   9 Media | Considerar las condiciones de entrega registradas durante la planificación.              | Reprogramar o actualizar la ruta cuando las condiciones afecten el reparto.                       | Operador              |
| RSK-09 | La falta de datos reales de una empresa limita la validación del sistema.                        | Alcance               |     4 |    3 |  12 Media | Utilizar datos simulados coherentes con el contexto de Huancayo.                         | Ampliar los datos de prueba y realizar nuevas validaciones.                                       | Director del proyecto |
| RSK-10 | El uso de Firebase puede generar costos si se superan los recursos disponibles para el proyecto. | Financiero            |     2 |    3 |    6 Baja | Controlar periódicamente el consumo de los servicios.                                    | Reducir el uso de recursos y ajustar la configuración del proyecto.                               | Responsable técnico   |
| RSK-11 | Exposición accidental de credenciales o información sensible del proyecto.                       | Seguridad             |     2 |    5 |  10 Media | Mantener credenciales fuera del repositorio y revisar los cambios mediante Pull Request. | Revocar y reemplazar inmediatamente las credenciales expuestas.                                   | Responsable técnico   |
| RSK-12 | Disponibilidad limitada de los dos integrantes puede generar retrasos.                           | Cronograma            |     4 |    4 |   16 Alta | Planificar las actividades y priorizar las funcionalidades principales.                  | Reorganizar las tareas y priorizar el alcance mínimo del proyecto.                                | Equipo de desarrollo  |
| RSK-13 | Conflictos durante la integración de cambios en Git y GitHub.                                    | Técnico / Proceso     |     2 |    3 |    6 Baja | Utilizar ramas y Pull Requests para integrar los cambios.                                | Resolver los conflictos antes de integrar nuevamente la rama.                                     | Responsable técnico   |
| RSK-14 | Problemas de seguridad o acceso pueden afectar las funciones del sistema.                        | Seguridad             |     3 |    4 |  12 Media | Aplicar autenticación, autorización y pruebas de acceso según los roles definidos.       | Bloquear temporalmente el acceso afectado y corregir la configuración de seguridad.               | Responsable técnico   |

---

## 4. Distribución de severidad

| Severidad | Cantidad | Riesgos                                                                                |
| --------- | -------: | -------------------------------------------------------------------------------------- |
| Alta      |        1 | RSK-12                                                                                 |
| Media     |       11 | RSK-01, RSK-02, RSK-03, RSK-04, RSK-05, RSK-06, RSK-07, RSK-08, RSK-09, RSK-11, RSK-14 |
| Baja      |        2 | RSK-10, RSK-13                                                                         |

Los riesgos con mayor severidad corresponden principalmente a la disponibilidad del equipo y a situaciones que pueden afectar directamente el cumplimiento del cronograma.

---

## 5. Relación con el proyecto

Los riesgos identificados se relacionan con los principales elementos de EcoRuta Wanka:

| Área                         | Riesgos relacionados   |
| ---------------------------- | ---------------------- |
| Requisitos y alcance         | RSK-06, RSK-09         |
| Datos y rutas                | RSK-03, RSK-08         |
| Tecnología e infraestructura | RSK-01, RSK-04, RSK-07 |
| Seguridad                    | RSK-11, RSK-14         |
| Equipo y cronograma          | RSK-02, RSK-12         |
| Desarrollo e integración     | RSK-10, RSK-13         |
| Usuarios                     | RSK-05                 |

---

## 6. Seguimiento de riesgos

Los riesgos serán revisados durante el desarrollo del proyecto y al finalizar cada sprint. Si cambia la probabilidad o el impacto de un riesgo, se actualizará su nivel de severidad y las acciones de respuesta correspondientes.

---



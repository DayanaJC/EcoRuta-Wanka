# EcoRuta Wanka

****Optimizador de rutas sostenibles de última milla — Huancayo, Junín****

# 03. Revisión del Sprint V_1_1_0

****Versión:**** V_1_1_0 | ****Fecha:**** 27/09/2026 | ****Organización:**** WankaLogística S.A.C. | ****Ubicación:**** Huancayo, Junín, Perú | ****Repositorio:**** github.com/DayanaJC/EcoRuta-Wanka

****Integrantes:**** Arroyo Canchari Henry, Javier Curi Dayana

****Sprint:**** EW Sprint 1 (11/09/2026 – 25/09/2026)

****Sprint Goal:**** Implementar la gestión básica de vehículos y pedidos para disponer de información válida que permita generar rutas optimizadas de reparto.

**---**

## Historias de Usuario completadas en este Sprint

Durante el Sprint 1 se completaron las siguientes historias de usuario:

| Historia                                              | Épica |     SP | Estado          | Requisito |
| ----------------------------------------------------- | ----- | -----: | --------------- | --------- |
| US-001 – Gestión de flota vehicular                   | EP-01 |      5 | **Completada**  | RF-01     |
| US-002 – Gestión de pedidos de reparto                | EP-02 |      5 | **Completada**  | RF-02     |
| US-003 – Generación de rutas optimizadas por vehículo | EP-03 |     13 | **Completada**  | RF-03     |
| **Total**                                             |       | **23** | **23 de 23 SP** |           |

### US-001 – Gestión de flota vehicular

Se implementó la gestión de vehículos. El sistema permite registrar, consultar, modificar y activar o desactivar vehículos.

| Escenario                                                     | Resultado  | Evidencia                                                                    |
| ------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------- |
| Registrar un vehículo correctamente                           | **Cumple** | Se puede registrar un vehículo con placa, capacidad y medidas de la caja.    |
| Actualizar la información de un vehículo                      | **Cumple** | Se puede modificar la información de un vehículo registrado.                 |
| Registrar un vehículo con información incorrecta o incompleta | **Cumple** | El sistema muestra mensajes cuando faltan datos o existen datos incorrectos. |

**Evidencia principal:**

![Evidencia 6: Gestión de vehículos](../06%20Otros/evidencias/Evidencia%206%20Gesti%C3%B3n%20de%20veh%C3%ADculos.png)

---

### US-002 – Gestión de pedidos de reparto

Se implementó la gestión de pedidos. El sistema permite registrar pedidos con información del cliente, ubicación, bultos, peso, medidas, horario y prioridad.

| Escenario                                      | Resultado  | Evidencia                                                                 |
| ---------------------------------------------- | ---------- | ------------------------------------------------------------------------- |
| Registrar un pedido correctamente              | **Cumple** | Se puede registrar un pedido con sus datos y ubicación.                   |
| Consultar y actualizar un pedido               | **Cumple** | Se pueden consultar y modificar los pedidos registrados.                  |
| Registrar un pedido con información incompleta | **Cumple** | El sistema informa cuando falta información necesaria, como la ubicación. |

**Evidencias principales:**

![Evidencia 7: Gestión de pedidos](../06%20Otros/evidencias/Evidencia%207%20Gesti%C3%B3n%20de%20pedidos.png)

![Evidencia 8: Registro de pedido con ubicación](../06%20Otros/evidencias/Evidencia%208%20Registro%20de%20pedido%20con%20ubicaci%C3%B3n.png)

![Evidencia 9: Marcar ubicación en el mapa](../06%20Otros/evidencias/Evidencia%209%20Marcar%20ubicaci%C3%B3n%20en%20el%20mapa.png)

---

### US-003 – Generación de rutas optimizadas por vehículo

Se implementó la generación de rutas optimizadas. El sistema considera el vehículo seleccionado, los pedidos disponibles y las características de la carga para generar el orden de las paradas.

| Escenario                                   | Resultado  | Evidencia                                                                               |
| ------------------------------------------- | ---------- | --------------------------------------------------------------------------------------- |
| Generar una ruta válida                     | **Cumple** | El sistema genera una ruta y muestra el orden de las paradas.                           |
| Generar una ruta con varios pedidos         | **Cumple** | El sistema considera la capacidad del vehículo y organiza los pedidos.                  |
| Generar una ruta sin información suficiente | **Cumple** | El sistema muestra un mensaje cuando no existen datos suficientes para generar la ruta. |

**Evidencias principales:**

![Evidencia 10: Generar ruta optimizada](../06%20Otros/evidencias/Evidencia%2010%20Generar%20ruta%20optimizada.png)

![Evidencia 11: Ruta optimizada y entregas registradas](../06%20Otros/evidencias/Evidencia%2011%20Ruta%20optimizada%20y%20entregas%20registradas.png)

---

## Demostración del trabajo completado

Demostración a los stakeholders de las funcionalidades implementadas.

| Elemento             | Detalle                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------- |
| **Stakeholder**      | Docente del curso Taller de Proyectos 2, como cliente y evaluador del proyecto académico. |
| **Presentan**        | Arroyo Canchari Henry y Javier Curi Dayana.                                               |
| **Entorno**          | Aplicación web y API del proyecto.                                                        |
| **Datos utilizados** | Escenario simulado de WankaLogística S.A.C. en Huancayo.                                  |

### Guion de la demostración

| Paso | Historia | Qué se muestra                                          | Resultado esperado                                                                | Evidencia                                                                                                                                             |
| ---- | -------- | ------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | US-001   | Lista de vehículos y registro de un vehículo nuevo.     | El vehículo aparece registrado y disponible para el reparto.                      | ![Evidencia 6: Gestión de vehículos](../06%20Otros/evidencias/Evidencia%206%20Gesti%C3%B3n%20de%20veh%C3%ADculos.png)                                 |
| 2    | US-002   | Lista y gestión de pedidos.                             | Se muestran los pedidos registrados.                                              | ![Evidencia 7: Gestión de pedidos](../06%20Otros/evidencias/Evidencia%207%20Gesti%C3%B3n%20de%20pedidos.png)                                          |
| 3    | US-002   | Registro de un pedido y búsqueda de su dirección.       | Se puede registrar el pedido con su ubicación.                                    | ![Evidencia 8: Registro de pedido con ubicación](../06%20Otros/evidencias/Evidencia%208%20Registro%20de%20pedido%20con%20ubicaci%C3%B3n.png)          |
| 4    | US-002   | Selección de la ubicación en el mapa.                   | El punto seleccionado queda registrado como ubicación de entrega.                 | ![Evidencia 9: Marcar ubicación en el mapa](../06%20Otros/evidencias/Evidencia%209%20Marcar%20ubicaci%C3%B3n%20en%20el%20mapa.png)                    |
| 5    | US-003   | Selección del vehículo y pedidos para generar una ruta. | El sistema permite generar la ruta con la información disponible.                 | ![Evidencia 10: Generar ruta optimizada](../06%20Otros/evidencias/Evidencia%2010%20Generar%20ruta%20optimizada.png)                                   |
| 6    | US-003   | Visualización de la ruta optimizada en el mapa.         | Se muestra el orden de las paradas y la ruta generada.                            | ![Evidencia 11: Ruta optimizada y entregas registradas](../06%20Otros/evidencias/Evidencia%2011%20Ruta%20optimizada%20y%20entregas%20registradas.png) |
| 7    | US-005   | Indicador de entregas dentro del horario.               | Se muestra el porcentaje de entregas realizadas dentro de la ventana establecida. | ![Evidencia 12: Indicador de entregas a tiempo](../06%20Otros/evidencias/Evidencia%2012%20Indicador%20de%20entregas%20a%20tiempo.png)                 |

## Pendientes

* Continuar con las funcionalidades de US-004 y US-005.
* Mejorar las pruebas del sistema.
* Realizar pruebas del frontend.
* Verificar la compatibilidad con otros navegadores.
* Continuar con las historias de usuario planificadas para los siguientes Sprints.
* Recoger las observaciones del docente durante la demostración.

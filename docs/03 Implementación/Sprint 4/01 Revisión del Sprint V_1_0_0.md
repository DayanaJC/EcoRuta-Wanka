# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 01. Revisión del Sprint V_1_0_0

**Nombre del Proyecto:** EcoRuta Wanka — Optimizador de rutas sostenibles de última milla para WankaLogística S.A.C.

**Líder del Proyecto:** Javier Curi Dayana

**Versión:** V_1_0_0 | **Fecha:** 19/11/2026 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

**Sprint:** EW Sprint 4 (14/11/2026 – 19/11/2026)

**Sprint Goal:** Mantener informado al cliente sobre su pedido mediante avisos durante el reparto y permitirle consultar su estado a través de un enlace público de seguimiento.

---

## Historias de Usuario completadas en este Sprint

Durante el Sprint 4 se completó la siguiente historia de usuario:

| Historia | Épica | SP | Estado | Requisito |
|---|---|---:|---|---|
| US-010 – Avisos al cliente y seguimiento público del pedido | EP-04 | 8 | **Completada** | RF-04 |
| **Total** | — | **8** | **8 de 8 SP** | — |

### US-010 – Avisos al cliente y seguimiento público del pedido

Se implementó la funcionalidad de avisos y seguimiento de pedidos para mantener informado al cliente durante el proceso de entrega.

El sistema prepara mensajes en tres momentos:

- **Pedido registrado:** informa que el pedido fue recibido.
- **En camino:** comunica que el pedido salió a reparto e indica la hora estimada de llegada.
- **Entregado o no entregado:** informa la hora de entrega o el motivo por el que no se pudo entregar.

Desde el detalle del pedido, el operador puede consultar los avisos, abrir WhatsApp con el mensaje preparado y copiar el enlace de seguimiento.

También se implementó una página pública de seguimiento, a la que el cliente puede ingresar sin iniciar sesión. En ella puede consultar el estado del pedido, las etapas del reparto, el mapa con el origen y destino, y los avisos relacionados. La información se actualiza automáticamente cada 15 segundos.

Además, se agregó la página **«¿Dónde está mi pedido?»** (`/seguimiento`), donde el cliente puede buscar utilizando el código del pedido, su DNI o RUC, o su número de celular.

Cuando encuentra un pedido, el sistema abre su seguimiento. Si encuentra varios, muestra una lista con sus códigos, estados y fechas. Si el dato ingresado no es válido, muestra un mensaje indicando qué debe escribir.

Para proteger la información de los clientes, la lista no muestra direcciones ni teléfonos y se permiten como máximo 20 consultas por minuto desde una misma conexión.

También se agregó el campo opcional **DNI o RUC** en el registro y edición de clientes, validando 8 dígitos para DNI y 11 para RUC.

**Cierre (Definition of Done):**

| Pull Request | Qué incluye | Commit de cierre |
|---|---|---|
| [PR #19](https://github.com/DayanaJC/EcoRuta-Wanka/pull/19) | Avisos al cliente y seguimiento público del pedido por enlace. | [`f226d86`](https://github.com/DayanaJC/EcoRuta-Wanka/commit/f226d86fa82a5ca836ecdccf1d4b5521a24c6b37) |
| [PR #20](https://github.com/DayanaJC/EcoRuta-Wanka/pull/20) | Consulta del pedido con código, DNI/RUC o teléfono. | [`a255c63`](https://github.com/DayanaJC/EcoRuta-Wanka/commit/a255c63) |

| Escenario | Resultado | Evidencia |
|---|---|---|
| Registrar un pedido y generar su aviso de recepción. | **Cumple.** Se prepara el mensaje de pedido recibido. | Evidencia 35. |
| Iniciar el reparto y registrar la entrega o no entrega. | **Cumple.** Se generan los avisos correspondientes con la hora o el motivo. | Evidencia 35. |
| Consultar los avisos desde el detalle del pedido. | **Cumple.** Se muestran los mensajes y la opción para abrir WhatsApp. | Evidencia 35. |
| Abrir un enlace de seguimiento válido. | **Cumple.** Se muestra el estado, las etapas, el mapa y los avisos. | Evidencia 36. |
| Abrir un enlace de seguimiento inválido. | **Cumple.** Se informa que no se encontró el pedido y no se muestran sus datos. | Evidencia 37. |
| Buscar un pedido por su código. | **Cumple.** Se abre directamente el seguimiento del pedido encontrado. | Evidencia 42. |
| Buscar pedidos por número de celular. | **Cumple.** Se muestran los pedidos encontrados sin exponer direcciones ni teléfonos. | Evidencia 43. |
| Ingresar un dato no válido. | **Cumple.** Se muestra un mensaje indicando qué dato debe ingresar. | Evidencia 44. |
| Registrar un DNI o RUC incorrecto. | **Cumple.** El formulario indica el formato válido y no guarda el dato. | Evidencia 45. |
| Realizar más de 20 consultas por minuto. | **Cumple.** La consulta 21 es bloqueada con código HTTP 429. | Prueba automática `consulta-pedido.test.js`. |

**Evidencia principal:**

**Evidencia 35: Avisos al cliente en el detalle del pedido**

<img src="../../06%20Otros/evidencias/Evidencia%2035%20Avisos%20al%20cliente%20en%20el%20detalle%20del%20pedido.png" width="280">

**Evidencia 36: Seguimiento público del pedido**

<img src="../../06%20Otros/evidencias/Evidencia%2036%20Seguimiento%20publico%20del%20pedido.png" width="280">

**Evidencia 37: Enlace de seguimiento no válido**

<img src="../../06%20Otros/evidencias/Evidencia%2037%20Enlace%20de%20seguimiento%20no%20valido.png" width="280">

**Evidencia 42: Consulta pública del pedido**

<img src="../../06%20Otros/evidencias/Evidencia%2042%20Consulta%20publica%20del%20pedido.png" width="280">

**Evidencia 43: Pedidos encontrados por teléfono**

<img src="../../06%20Otros/evidencias/Evidencia%2043%20Pedidos%20encontrados%20por%20telefono.png" width="280">

**Evidencia 44: Dato de consulta no válido**

<img src="../../06%20Otros/evidencias/Evidencia%2044%20Dato%20de%20consulta%20no%20valido.png" width="280">

**Evidencia 45: Campo DNI o RUC del cliente**

<img src="../../06%20Otros/evidencias/Evidencia%2045%20Campo%20DNI%20o%20RUC%20del%20cliente.png" width="280">

---

## Demostración del trabajo completado

Demostración de la funcionalidad implementada durante el Sprint 4, enfocada en los avisos al cliente y el seguimiento público de los pedidos.

| Elemento | Detalle |
|---|---|
| **Stakeholder** | Docente del curso Taller de Proyectos 2. |
| **Presentan** | Arroyo Canchari Henry y Javier Curi Dayana. |
| **Entorno** | Aplicación web EcoRuta Wanka desplegada en producción. |
| **Datos utilizados** | Pedidos de prueba de WankaLogística S.A.C. en Huancayo. |

### Guion de la demostración

| Paso | Historia | Qué se muestra | Resultado esperado | Evidencia |
|---:|---|---|---|---|
| 1 | US-010 | Detalle del pedido y sección de avisos. | Se muestran los mensajes y la opción de abrir WhatsApp. | ![Evidencia 35](../../06%20Otros/evidencias/Evidencia%2035%20Avisos%20al%20cliente%20en%20el%20detalle%20del%20pedido.png) |
| 2 | US-010 | Página pública de seguimiento. | Se visualizan el estado, las etapas, el mapa y los avisos. | ![Evidencia 36](../../06%20Otros/evidencias/Evidencia%2036%20Seguimiento%20publico%20del%20pedido.png) |
| 3 | US-010 | Ingreso a un enlace de seguimiento inválido. | Se informa que no se encontró el pedido. | ![Evidencia 37](../../06%20Otros/evidencias/Evidencia%2037%20Enlace%20de%20seguimiento%20no%20valido.png) |
| 4 | US-010 | Búsqueda de un pedido por su código. | Se abre el seguimiento del pedido encontrado. | ![Evidencia 42](../../06%20Otros/evidencias/Evidencia%2042%20Consulta%20publica%20del%20pedido.png) |
| 5 | US-010 | Búsqueda de pedidos por número de celular. | Se muestra la lista de pedidos encontrados. | ![Evidencia 43](../../06%20Otros/evidencias/Evidencia%2043%20Pedidos%20encontrados%20por%20telefono.png) |
| 6 | US-010 | Búsqueda con un dato no válido. | Se muestra un mensaje indicando qué dato ingresar. | ![Evidencia 44](../../06%20Otros/evidencias/Evidencia%2044%20Dato%20de%20consulta%20no%20valido.png) |
| 7 | US-010 | Formulario de cliente con el campo DNI o RUC. | Se valida que el documento tenga 8 u 11 dígitos. | ![Evidencia 45](../../06%20Otros/evidencias/Evidencia%2045%20Campo%20DNI%20o%20RUC%20del%20cliente.png) |

---

## Pendientes

| Pendiente | Descripción |
|---|---|
| Envío automático de avisos. | Actualmente el operador debe abrir WhatsApp y enviar el mensaje. Se podría integrar WhatsApp Business API o un servicio de SMS para automatizar el envío. |


---

[Volver al README principal](../../../README.md)
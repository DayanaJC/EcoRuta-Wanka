**PROYECTO FINAL DE CARRERA (PFA)**
**EcoRuta Wanka**
*Optimizador de rutas sostenibles de última milla — Huancayo, Junín*

# 01 Transformando a ágil

**Versión:** V_1_0_0   |   **Fecha:** 04/09/2026   |   **Organización:** WankaLogística S.A.C.   |   **Ubicación:** Huancayo, Junín, Perú   |   **Repositorio:** [github.com/DayanaJC/EcoRuta-Wanka](https://github.com/DayanaJC/EcoRuta-Wanka)
**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

**Documento fuente:** [06. Requisitos funcionales](../01%20Inicio/06.%20Requisitos%20funcionales%20V_1_0_0.md) y [07. Requisitos no funcionales](../01%20Inicio/07.%20Requisitos%20no%20funcionales%20V_1_0_0.md)

---

## 1. Introducción

El proyecto EcoRuta Wanka inició su ciclo de vida documentando los requisitos bajo un enfoque tradicional: los **Requerimientos Funcionales (RF-01 a RF-10)** y los **Requerimientos No Funcionales (RNF-01 a RNF-09)** se encuentran formalizados en la carpeta `docs/01 Inicio/`. Para ejecutar la fase de desarrollo con un ciclo iterativo e incremental, este artefacto transforma esos requisitos en **elementos ágiles**:

- Los **Requerimientos Funcionales** se agrupan en **Épicas** por dominio funcional y se descomponen en **Historias de Usuario (US)** con criterios de aceptación verificables en la notación BDD/Gherkin.
- Los **Requerimientos No Funcionales** se convierten en **Enablers** (historias técnicas) cuando exigen trabajo técnico específico y transversal (rendimiento, seguridad, accesibilidad, exactitud, disponibilidad, mantenibilidad), o se incorporan como **criterios de aceptación** de las historias cuando aplican al comportamiento de una funcionalidad concreta, o de forma **transversal al Definition of Done (DoD)** cuando constituyen prácticas de calidad del proceso.

La transformación conserva la trazabilidad completa con los requisitos originales, no altera ningún requisito de origen y respeta el **estado real de implementación** de la versión V_1_0_0 (Implementado, Parcial o Propuesto) registrado en los documentos fuente.

---

## 2. Metodología de transformación

La transformación se realizó siguiendo la consigna de la actividad de Planificación del Proyecto:

1. **De RF a Épicas:** los diez requisitos funcionales se agruparon en seis **Épicas** por dominio funcional (recursos de reparto, demanda de pedidos, motor de optimización, seguimiento visual, sostenibilidad y acceso). La agrupación buscó minimizar el número de épicas sin mezclar dominios de negocio diferentes, de manera que cada épica representa una capacidad de negocio del sistema real.

2. **De Épicas a Historias de Usuario:** cada RF fue cubierto por **una Historia de Usuario (US)** redactada con la plantilla **"Como … quiero … para …"**. Los escenarios de aceptación de cada historia se derivaron directamente de los criterios de aceptación ya definidos en el documento de requisitos funcionales (Ruta Gold, Ruta Feliz y Ruta Infeliz), respetando su contenido sin inventar comportamientos nuevos.

3. **Tratamiento de los RNF:** los RNF se analizaron uno por uno y se clasificaron según la consigna:
   - Se convierten en **Enabler** cuando representan trabajo técnico específico e independiente de una funcionalidad concreta (RNF-01 → EN-001, RNF-02 → EN-002, RNF-03 → EN-003, RNF-04 → EN-004, RNF-06 → EN-005, RNF-08 → EN-006).
   - Se incorporan como **criterio de aceptación** de una Historia de Usuario cuando definen un comportamiento verificable de esa funcionalidad (RNF-07 se incorpora a la US-008 como escenario de la asignación de conductores).
   - Se incorporan **transversalmente al DoD** cuando constituyen una práctica de calidad del proceso (RNF-05 en las pruebas de aceptación de usabilidad y RNF-09 en las pruebas de compatibilidad de navegadores).

4. **Trazabilidad:** todas las US y todos los Enablers conservan explícitamente su referencia al requisito de origen (RF-XX o RNF-XX), y la sección 9 mantiene la trazabilidad con los objetivos SMART (O1–O5) del Acta de Constitución tal como figura en la documentación de `docs/01 Inicio/`.

---

## 3. Mapa de trazabilidad RF → Épica → Historia de Usuario

| RF | Épica | ID Historia | Historia de Usuario | Prioridad | Story Points | Estado |
| -- | ----- | ----------- | ------------------- | --------- | ------------ | ------ |
| RF-01 | EP-01 | US-001 | Gestión de flota vehicular | Alta | 5 | Implementado |
| RF-02 | EP-02 | US-002 | Gestión de pedidos de reparto | Alta | 5 | Implementado |
| RF-03 | EP-03 | US-003 | Generación de rutas optimizadas por vehículo | Alta | 13 | Parcial |
| RF-04 | EP-04 | US-004 | Visualización de rutas en mapa interactivo | Alta | 8 | Parcial |
| RF-05 | EP-05 | US-005 | Dashboard de indicadores de sostenibilidad | Media | 8 | Propuesto |
| RF-06 | EP-05 | US-006 | Reporte de sostenibilidad en PDF | Media | 5 | Propuesto |
| RF-07 | EP-03 | US-007 | Re-optimización dinámica ante incidentes de tránsito | Alta | 13 | Propuesto |
| RF-08 | EP-01 | US-008 | Registro y asignación de conductores a rutas | Alta | 8 | Parcial |
| RF-09 | EP-02 | US-009 | Preferencias de entrega de clientes/bodegas | Media | 5 | Propuesto |
| RF-10 | EP-06 | US-010 | Autenticación y control de acceso por roles | Alta | 8 | Propuesto |

---

## 4. Épicas identificadas

### EP-01: Operación y gestión de recursos de reparto

- **Nombre:** Operación y gestión de recursos de reparto
- **Descripción:** Permite administrar la flota de vehículos (registro, actualización, bajas y estados operativos) y los conductores que ejecutan las rutas, así como la asignación de estos a los vehículos y rutas del día.
- **Requisitos relacionados:** RF-01, RF-08
- **Valor de negocio:** Garantiza que la flota y los conductores de WankaLogística estén correctamente registrados, disponibles y asignados, lo que constituye la base operativa del MVP (objetivo SMART O4).

### EP-02: Gestión de pedidos y preferencias de clientes

- **Nombre:** Gestión de pedidos y preferencias de clientes
- **Descripción:** Captura la demanda de reparto mediante pedidos con dirección, coordenadas geográficas y ventana horaria, y administra las preferencias de entrega de los clientes/bodegas que condicionan el ruteo.
- **Requisitos relacionados:** RF-02, RF-09
- **Valor de negocio:** Asegura que todos los pedidos ruteables tengan datos geográficos y de ventana horaria válidos, y que las preferencias del cliente se respeten en la planificación (objetivos SMART O2, O4 y O5).

### EP-03: Motor de optimización y generación de rutas

- **Nombre:** Motor de optimización y generación de rutas
- **Descripción:** Calcula rutas optimizadas de reparto por vehículo minimizando distancia y emisiones de CO₂, respetando la capacidad vehicular y las ventanas horarias, y recalcula rutas activas ante incidentes de tránsito.
- **Requisitos relacionados:** RF-03, RF-07
- **Valor de negocio:** Es el núcleo diferenciador del producto: reduce las emisiones de CO₂ y los costos de operación (objetivos SMART O1 y O3) y mejora el cumplimiento de ventanas horarias (O2).

### EP-04: Seguimiento y visualización de rutas

- **Nombre:** Seguimiento y visualización de rutas
- **Descripción:** Representa de forma visual y accesible cada ruta generada sobre la realidad de Huancayo, El Tambo, Chilca y Pilcomayo, informando el trazado, la congestión vial y las zonas de riesgo, con una interfaz usable por conductores de diverso nivel de alfabetización digital.
- **Requisitos relacionados:** RF-04
- **Valor de negocio:** Da transparencia operativa a despachadores y conductores y sostiene los objetivos de cumplimiento de ventanas (O2) y usabilidad (O5).

### EP-05: Sostenibilidad, indicadores y reportes

- **Nombre:** Sostenibilidad, indicadores y reportes
- **Descripción:** Calcula y presenta los indicadores de distancia recorrida, combustible estimado y CO₂ evitado, y permite exportar reportes en PDF para sustentar el impacto ambiental del servicio.
- **Requisitos relacionados:** RF-05, RF-06
- **Valor de negocio:** Evidencia y difunde el beneficio ambiental del optimizador, soportando el objetivo SMART O1 (reducción de emisiones).

### EP-06: Acceso seguro y control por roles

- **Nombre:** Acceso seguro y control por roles
- **Descripción:** Autentica a los usuarios y otorga únicamente los permisos correspondientes a su rol (Administrador, Operador, Conductor, Cliente/Bodega, Auditor Externo), conforme la Matriz de Control de Acceso del proyecto.
- **Requisitos relacionados:** RF-10
- **Valor de negocio:** Protege los datos personales conforme la Ley N° 29733, incrementa la usabilidad percibida (O5) y habilita la trazabilidad de auditoría exigida por el contexto académico.

## 5. Historias de Usuario (US)

Cada historia de usuario se identifica con el formato **ID:US-001 … ID:US-010** y se redacta con la plantilla **"Como [Rol], quiero [Acción], para [Beneficio]"** (campos ID, Título, Épica Relacionada y Redacción de la sección). Sus escenarios de aceptación se derivaron de los criterios de aceptación del documento de requisitos funcionales, respetando el estado real de implementación de cada funcionalidad.

### US-001: Gestión de flota vehicular

- **ID:** US-001
- **Título:** Gestión de flota vehicular
- **Épica Relacionada:** EP-01 Operación y gestión de recursos de reparto
- **Redacción:**
  Como **Administrador**,
  quiero **registrar, consultar, actualizar y desactivar los vehículos de la flota**,
  para **mantener un inventario exacto de capacidad y disponibilidad**.
- **Requisito fuente:** RF-01
- **Prioridad:** Alta
- **Story Points (Fibonacci):** 5
- **Dependencias:** Ninguna
- **Estado:** Implementado
- **Criterios de aceptación (Gherkin):**

```gherkin
Escenario: Registrar un vehículo válido
  Dado un vehículo con placa, tipo y capacidad de carga (peso y volumen) válidos y estado "activo"
  Cuando el Administrador lo registra
  Entonces el sistema guarda el vehículo, le asigna un identificador único y lo muestra en el listado de flota activa

Escenario: Registrar un vehículo con placa duplicada
  Dado un vehículo cuya placa ya se encuentra registrada en el sistema
  Cuando el Administrador intenta registrarlo nuevamente
  Entonces el sistema rechaza la operación, no crea el duplicado y despliega el mensaje "La placa ingresada ya se encuentra registrada"

Escenario: Desactivar un vehículo por mantenimiento
  Dado un vehículo activo que debe retirarse temporalmente por mantenimiento
  Cuando el Administrador actualiza su estado a "inactivo"
  Entonces el sistema lo excluye de la asignación automática de rutas hasta que su estado vuelva a "activo" (RN-012)
```

### US-002: Gestión de pedidos de reparto

- **ID:** US-002
- **Título:** Gestión de pedidos de reparto
- **Épica Relacionada:** EP-02 Gestión de pedidos y preferencias de clientes
- **Redacción:**
  Como **Operador**,
  quiero **registrar pedidos con dirección, coordenadas, ventana horaria y volumen/peso**,
  para **que todo pedido ruteable tenga datos geográficos y horarios válidos**.
- **Requisito fuente:** RF-02
- **Prioridad:** Alta
- **Story Points (Fibonacci):** 5
- **Dependencias:** US-001
- **Estado:** Implementado
- **Criterios de aceptación (Gherkin):**

```gherkin
Escenario: Registrar un pedido válido
  Dado un Operador con una bodega ya registrada en el sistema y un pedido con dirección, coordenadas geográficas válidas y ventana horaria dentro del horario operativo
  Cuando el Operador registra el pedido
  Entonces el sistema lo guarda en estado "pendiente" y lo deja disponible para la generación de rutas (RF-03)

Escenario: Ingresar coordenadas manualmente en una zona sin nomenclatura
  Dado que la dirección de entrega corresponde a una zona periférica sin nomenclatura estándar (Chilca, Pilcomayo)
  Cuando el Operador ingresa las coordenadas (latitud/longitud) levantadas en campo
  Entonces el sistema acepta el pedido con esas coordenadas y lo marca como apto para ruteo

Escenario: Rechazar un pedido sin coordenadas geográficas válidas
  Dado un Operador que intenta registrar un pedido sin coordenadas geográficas válidas (latitud/longitud) (RN-004)
  Cuando confirma el registro
  Entonces el sistema deniega la creación del pedido, lo mantiene fuera del conjunto ruteable y despliega el mensaje "El pedido requiere una ubicación válida para poder generar una ruta"
```

### US-003: Generación de rutas optimizadas por vehículo

- **ID:** US-003
- **Título:** Generación de rutas optimizadas por vehículo
- **Épica Relacionada:** EP-03 Motor de optimización y generación de rutas
- **Redacción:**
  Como **Despachador**,
  quiero **generar rutas optimizadas por vehículo que minimicen distancia y emisiones de CO₂**,
  para **reducir el impacto ambiental y el costo del reparto**.
- **Requisito fuente:** RF-03
- **Prioridad:** Alta
- **Story Points (Fibonacci):** 13
- **Dependencias:** US-001, US-002
- **Estado:** Parcial (heurística Haversine + vecino cercano + 2-opt implementada; la optimización avanzada y la validación del umbral de rendimiento del RNF-01 están pendientes)
- **Criterios de aceptación (Gherkin):**

```gherkin
Escenario: Generar ruta con pedidos factibles
  Dado que existen pedidos pendientes asignados a un vehículo en estado activo con capacidad suficiente
  Cuando el Operador solicita generar la ruta del día para ese vehículo
  Entonces el sistema retorna la ruta del vehículo respetando la capacidad vehicular (RN-005) y las ventanas horarias (RN-006)

Escenario: Generar ruta con un volumen de pedidos pequeño
  Dado que el vehículo seleccionado tiene un volumen de pedidos asignados pequeño (menor a 20)
  Cuando el Operador solicita la generación de la ruta del vehículo
  Entonces el sistema retorna una solución válida en un tiempo notablemente menor al máximo permitido, priorizando igualmente la minimización de emisiones de CO₂

Escenario: Generar ruta con la flota sin capacidad suficiente
  Dado que la capacidad del vehículo seleccionado es insuficiente para los pedidos que se intentan asignar
  Cuando el Operador solicita generar las rutas
  Entonces el sistema no genera una solución parcial silenciosa, sino que informa explícitamente qué pedidos quedaron sin asignar y el motivo ("capacidad de flota insuficiente")
```

### US-004: Visualización de rutas en mapa interactivo

- **ID:** US-004
- **Título:** Visualización de rutas en mapa interactivo
- **Épica Relacionada:** EP-04 Seguimiento y visualización de rutas
- **Redacción:**
  Como **Conductor y Despachador**,
  quiero **visualizar la ruta generada sobre el mapa con el orden de entrega, el nivel de congestión y las zonas de riesgo**,
  para **ejecutar el reparto de forma segura y dentro de la ventana horaria**.
- **Requisito fuente:** RF-04
- **Prioridad:** Alta
- **Story Points (Fibonacci):** 8
- **Dependencias:** US-003
- **Estado:** Parcial (el frontend muestra la secuencia de paradas y las métricas de la ruta; el mapa interactivo con congestión y zonas de riesgo es propuesto)
- **Criterios de aceptación (Gherkin):**

```gherkin
Escenario: Visualizar una ruta generada
  Dado una ruta generada para un vehículo
  Cuando el Conductor la visualiza
  Entonces el sistema muestra el trazado sobre el mapa con los puntos de entrega en orden

Escenario: Visualizar información de congestión y riesgo
  Dado información de tráfico disponible para la zona de reparto
  Cuando el Despachador visualiza la ruta
  Entonces el sistema muestra el nivel de congestión vial y las zonas de riesgo del trazado

Escenario: Visualizar la ruta sin información de tráfico
  Dado que el servicio externo de tráfico/congestión no responde
  Cuando el Conductor abre la vista de mapa de la ruta
  Entonces el sistema muestra el trazado de la ruta sin la capa de congestión y notifica "Información de tráfico no disponible en este momento", sin impedir el uso del mapa
```

### US-005: Dashboard de indicadores de sostenibilidad

- **ID:** US-005
- **Título:** Dashboard de indicadores de sostenibilidad
- **Épica Relacionada:** EP-05 Sostenibilidad, indicadores y reportes
- **Redacción:**
  Como **Administrador**,
  quiero **consultar los indicadores de distancia recorrida, combustible estimado y CO₂ evitado**,
  para **medir el impacto ambiental del optimizador**.
- **Requisito fuente:** RF-05
- **Prioridad:** Media
- **Story Points (Fibonacci):** 8
- **Dependencias:** US-003
- **Estado:** Propuesto
- **Criterios de aceptación (Gherkin):**

```gherkin
Escenario: Consultar indicadores con datos disponibles
  Dado que existen rutas completadas en el periodo seleccionado
  Cuando el Administrador abre el dashboard de sostenibilidad y selecciona un rango de fechas válido
  Entonces el sistema calcula y muestra distancia total, combustible estimado y kg de CO₂ evitados frente a una ruta manual de referencia

Escenario: Consultar indicadores sin datos del periodo
  Dado que no existen rutas completadas en el rango de fechas seleccionado
  Cuando el Administrador consulta el dashboard de sostenibilidad
  Entonces el sistema no muestra valores en cero engañosos, sino el mensaje "No hay datos de rutas completadas para el periodo seleccionado"

Escenario: Comparar dos periodos
  Dado que el Administrador desea comparar dos periodos distintos
  Cuando selecciona la opción de comparación mensual
  Entonces el sistema despliega ambos periodos lado a lado con la variación porcentual de cada indicador
```

### US-006: Reporte de sostenibilidad en PDF

- **ID:** US-006
- **Título:** Reporte de sostenibilidad en PDF
- **Épica Relacionada:** EP-05 Sostenibilidad, indicadores y reportes
- **Redacción:**
  Como **Administrador**,
  quiero **generar y descargar un reporte en PDF con los indicadores de sostenibilidad y las rutas ejecutadas**,
  para **sustentar el impacto ambiental del servicio ante la gerencia**.
- **Requisito fuente:** RF-06
- **Prioridad:** Media
- **Story Points (Fibonacci):** 5
- **Dependencias:** US-005
- **Estado:** Propuesto
- **Criterios de aceptación (Gherkin):**

```gherkin
Escenario: Generar reporte con datos disponibles
  Dado que el Administrador está visualizando el dashboard de sostenibilidad con datos de un periodo válido
  Cuando selecciona la opción "Exportar reporte PDF"
  Entonces el sistema genera un archivo PDF con los indicadores, el rango de fechas y la fecha de generación, y lo entrega para descarga

Escenario: Generar reporte filtrado por bodega/cliente
  Dado que el Administrador requiere el reporte para una única bodega/cliente
  Cuando filtra el dashboard por esa bodega antes de exportar
  Entonces el sistema genera el PDF restringido únicamente a los datos de la bodega filtrada

Escenario: Gestionar un error durante la generación del reporte
  Dado que ocurre un error durante la generación del archivo PDF
  Cuando el Administrador solicita la exportación
  Entonces el sistema no entrega un archivo corrupto, cancela la operación y despliega el mensaje "No se pudo generar el reporte, intente nuevamente"
```

### US-007: Re-optimización dinámica ante incidentes de tránsito

- **ID:** US-007
- **Título:** Re-optimización dinámica ante incidentes de tránsito
- **Épica Relacionada:** EP-03 Motor de optimización y generación de rutas
- **Redacción:**
  Como **Despachador**,
  quiero **recalcular las rutas activas cuando un incidente de tránsito demora la entrega más de lo permitido**,
  para **mantener el plan de reparto dentro de las ventanas horarias**.
- **Requisito fuente:** RF-07
- **Prioridad:** Alta
- **Story Points (Fibonacci):** 13
- **Dependencias:** US-003, US-004
- **Estado:** Propuesto
- **Criterios de aceptación (Gherkin):**

```gherkin
Escenario: Re-optimizar cuando el incidente supera el umbral
  Dado un incidente de tránsito reportado sobre el trazado vigente que incrementa el tiempo estimado de llegada de una parada pendiente en más del 20% (RN-007)
  Cuando el sistema evalúa la ruta activa en curso
  Entonces el sistema recalcula la ruta restante en menos de 30 segundos y notifica al Conductor la nueva secuencia de paradas

Escenario: Conservar la ruta si el incidente no afecta paradas pendientes
  Dado un incidente reportado que no afecta ninguna parada pendiente de la ruta activa
  Cuando el sistema evalúa el impacto del incidente
  Entonces el sistema conserva la ruta original y notifica que no fue necesario re-optimizar

Escenario: Perder la conexión durante la re-optimización
  Dado que se pierde la conexión del dispositivo del Conductor durante la re-optimización
  Cuando el sistema intenta notificar la nueva ruta
  Entonces el sistema conserva la última ruta válida en el dispositivo del Conductor y sincroniza la actualización apenas se restablezca la conectividad
```

### US-008: Registro y asignación de conductores a rutas

- **ID:** US-008
- **Título:** Registro y asignación de conductores a rutas
- **Épica Relacionada:** EP-01 Operación y gestión de recursos de reparto
- **Redacción:**
  Como **Administrador**,
  quiero **registrar a los conductores y asignarlos a vehículos y rutas**,
  para **garantizar que cada reparto cuente con un conductor habilitado dentro de su jornada permitida**.
- **Requisito fuente:** RF-08
- **Prioridad:** Alta
- **Story Points (Fibonacci):** 8
- **Dependencias:** US-001, US-003
- **Estado:** Parcial (existe asignación pedido → vehículo; el registro de conductores, la jornada legal y el "modo conductor" son propuestos)
- **Criterios de aceptación (Gherkin):**

```gherkin
Escenario: Registrar un conductor habilitado
  Dado un conductor con documento de identidad, licencia de conducir válida y datos personales completos
  Cuando el Administrador lo registra
  Entonces el sistema lo guarda y lo muestra en la lista de conductores disponibles

Escenario: Asignar un conductor a una ruta dentro de su jornada
  Dado que existe un conductor registrado y disponible, y una ruta generada sin conductor asignado
  Cuando el Operador asigna el conductor a la ruta
  Entonces el sistema vincula al conductor con la ruta y el vehículo correspondiente, y la hace visible en el "modo conductor" de dicho usuario

Escenario: Rechazar la asignación que excede la jornada máxima legal
  Dado que el Operador intenta asignar un conductor que ya excedió el tiempo máximo de conducción permitido según el Reglamento Nacional de Administración de Transporte (D.S. N.° 017-2009-MTC y sus modificatorias) en la fecha seleccionada (RN-003)
  Cuando confirma la asignación
  Entonces el sistema rechaza la asignación y despliega el mensaje "El conductor supera la jornada máxima legal permitida para esta fecha"
```

### US-009: Preferencias de entrega de clientes/bodegas

- **ID:** US-009
- **Título:** Preferencias de entrega de clientes/bodegas
- **Épica Relacionada:** EP-02 Gestión de pedidos y preferencias de clientes
- **Redacción:**
  Como **Cliente/Bodega**,
  quiero **definir mis preferencias de entrega (ventana horaria preferida y exigencias de acceso o manipuleo)**,
  para **recibir los pedidos en las condiciones que mejor se adaptan a mi operación**.
- **Requisito fuente:** RF-09
- **Prioridad:** Media
- **Story Points (Fibonacci):** 5
- **Dependencias:** US-002
- **Estado:** Propuesto
- **Criterios de aceptación (Gherkin):**

```gherkin
Escenario: Registrar una preferencia de entrega válida
  Dado una bodega ya registrada en el sistema
  Cuando el Cliente/Bodega actualiza su ventana horaria preferida dentro del horario operativo del sistema (5:00 a.m.–10:00 p.m.)
  Entonces el sistema guarda la preferencia y la aplica como restricción en la siguiente generación de rutas (RF-03)

Escenario: Rechazar una ventana fuera del horario operativo
  Dado que el Cliente/Bodega intenta definir una ventana horaria fuera del horario operativo del sistema (RN-011)
  Cuando guarda la preferencia
  Entonces el sistema rechaza el valor ingresado y despliega el mensaje "La ventana horaria debe estar entre las 05:00 y las 22:00"

Escenario: Actualizar una preferencia existente
  Dado un cliente/bodega con una preferencia registrada previamente
  Cuando el usuario la modifica
  Entonces el sistema actualiza la preferencia y la aplica a la siguiente planificación de rutas
```

### US-010: Autenticación y control de acceso por roles

- **ID:** US-010
- **Título:** Autenticación y control de acceso por roles
- **Épica Relacionada:** EP-06 Acceso seguro y control por roles
- **Redacción:**
  Como **usuario del sistema**,
  quiero **autenticarme con mis credenciales y acceder únicamente a las funciones de mi rol**,
  para **operar de forma segura y bajo la Ley de Protección de Datos Personales**.
- **Requisito fuente:** RF-10
- **Prioridad:** Alta
- **Story Points (Fibonacci):** 8
- **Dependencias:** Ninguna
- **Estado:** Propuesto
- **Criterios de aceptación (Gherkin):**

```gherkin
Escenario: Iniciar sesión con credenciales correctas
  Dado un usuario registrado que ingresa su correo y contraseña correctos
  Cuando envía el formulario de inicio de sesión
  Entonces el sistema autentica al usuario, genera una sesión válida y le presenta únicamente los módulos habilitados para su rol según la Matriz de Control de Acceso

Escenario: Bloquear la cuenta por intentos fallidos repetidos
  Dado un usuario que ingresa una contraseña incorrecta por tercera vez consecutiva (RN-001)
  Cuando envía el tercer intento fallido
  Entonces el sistema bloquea la cuenta durante 15 minutos, registra el evento en el log de auditoría y despliega el mensaje "Cuenta bloqueada temporalmente por múltiples intentos fallidos"

Escenario: Solicitar reautenticación por inactividad
  Dado un usuario autenticado que permanece inactivo por un periodo prolongado
  Cuando intenta realizar una nueva acción sobre el sistema
  Entonces el sistema solicita reautenticación antes de permitir la operación, preservando el estado no guardado cuando sea posible

Escenario: Eliminación de un registro por el rol inadecuado
  Dado un registro de datos personales en el sistema
  Cuando un usuario que no es Administrador intenta eliminarlo definitivamente
  Entonces el sistema deniega la operación y solo permite la eliminación definitiva al rol Administrador
```

## 6. Historias Técnicas (Enablers)

Los Enablers representan el trabajo técnico transversal que hace posible que las Historias de Usuario se entreguen con la calidad exigida por los Requerimientos No Funcionales.

### EN-001: Cumplimiento de los umbrales de rendimiento

- **ID:** EN-001
- **Título:** Cumplimiento de los umbrales de rendimiento
- **Tipo:** Enabler / Historia Técnica
- **Requisito fuente:** RNF-01
- **Redacción:**
  Como **Equipo de Plataforma**,
  quiero **garantizar los tiempos de generación de ruta y de re-optimización dentro de los umbrales establecidos**,
  para **soportar una operación de reparto fluida en tiempo real**.
- **Story Points (Fibonacci):** 8
- **Estado:** Parcial
- **Criterios de aceptación (Gherkin):**

```gherkin
Escenario: Generar ruta dentro del umbral de rendimiento
  Dado un escenario máximo con hasta 150 pedidos y 15 vehículos simultáneos
  Cuando el sistema genera la ruta optimizada en operación normal
  Entonces el percentil 95 de la latencia de generación no supera los 45 segundos (RNF-01)

Escenario: Re-optimizar dentro del umbral de rendimiento
  Dado un incidente de tránsito que dispara una re-optimización
  Cuando el sistema recalcula la ruta activa
  Entonces el percentil 95 de la respuesta no supera los 30 segundos

Escenario: Mantener el rendimiento bajo carga concurrente
  Dado un escenario de carga con solicitudes de ruteo simultáneas
  Cuando el sistema procesa las solicitudes de forma concurrente
  Entonces los tiempos de respuesta se mantienen dentro de los umbrales establecidos
```

### EN-002: Seguridad de la información

- **ID:** EN-002
- **Título:** Seguridad de la información
- **Tipo:** Enabler / Historia Técnica
- **Requisito fuente:** RNF-02
- **Redacción:**
  Como **Equipo de Plataforma**,
  quiero **cifrar las credenciales y los datos personales y proteger las comunicaciones**,
  para **cumplir la Ley N° 29733 y mitigar las vulnerabilidades del OWASP Top 10**.
- **Story Points (Fibonacci):** 8
- **Estado:** Parcial
- **Criterios de aceptación (Gherkin):**

```gherkin
Escenario: Almacenar credenciales cifradas
  Dado un usuario que registra una contraseña
  Cuando el sistema la almacena
  Entonces el sistema la guarda mediante un algoritmo de hash seguro y nunca en texto plano

Escenario: Denegar el acceso sin token válido
  Dado un usuario no autenticado o con un token inválido
  Cuando el usuario realiza una solicitud a un recurso protegido
  Entonces el sistema responde con no autorizado y no entrega datos

Escenario: Cifrar los datos personales
  Dado un registro de datos personales de un cliente o conductor almacenado en el sistema
  Cuando el sistema persiste o transmite el registro
  Entonces los datos se cifran en reposo y en tránsito conforme la normativa aplicable
```

### EN-003: Accesibilidad y diseño responsivo

- **ID:** EN-003
- **Título:** Accesibilidad y diseño responsivo
- **Tipo:** Enabler / Historia Técnica
- **Requisito fuente:** RNF-03
- **Redacción:**
  Como **Equipo de Plataforma**,
  quiero **garantizar la navegación por teclado, el contraste adecuado y la adaptación a distintos tamaños de pantalla**,
  para **que usuarios de diverso nivel de alfabetización digital puedan operar el sistema**.
- **Story Points (Fibonacci):** 5
- **Estado:** Propuesto
- **Criterios de aceptación (Gherkin):**

```gherkin
Escenario: Navegar todas las vistas mediante teclado
  Dado un usuario que opera el sistema únicamente con el teclado
  Cuando el usuario recorre las funcionalidades principales
  Entonces todas las vistas y acciones son accesibles y alcanzables sin uso del mouse

Escenario: Adaptar la interfaz a pantallas móviles
  Dado un conductor que accede desde un dispositivo con pantalla reducida
  Cuando el conductor utiliza la vista de rutas
  Entonces la interfaz se muestra de forma legible y operativa en el tamaño de pantalla del dispositivo

Escenario: Verificar la accesibilidad con auditoría automatizada
  Dado las vistas del "modo conductor" del sistema
  Cuando se ejecuta la auditoría automatizada de accesibilidad (Lighthouse/axe)
  Entonces se cumple WCAG 2.1 nivel AA con un puntaje de accesibilidad superior o igual a 90/100 (RNF-03)
```

### EN-004: Exactitud funcional y de los indicadores

- **ID:** EN-004
- **Título:** Exactitud funcional y de los indicadores
- **Tipo:** Enabler / Historia Técnica
- **Requisito fuente:** RNF-04
- **Redacción:**
  Como **Equipo de Plataforma**,
  quiero **verificar la exactitud de los cálculos de distancia, combustible y CO₂ y de los indicadores del dashboard**,
  para **que las decisiones ambientales y operativas se basen en cifras confiables**.
- **Story Points (Fibonacci):** 5
- **Estado:** Propuesto
- **Criterios de aceptación (Gherkin):**

```gherkin
Escenario: Verificar la exactitud de la distancia de una ruta
  Dado una ruta completada con datos de vehículo (tipo, consumo) y de ruta ya registrados
  Cuando el sistema calcula la distancia, el combustible estimado y el CO₂ evitado
  Entonces la desviación entre el valor calculado y el valor de referencia validado manualmente es menor o igual al 5% (RNF-04, RN-002)

Escenario: Reproducir los indicadores con los mismos datos
  Dado un mismo conjunto de datos de entrada en dos ejecuciones
  Cuando el sistema calcula los indicadores de sostenibilidad
  Entonces ambos resultados coinciden dentro de la tolerancia definida

Escenario: Validar los indicadores del dashboard
  Dado un periodo con rutas ejecutadas
  Cuando el dashboard presenta distancia recorrida, combustible estimado y CO₂ evitado
  Entonces los valores presentados coinciden con los cálculos internos de referencia
```

### EN-005: Disponibilidad y modo sin conexión

- **ID:** EN-005
- **Título:** Disponibilidad y modo sin conexión
- **Tipo:** Enabler / Historia Técnica
- **Requisito fuente:** RNF-06
- **Redacción:**
  Como **Equipo de Plataforma**,
  quiero **garantizar la disponibilidad del sistema y que el conductor pueda operar sin conexión**,
  para **no interrumpir el reparto en zonas sin cobertura**.
- **Story Points (Fibonacci):** 8
- **Estado:** Parcial
- **Criterios de aceptación (Gherkin):**

```gherkin
Escenario: Operar sin conexión a internet
  Dado un conductor que pierde la conexión a internet durante el reparto
  Cuando el conductor consulta su ruta asignada
  Entonces la ruta permanece disponible en el dispositivo de forma local

Escenario: Sincronizar los datos al recuperar la conexión
  Dado un conductor que registró avances de entrega sin conexión
  Cuando el dispositivo recupera la conectividad
  Entonces el sistema sincroniza automáticamente los avances con el servidor

Escenario: Mantener la disponibilidad del servicio
  Dado el sistema en operación dentro de su horario operativo (5:00 a.m.–10:00 p.m.)
  Cuando los usuarios consultan la aplicación
  Entonces el servicio responde con una disponibilidad mensual mayor o igual al 99.5% (RNF-06)
```

### EN-006: Arquitectura Hexagonal, mantenibilidad y calidad de código

- **ID:** EN-006
- **Título:** Arquitectura Hexagonal, mantenibilidad y calidad de código
- **Tipo:** Enabler / Historia Técnica
- **Requisito fuente:** RNF-08
- **Redacción:**
  Como **Equipo de Plataforma**,
  quiero **mantener una arquitectura hexagonal basada en puertos y adaptadores, con pruebas automatizadas, análisis de calidad y despliegue continuo**,
  para **sostener la evolución del producto sin degradar su confiabilidad**.
- **Story Points (Fibonacci):** 8
- **Estado:** Implementado
- **Criterios de aceptación (Gherkin):**

```gherkin
Escenario: Ejecutar la suite de pruebas en cada integración
  Dado una pull request que propone cambios al código
  Cuando el flujo de integración continua se ejecuta
  Entonces la suite de pruebas automatizadas corre y el código pasa los umbrales de calidad antes de fusionarse

Escenario: Garantizar la cobertura de pruebas requerida
  Dado el reporte de cobertura generado en el pipeline
  Cuando se evalúa la calidad de una integración
  Entonces la cobertura de los módulos de reglas de negocio y del motor de optimización alcanza al menos el 70% (RNF-08) y la cobertura global del código entregado alcanza al menos el 80% (criterio del DoD)

Escenario: Documentar los contratos de la API
  Dado un contrato de la API REST expuesto a otros componentes
  Cuando se modifica o crea un contrato de servicio
  Entonces la especificación OpenAPI se mantiene actualizada en el repositorio
```

> **Nota:** RNF-08 establece en su documento original una cobertura de pruebas unitarias **≥ 70%** en los módulos de reglas de negocio y del motor de optimización. La implementación existente organiza su separación de responsabilidades por capas (**schemas → presentation → business → data**) como parte interna de la **Arquitectura Hexagonal (puertos y adaptadores)**, no como una arquitectura distinta. El **≥ 80%** del escenario anterior corresponde al **criterio global del DoD** exigido por la consigna del PFA y no modifica el valor original de RNF-08, que se conserva en la trazabilidad de requisitos.

## 7. Matriz RNF → Enabler / Historia de Usuario

| RNF | Enabler / Historia | Story Points | Criterio transversal (DoD) | Estado |
| --- | ------------------ | ------------ | -------------------------- | ------ |
| RNF-01 Desempeño | EN-001 | 8 | Umbrales de rendimiento verificados en las pruebas de carga | Parcial |
| RNF-02 Seguridad | EN-002 | 8 | Análisis OWASP y cifrado aplicado a datos y credenciales | Parcial |
| RNF-03 Accesibilidad | EN-003 | 5 | Auditoría Lighthouse/axe con puntaje ≥ 90/100 y cumplimiento de WCAG 2.1 AA en las vistas del "modo conductor" | Propuesto |
| RNF-04 Exactitud funcional e indicadores | EN-004 | 5 | Desviación ≤ 5% verificada en los casos de prueba de indicadores | Propuesto |
| RNF-05 Usabilidad (SUS) | DoD (transversal) | N/A | Prueba de usabilidad que verifica el objetivo del RNF original (≥ 90% de los usuarios de prueba con puntaje ≥ 4/5 en la encuesta SUS simplificada, O5), con evidencia de la evaluación | Propuesto |
| RNF-06 Disponibilidad y modo offline | EN-005 | 8 | N/A | Parcial |
| RNF-07 Jornada de conductores | US-008 (criterio de aceptación) | N/A | Asignación de conductores dentro del tiempo máximo de conducción y jornada legal (Reglamento Nacional de Administración de Transporte, D.S. N.° 017-2009-MTC, RN-003) | Propuesto |
| RNF-08 Arquitectura, mantenibilidad y pruebas | EN-006 | 8 | Gates de calidad en el pipeline (SonarQube/CodeQL). El RNF original exige cobertura ≥ 70% en reglas de negocio y motor de optimización; el ≥ 80% es criterio global del DoD | Implementado |
| RNF-09 Portabilidad / Compatibilidad | DoD (transversal) | N/A | Pruebas de compatibilidad en los 2 navegadores móviles y 2 de escritorio de mayor uso de los usuarios de prueba, sin errores bloqueantes, con evidencia de las pruebas | Implementado |

---

## 8. Definition of Done (DoD)

Una Historia de Usuario o un Enabler se considera **completado** cuando cumple todos los criterios del DoD para la entrega en curso:

1. La funcionalidad se desarrolla dentro de una rama `feature/` y se integra mediante **pull request** con **peer review** aprobado.
2. La **cobertura de pruebas alcanza al menos el 80%** del código entregado (consigna del proyecto).
3. El código pasa los **análisis de calidad (SonarQube)** y de **seguridad (CodeQL)** sin errores ni vulnerabilidades críticas.
4. El despliegue se realiza de forma **automatizada en el ambiente de Staging** mediante CI/CD.
5. La funcionalidad cumple todos sus **criterios de aceptación (escenarios Gherkin)** y cuenta con **evidencia de las pruebas funcionales** ejecutadas.
6. No quedan errores críticos conocidos sin resolver en la funcionalidad entregada.
7. Los contratos de la API se mantienen documentados con **OpenAPI/Swagger** para la funcionalidad afectada.
8. La **documentación técnica** del proyecto se actualiza según los cambios incorporados.
9. Los objetivos SMART (O1–O5) del Acta de Constitución afectados por la funcionalidad se reportan en el Dashboard de Control del proyecto.
10. **RNF-05 (Usabilidad / Satisfacción):** la prueba de usabilidad verifica el objetivo establecido en el RNF original — **≥ 90% de los usuarios de prueba obtienen un puntaje ≥ 4/5 en la encuesta SUS simplificada** al completar las tareas clave (ver ruta asignada, reportar incidente, marcar entrega) sin asistencia externa (O5 del Acta de Constitución) — y queda **evidencia de la evaluación** (resultados registrados por usuario y sesión). No modifica el valor original del RNF.
11. **RNF-09 (Portabilidad / Compatibilidad):** se realizan **pruebas de compatibilidad en los 2 navegadores móviles y los 2 navegadores de escritorio de mayor uso reportados por los usuarios de prueba**, sin errores bloqueantes ni pérdida de funcionalidad crítica, y queda **evidencia de las pruebas** (reporte de ejecución por navegador/dispositivo). No modifica el valor original del RNF.

---

## 9. Trazabilidad general con los objetivos del proyecto

Los valores cuantitativos oficiales de los objetivos SMART se encuentran definidos en el documento "[02. Acta de constitución](../01%20Inicio/02.%20Acta%20de%20constituci%C3%B3n%20V_1_0_0.md)" de `docs/01 Inicio/`. La siguiente matriz resume la vinculación de los elementos ágiles con dichos objetivos y sigue la trazabilidad RF → objetivo del documento 06 (sección 4).

| Objetivo (Acta) | Épicas relacionadas | Historias / Enablers principales |
| --------------- | ------------------- | -------------------------------- |
| O1 – Reducción de emisiones y sostenibilidad | EP-03, EP-05 | US-003, US-005, US-006 |
| O2 – Cumplimiento de ventanas horarias e indicadores operativos | EP-02, EP-03, EP-04 | US-004, US-007, US-009 |
| O3 – Reducción de costos de operación | EP-03 | US-003 |
| O4 – Calidad y confiabilidad de la información operativa (MVP) | EP-01, EP-02, EP-03 | US-001, US-002, US-003, US-008 |
| O5 – Usabilidad y accesibilidad del sistema | EP-02, EP-04, EP-06, EN-003 | US-004, US-009, US-010, EN-003 (y RNF-05 vía DoD) |

---

## 10. Consideraciones sobre el estado de implementación

- Los estados **Implementado / Parcial / Propuesto** de cada US y Enabler provienen directamente de los documentos de requisitos (docs 06 y 07) y no han sido modificados por este artefacto.
- **RF-01, RF-02, RNF-08 y RNF-09** se encuentran en estado **Implementado**; **RF-03, RF-04, RF-08, RNF-01, RNF-02 y RNF-06** en estado **Parcial**; el resto de requisitos se encuentra en estado **Propuesto** y será priorizado en los próximos sprints.
- Reglas de negocio incorporadas como escenarios: **RN-001** (bloqueo de 15 minutos tras 3 intentos fallidos) y **RN-009** (hard-delete solo rol Administrador) en US-010; **RN-003 / RNF-07** (tiempo máximo de conducción del conductor según el Reglamento Nacional de Administración de Transporte, D.S. N.° 017-2009-MTC) en US-008; **RN-004** (pedido sin coordenadas válidas no ruteable) en US-002; **RN-005** (capacidad insuficiente) y **RN-006** (ventana horaria) en US-003; **RN-007** (umbral del 20% que dispara la re-optimización) en US-007; **RN-011** (ventana horaria dentro del horario operativo 5:00–22:00) en US-009; y **RN-012** (vehículo inactivo excluido de la optimización) en US-001.
- Las **estimaciones en Story Points** utilizan la escala de Fibonacci (1, 2, 3, 5, 8, 13) exigida por la consigna, asignadas según complejidad, riesgo, dependencias e incertidumbre de cada elemento. Las historias del motor de rutas (US-003) y de la re-optimización dinámica (US-007), por ser las de mayor complejidad y riesgo (R-05), concentran el máximo de 13 puntos; el resto refleja esfuerzo medio o bajo. Los valores quedan registrados en las secciones 3, 5, 6 y 7 para su carga posterior en Jira (Artefacto 2).
- **EN-006** describe la arquitectura tal como está documentada en el proyecto: **Arquitectura Hexagonal (puertos y adaptadores)** del backend FastAPI, cuya implementación organiza internamente sus responsabilidades por capas (schemas → presentation → business → data) como separación interna de la arquitectura hexagonal, y un frontend React/Vite acoplado únicamente a la API REST (docs. 07, 10 y 12). No se utiliza ni se inventa una arquitectura de microservicios.
- El DoD exige **cobertura ≥ 80%** de pruebas, requerimiento de la consigna del PFA que puede ser más estricto que el valor original de RNF-08; el valor original se conserva en la trazabilidad de requisitos y el estándar de calidad se aplica de forma transversal.
- Este artefacto **no crea ni inventa requisitos nuevos**: toda funcionalidad o criterio aquí descrito proviene de la documentación de `docs/01 Inicio/` (docs 06, 07 y las reglas de negocio RN y objetivos O asociados).
- Cualquier cambio posterior al alcance o al estado de los elementos ágiles requerirá la **actualización del Historial de Control de Cambios** y la trazabilidad con los requisitos de origen.

---

## 11. Historial de Control de Cambios

| Versión | Fecha | Responsable | Descripción del cambio |
| ------- | ----- | ----------- | ---------------------- |
| V_1_0_0 | 04/09/2026 | Equipo PFA | Creación y revisión del artefacto de transformación ágil, incluyendo trazabilidad RF/RNF, Épicas, Historias de Usuario, Enablers, criterios Gherkin y DoD, alineado con los documentos fuente (docs. 02, 06, 07 y 09). |


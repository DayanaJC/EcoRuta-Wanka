# Retrospectiva del sprint

**Nombre del Proyecto:** EcoRuta Wanka — Optimizador de rutas sostenibles de última milla (WankaLogística S.A.C., Huancayo, Junín)

**Líder del Proyecto:** Javier Curi Dayana

| Versión | Fecha | Sprint | Participantes |
| --- | --- | --- | --- |
| V_1_0_0 | 02/10/2026 | EW Sprint 1 (11/09/2026 – 02/10/2026) | Javier Curi Dayana (líder), Arroyo Canchari Henry |

[⬅ Volver al README](../../README.md) · Documentos del Sprint 1: [01 Informe de estado](01%20Informe%20de%20estado%20del%20proyecto%20V_1_0_0.md) · [02 Registro de Impedimentos](02%20Registro%20de%20Impedimentos%20V_1_0_0.md) · [03 Revisión del Sprint](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md)

---

**Datos del Sprint que sustentan este análisis:** 23 de 23 SP completados · Sprint ampliado de 14 a 21 días · 15 impedimentos (8 resueltos) · 4 PR integrados sin revisión · 20 de 26 commits de un solo integrante · 71 pruebas con 83,86 % de cobertura de líneas en el backend · 0 pruebas automatizadas en el frontend.

## ¿Qué aprendimos?

1. **Validar las dependencias externas antes de comprometer una historia.** El orden óptimo de visita (US-003) no podía construirse a mano en el plazo del Sprint. Recién al integrar la API de OpenRouteService descubrimos dos comportamientos que no estaban en el plan: su buscador de direcciones ubica Huancayo en otras regiones (IMP-07) y el motor VROOM retrasa la salida por su cuenta (IMP-08). Una prueba técnica de un día al inicio del Sprint habría anticipado ambos.
2. **Un cambio de stack a mitad del Sprint tiene un costo concreto.** El cambio CC-01 (27/09/2026) obligó a migrar los tres módulos y sus pruebas, y amplió el Sprint 7 días (un 50 % más). Fue la decisión correcta (modelo relacional y API de optimización), pero debió tomarse en la planificación, no en la última semana.
3. **Separar las reglas de negocio de la infraestructura hizo posible la migración.** Los servicios reciben sus repositorios por parámetro. Gracias a eso, las pruebas corren con repositorios en memoria y un optimizador simulado, sin Neon ni OpenRouteService, y las reglas del prototipo se trasladaron casi sin cambios.
4. **Una historia "terminada" en el código puede no estar terminada para el negocio.** Al auditar el flujo de pedidos descubrimos que la ruta y el pedido cambiaban de estado por separado y que no se guardaba la hora real de entrega. Así, el objetivo O2 del proyecto (entregas fuera de horario < 10 %) no se podía medir (IMP-11). Los criterios de aceptación deben incluir cómo se medirán los objetivos del proyecto.
5. **El simulador debe imitar el proceso real, no solo el resultado.** La primera versión registraba entregas antes de la llegada estimada. Simular tramo a tramo (manejo, espera de ventana, atención y regreso) produjo datos creíbles para la demostración y para el indicador O2.
6. **Los requisitos incompletos aparecen al implementar.** Durante el Sprint surgieron decisiones sin respaldo documental: el significado de la prioridad de un pedido (IMP-12), si el tipo de producto aporta valor y si un bulto admite carga encima. Necesitamos refinar el backlog antes de planificar.

## ¿Qué estamos haciendo bien?

1. **Cumplimos el Sprint Goal con software en producción.** Las tres historias (23 SP) están publicadas en Vercel con base de datos en Neon y se pueden demostrar en vivo, no solo en local.
2. **Arquitectura cliente-servidor con MVC y capa de servicios aplicada de verdad.** Hay controladores sin reglas de negocio, servicios con las reglas y repositorios con Prisma, y errores de dominio traducidos a códigos HTTP (404, 409, 422).
3. **Pruebas automatizadas como red de seguridad.** 71 pruebas de API y de unidad, y 83,86 % de cobertura de líneas en el backend, por encima del 80 % de la Definition of Done. Detectaron regresiones durante los cambios del flujo de entregas.
4. **Estado honesto y trazable.** Cuando el prototipo no optimizaba, las historias se reportaron *en progreso* en lugar de completadas. Cada cambio de alcance o tecnología se registró en el control de cambios (CC-01, CC-02) con su impacto.
5. **Pensar en el usuario final.** Ubicación por texto o mapa, avisos de carga no apilable en la hoja de ruta, comparación de km y CO₂ antes y después de optimizar y mensajes de error en lenguaje del operador.
6. **Uso de servicios gratuitos sin tarjeta de crédito.** OpenRouteService, Nominatim, OpenStreetMap, Neon y Vercel cubren el alcance académico con costo cero.

## ¿Qué podemos hacer mejor?

### Personas

* **Carga de trabajo desbalanceada.** Desde el 11/09/2026, 20 de 26 commits y los 4 PR del cierre son de un solo integrante. El conocimiento del backend y del despliegue está concentrado en una persona: si falta, el equipo no puede desplegar ni corregir errores.
* **El rol de líder debe ejercerse también en las decisiones de producto.** Preguntas como qué significa la prioridad *express* o si se usa el tipo de producto se resolvieron, o quedaron abiertas, durante la implementación. Le corresponden a la líder antes de planificar.
* **Mejora:** asignar a cada integrante historias completas (frontend + backend + pruebas) y rotar las tareas de despliegue para que ambos sepan publicar.

### Relaciones

* **Decisiones grandes con poca discusión.** El cambio de stack CC-01 lo propuso un integrante y se ejecutó en dos días. Faltó una sesión de evaluación conjunta registrada antes de aprobarlo.
* **Comunicación asíncrona sin un punto fijo de sincronización.** Varios cambios (flujo de entregas, ubicación con mapa, tipo de producto) llegaron al otro integrante ya integrados en `main`, sin revisión.
* **Retroalimentación del stakeholder solo al final.** El docente verá el sistema por primera vez en la Sprint Review; una validación intermedia habría orientado antes la prioridad de las funcionalidades.
* **Mejora:** sincronización breve diaria, acuerdo de que toda decisión de alcance o tecnología se discute antes de registrarse como cambio, y una revisión intermedia con el docente a mitad de cada Sprint.

### Procesos

* **La Definition of Done no se aplicó como filtro.** Los PR #5 a #8 se integraron sin revisión (DoD 2), no hay ambiente de staging (DoD 6) y faltan pruebas de compatibilidad y de usabilidad (DoD 9 y 10).
* **Pull Requests demasiado grandes.** El PR #6 incluyó la migración completa del stack y las tres historias, lo que lo hace prácticamente imposible de revisar en una sola sesión.
* **Estimación de US-003.** Sus 13 SP no consideraron la integración con APIs externas ni los ajustes de horario; fue la causa principal de la ampliación del Sprint.
* **Refinamiento del backlog insuficiente.** Requisitos como el flujo de estados de entrega y la prioridad de pedidos no tenían criterios de aceptación verificables.
* **Mejora:** usar la DoD como lista de verificación obligatoria en cada PR, dividir las historias grandes en PR de menos de 400 líneas y hacer una sesión de refinamiento antes de cada planificación.

### Herramientas

* **Sin pruebas automatizadas en el frontend.** Las pantallas solo se verificaron manualmente y con un navegador automatizado puntual.
* **Sin ambiente de staging.** Solo existen el entorno local y producción; los cambios se validan directamente en producción.
* **Límites de los planes gratuitos.** Neon se suspende por inactividad (IMP-09), Nominatim permite una consulta por segundo y `npm audit` reporta vulnerabilidades altas en dependencias internas de Prisma (IMP-15).
* **Despliegue desde un fork.** Publicar requiere sincronizar el fork después de cada integración en `main` (IMP-10), un paso manual que puede olvidarse.
* **Mejora:** incorporar pruebas de componentes en el frontend, despliegues de vista previa por PR, verificación de `/health` antes de cada demostración y automatizar la sincronización del fork.

### Acciones a realizar

| ID | Acción | Eje | Responsable | Fecha límite | Indicador de cumplimiento |
| --- | --- | --- | --- | --- | --- |
| ACC-01 | Proteger la rama `main` para exigir una aprobación en cada PR y revisar de forma retroactiva los PR #6 y #8 | Procesos | Javier Curi Dayana | 09/10/2026 | 100 % de los PR del Sprint 2 con al menos una aprobación |
| ACC-02 | Asignar historias completas (frontend, backend y pruebas) alternando a los integrantes; Henry acompaña a Dayana en un despliegue | Personas | Javier Curi Dayana | 09/10/2026 (planificación del Sprint 2) | Cada integrante con al menos el 40 % de los commits del Sprint 2; ambos han desplegado al menos una vez |
| ACC-03 | Sincronización diaria de 15 minutos a hora fija y actualización del tablero de Jira al terminar cada tarea | Relaciones | Javier Curi Dayana, Arroyo Canchari Henry | Desde el 09/10/2026 | Tablero de Jira sin tareas desactualizadas más de un día |
| ACC-04 | Pruebas de componentes del frontend (Vitest + Testing Library) para formularios y rutas, y pruebas de compatibilidad en Firefox y Safari | Herramientas | Arroyo Canchari Henry | 23/10/2026 | Formularios de pedido, vehículo y ruta cubiertos; matriz de compatibilidad con 3 navegadores |
| ACC-05 | Ambiente de staging: despliegues de vista previa de Vercel por PR y una rama de pruebas en Neon | Herramientas | Arroyo Canchari Henry | 16/10/2026 | Cada PR muestra la URL de su vista previa antes de integrarse |
| ACC-06 | Sesión de refinamiento antes de cada planificación: definir la regla de prioridad de pedidos (IMP-12) y criterios medibles para US-004 y US-005 | Procesos | Javier Curi Dayana | 09/10/2026 | Reglas de negocio registradas en el documento 09; historias del Sprint 2 con criterios Gherkin verificables |
| ACC-07 | Prueba técnica (spike) de un día para cada API o servicio externo nuevo antes de estimar la historia que lo usa | Procesos | Arroyo Canchari Henry | Desde el Sprint 2 | Ninguna historia del Sprint 2 bloqueada por un comportamiento no previsto de una API |
| ACC-08 | PR pequeños (menos de 400 líneas) con la DoD como lista de verificación en la plantilla del PR | Procesos | Arroyo Canchari Henry | Plantilla publicada el 02/10/2026; uso desde el Sprint 2 | [`.github/pull_request_template.md`](../../.github/pull_request_template.md) usada en el 100 % de los PR del Sprint 2 |
| ACC-09 | Revisión intermedia con el docente a mitad de cada Sprint | Relaciones | Javier Curi Dayana | Mitad del Sprint 2 | Observaciones registradas en el Informe de estado del Sprint 2 |
| ACC-10 | Antes de cada demostración, activar Neon con `/health` y repetir `npm audit` | Herramientas | Arroyo Canchari Henry | Cada Sprint Review | Demostración sin errores de conexión |

El seguimiento de estas acciones se revisará al inicio de la retrospectiva del EW Sprint 2.

---

## Historial de versiones

| Versión | Fecha | Autor | Descripción |
| --- | --- | --- | --- |
| V_0_1_0 | 25/09/2026 | Javier Curi Dayana | Retrospectiva inicial sobre el prototipo (FastAPI + Firestore). |
| V_0_2_0 | 27/09/2026 | Arroyo Canchari Henry | Cambio CC-01: aprendizajes del cambio de stack y acciones de migración. |
| V_1_0_0 | 02/10/2026 | Arroyo Canchari Henry, Javier Curi Dayana | Versión de entrega del Sprint 1 con la plantilla oficial: análisis con datos del Sprint en los cuatro ejes y plan de acción con responsables, fechas e indicadores. |

> Los borradores V_0_1_0 y V_0_2_0 se publicaron con los nombres `V_1_0_0` y `V_1_1_0`; se renumeraron al consolidar la entrega con el nombre exigido por la consigna.

[⬅ Volver al README](../../README.md)

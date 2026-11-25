[⬅️ Volver al README Principal](../../README.md)

# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 06. Reporte Final del Proyecto (Final Project Report)

**Proyecto:** EcoRuta Wanka — Optimizador de rutas sostenibles de última milla para WankaLogística S.A.C. (Huancayo, Junín) | **Fecha de Cierre:** 26/11/2026 | **Versión:** 1.0.0

**Líder del proyecto:** Javier Curi Dayana | **Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana | **Patrocinador / Docente:** Gamarra Moreno Daniel (Taller de Proyectos 2)

**Producto en producción:**

- Aplicación web: https://ecoruta-frontend.vercel.app
- API: https://ecoruta-backend.vercel.app/health
- Repositorio: https://github.com/DayanaJC/EcoRuta-Wanka

---

## 1. Descripción General del Proyecto

**EcoRuta Wanka** es una plataforma web para organizar el reparto de última milla de **WankaLogística S.A.C.**, una distribuidora ficticia de Huancayo, El Tambo y Chilca. Según el [Acta de constitución](../01%20Inicio/02.%20Acta%20de%20constituci%C3%B3n%20V_1_0_0.md), el problema era que el tráfico, las distancias y los horarios de recepción de cada cliente generaban recorridos innecesarios, más gasto de combustible y entregas fuera de hora.

El sistema terminado permite:

- registrar **vehículos** (capacidad en peso y volumen), **conductores**, **clientes** (con sus días y horarios de recepción) y **pedidos** (con bultos y ubicación en el mapa);
- generar **rutas optimizadas** con OpenRouteService + VROOM, que respetan la capacidad del vehículo y la ventana horaria de cada cliente;
- seguir el reparto en el mapa, registrar entregas e **incidentes de tránsito** y **re-optimizar** la ruta desde la posición del vehículo;
- **avisar al cliente** por WhatsApp y darle una **página pública de seguimiento** de su pedido;
- medir la sostenibilidad: km, combustible y **CO₂ evitado** frente a una ruta sin optimizar, puntualidad y **reporte en PDF**.

**Enfoque del proyecto: híbrido.**

- **Predictivo:** el marco del proyecto (Acta, presupuesto, cronograma de 16 semanas, hitos y cierre).
- **Adaptativo (Scrum):** la construcción del producto, en 4 sprints con Jira, Sprint Reviews ante el docente y retrospectivas.

**Arquitectura final:** cliente-servidor con MVC y capa de servicios.

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 + React-Leaflet |
| Backend | Node.js / Express 5 + Prisma 7 + Zod |
| Base de datos | PostgreSQL en Neon |
| Publicación | Vercel, con GitHub Actions para CI/CD |

---

## 2. Resumen de Desempeño

### 2.1 Alcance (Predictivo y Adaptativo)

**Objetivos y criterios de éxito:**

| ID | Objetivo del Acta | Criterio de éxito | Tipo |
|---|---|---|---|
| O1 | Reducir el impacto ambiental | −20 % de CO₂ estimado en los primeros 6 meses de uso | Resultado del negocio (después del proyecto) |
| O2 | Mejorar la puntualidad | Menos del 10 % de entregas fuera de horario en los primeros 4 meses | Resultado del negocio (después del proyecto) |
| O3 | Reducir gastos de reparto | −15 % de combustible y mantenimiento en el primer año | Resultado del negocio (después del proyecto) |
| O4 | Desarrollar el alcance del MVP | 100 % del alcance funcional dentro del periodo académico | Entregable del proyecto |
| O5 | Buena experiencia de uso | ≥ 90 % de los usuarios de prueba califica el sistema con 4/5 o más | Entregable del proyecto |

**Evidencia de cumplimiento:**

| Objetivo | Resultado al cierre | Estado |
|---|---|---|
| **O4 (adaptativo)** | **10 de 10 historias y 78 de 78 SP** aceptados en las Sprint Reviews y en «Listo» en Jira (US-001 a US-010). Los 10 requisitos funcionales (RF-01 a RF-10) están en producción. | 🟢 Cumplido |
| **O4 (predictivo)** | Entregables de cada etapa completos: inicio (13 documentos), planificación (4), implementación (4 sprints + Green IT), cierre (7 documentos + video). | 🟢 Cumplido |
| **O5** | SUS de **79,06** (grado A−, meta ≥ 68). **7 de 8** participantes (**87,5 %**) superaron los 68 puntos, que equivalen a calificar con 4/5 o más. El único por debajo fue el perfil de conductor (62,5). Ver la [Evaluación de usabilidad](../03%20Implementaci%C3%B3n/Sprint%204/04%20Usabilidad%20V_1_0_0.md). | 🟡 Casi cumplido (87,5 % frente a 90 %) |
| **O1, O2, O3** | El sistema **ya mide** los tres indicadores (dashboard y PDF de Sostenibilidad). Con los datos de prueba registrados en producción (7 rutas y 19 paradas, del 29/09 al 28/10): **−3,7 % de CO₂** (0,59 kg evitados), **−3,7 % de combustible** y **17,6 %** de entregas fuera de horario. | ⚪ Se miden en la operación real (ver «Requisitos eximidos») |

**Variaciones, causas y su impacto:**

- **Cambio de alcance (adaptativo):** se agregó **US-010** (avisos al cliente y seguimiento público, 8 SP). Así el alcance pasó de **70 a 78 SP (+11,4 %)**. Se absorbió en el Sprint 4, que estaba reservado para integración y pruebas, **sin mover la fecha de cierre**. Impacto: +50 h de trabajo, que explican parte del sobrecosto.
- **Cambio técnico (predictivo, CC-01):** se migró de Python/FastAPI/Firebase a Node.js/Next.js/Neon. No cambió *qué* hace el sistema, pero sí *cómo* se construye. Impacto: Sprint 1 ampliado 7 días y +60 h.
- **Funciones ocultas a pedido del equipo:** los módulos *Resumen* y *Asignaciones* existen en el código, pero se ocultaron del menú para simplificar la navegación, porque su función ya la cubre la generación de rutas. El tráfico por horario quedó **deshabilitado** (`TRAFICO_HABILITADO`) como mejora futura.

### 2.2 Calidad

**Requisitos y criterios de aceptación:**

- criterios de aceptación de cada historia (Definition of Done en Jira);
- 100 % de las pruebas aprobadas;
- cobertura del backend ≥ 80 %;
- Quality Gate de SonarQube aprobado;
- sin vulnerabilidades críticas (OWASP Top 10);
- accesibilidad WCAG 2.2 AA;
- Lighthouse ≥ 90 en la página principal;
- API < 500 ms;
- SUS ≥ 68.

**Resultados de verificación y validación:**

| Tipo | Qué se hizo | Resultado |
|---|---|---|
| **Verificación** (¿lo construimos bien?) | Pruebas unitarias y de integración del backend (Vitest) | **131/131** aprobadas, cobertura **86,1 %** |
| | Pruebas E2E con Playwright en Chromium, Firefox y WebKit | **79/79** aprobadas |
| | SonarQube Cloud | Quality Gate **aprobado**; 4 hallazgos de confiabilidad y 1 de seguridad corregidos en el Sprint 3 |
| | OWASP Top 10 y `npm audit` | 0 vulnerabilidades en las dependencias; encabezado `X-Powered-By` retirado |
| | WCAG 2.2 AA (axe y Lighthouse) | Lighthouse accesibilidad **100**; de 76 a 2 nodos con observaciones en axe |
| | Rendimiento (Lighthouse CI en `green-audit.yml`) | LCP 0,59 – 0,88 s; API 245 – 278 ms; 229 KiB por carga |
| **Validación** (¿construimos lo correcto?) | 4 Sprint Reviews con demostración en producción ante el docente | 100 % de las historias aceptadas en cada Review |
| | Evaluación de usabilidad SUS (8 perfiles, 5 tareas) | **79,06** (A−); 4 de 5 tareas con 100 % de éxito sin ayuda |

**Requisitos eximidos o variaciones:**

- **O1, O2 y O3 se miden después del proyecto.** Sus metas están definidas para **4 a 12 meses de operación real**, y WankaLogística S.A.C. es una empresa ficticia con datos simulados (restricción del Acta y riesgo **RSK-09**). El proyecto entrega la **herramienta que los mide** y deja la línea base. Las cifras con datos de prueba (−3,7 % de CO₂) no sirven para juzgar la meta del 20 %, porque las rutas de prueba son cortas (56 km en total) y tienen pocas paradas.
- **Autenticación (RN-001 / RNF-02) eximida del MVP.** La evaluación OWASP la marcó como *Vulnerable* en A01 y A07. Se aceptó porque el sistema usa datos simulados y la prioridad del backlog fue la logística. Queda como primera tarea si el sistema pasa a operación real.
- **SUS con perfiles simulados.** Los 8 participantes de la prueba SUS son perfiles que representan a los usuarios. El método puede repetirse con usuarios reales sin cambios.
- **Cobertura por debajo de la meta en el Sprint 3** (77,4 %), corregida al cierre (86,1 %).

### 2.3 Cronograma

| Hito / Entrega | Enfoque | Fecha Planificada | Fecha Real | Variación / Impacto |
|---|---|---|---|---|
| Acta de constitución aprobada | Predictivo | 28/08/2026 | 28/08/2026 | 0 días |
| Fin de la planificación (backlog, riesgos, presupuesto) | Predictivo | 09/09/2026 | 09/09/2026 | 0 días |
| Sprint 1: vehículos, pedidos y rutas optimizadas (23 SP) | Adaptativo | 25/09/2026 | 02/10/2026 | **+7 días** por el cambio CC-01; se recuperó en el Sprint 2 |
| Primera versión en producción (Vercel) | Predictivo | 25/09/2026 | 28/09/2026 | +3 días, sin impacto: las Reviews se hicieron sobre producción |
| Sprint 2: mapa, dashboard, PDF y conductores (29 SP) | Adaptativo | 08/10/2026 | 08/10/2026 | 0 días: SPI vuelve a 1,00 |
| Sprint 3: re-optimización y preferencias (18 SP) | Adaptativo | 30/10/2026 | 29/10/2026 | −1 día |
| Evaluación OWASP y WCAG | Predictivo | 30/10/2026 | 30/10/2026 | 0 días |
| Inspección Green IT (Lighthouse CI) | Predictivo | 13/11/2026 | 13/11/2026 | 0 días |
| Sprint 4: integración, pruebas y US-010 (8 SP) | Adaptativo | 20/11/2026 | 19/11/2026 | −1 día, con 8 SP de alcance agregado |
| Cierre: 7 documentos, video y versión final | Predictivo | 06/12/2026 | 26/11/2026 | **−10 días**: SPI final 1,077 |
| Sustentación final | Predictivo | 02/12/2026 | 02/12/2026 (programada) | Producto y documentación listos antes de la fecha |

### 2.4 Costo

**Presupuesto aprobado (y rango de tolerancia):**

- **Presupuesto base (BAC):** **S/ 58,080.00** (recursos humanos S/ 57,540.00 + herramientas S/ 393.75 + nube S/ 146.25).
- **Reserva de contingencia:** **S/ 6,969.60 (12 %)**.
- **Tope aprobado:** **S/ 65,049.60**.
- **Rango de tolerancia:** de S/ 58,080.00 a S/ 65,049.60 (+12 %).

**Costo final real del proyecto:** **S/ 61,884.25** (AC = EAC, ETC = 0).

**Análisis de variaciones e impacto:**

| Concepto | Monto | Causa |
|---|---:|---|
| Sprint 1 | +S/ 2,019.00 | +60 h por la migración de tecnología CC-01 |
| Sprint 3 | +S/ 673.00 | +20 h para corregir hallazgos de SonarQube, OWASP y WCAG |
| Sprint 4 | +S/ 1,536.25 | +50 h por US-010 y Green IT, menos S/ 146.25 de hosting y dominio no contratados (Vercel gratuito) |
| Cierre | −S/ 424.00 | 160 h en lugar de unas 173, porque la documentación se fue preparando durante los sprints |
| **Variación total (VAC)** | **+S/ 3,804.25 (+6,5 %)** | CPI final **0,939** |

- **Impacto:** el exceso usó el **54,6 %** de la reserva de contingencia. El proyecto cerró **dentro del rango de tolerancia** y quedaron S/ 3,165.35 de reserva sin usar.
- **Servicios en la nube:** costo real **S/ 0.00** (Neon, Vercel, OpenRouteService y GitHub Actions en planes gratuitos).
- Los montos son una estimación académica (horas × S/ 33.65). El detalle está en el [Reporte EVM](03%20Reporte%20de%20An%C3%A1lisis%20de%20Valor%20Ganado%20-%20EVM%20V_1_0_0.md).

---

## 3. Resumen de Riesgos, Incidentes e Impedimentos

| ID / Descripción | Tipo (Riesgo/Incidente/Impedimento) | Impacto Real | Respuesta Aplicada |
|---|---|---|---|
| **RSK-16** — La migración del stack (CC-01) genera retrabajo | Riesgo (se materializó) | Sprint 1 +7 días y +60 h (S/ 2,019.00). Ánimo del equipo en 2,5/5. | Migración por módulos (vehículos → pedidos → rutas) reutilizando las reglas de negocio, y Sprint 1 ampliado. **Cerrado** el 02/10. |
| **RSK-06** — Cambios en los requisitos | Riesgo (se materializó) | US-010 agregada: +8 SP y +50 h. Sin impacto en la fecha. | Se absorbió en el Sprint 4 (reservado para integración), sin abrir otras funciones en el cierre. |
| **RSK-01** — Indisponibilidad de Neon (plan gratuito suspendido) | Riesgo / Impedimento IMP-09 | Primera consulta lenta (LCP 3,9 s en frío) y algún error P1001 al migrar. | Reintento de conexión; paso que «despierta» la API en los workflows antes de medir; despertar la API antes de cada demostración. |
| **RSK-15** — Límites de la API de optimización (OpenRouteService) | Riesgo (no se materializó) | Ninguno: la API respondió en todas las pruebas. | Control del consumo; geocodificación con Nominatim porque la de ORS fallaba en Huancayo. |
| **RSK-11** — Exposición de credenciales | Riesgo (no se materializó) | Ninguno. | `.env` fuera del repositorio (`.gitignore`), variables de entorno en Vercel y revisión por Pull Request. |
| **RSK-14** — Problemas de seguridad o acceso | Riesgo (aceptado) | La autenticación quedó fuera del MVP (OWASP A01/A07 «Vulnerable»). | Se aceptó para el MVP con datos simulados; queda como primera tarea si el sistema pasa a operación real. |
| **IMP-03 (Sprint 1)** — La solución inicial dependía de Firebase y de archivos de configuración | Impedimento | Bloqueaba la ejecución en los entornos del equipo. | Resuelto con el cambio CC-01 a Neon/PostgreSQL + Prisma. |
| **IMP-01 (Sprint 2)** — Dificultad para mostrar las rutas en el mapa | Impedimento | 2 días en US-004. | Resuelto el 30/09 con React-Leaflet y la geometría de ORS. |
| **Next.js 16.4.3 con 7 avisos de seguridad** | Incidente (Sprint 4) | Bloqueaba la compilación del frontend. | Actualización a Next.js 16.4.6. |
| **Fallo de las pruebas E2E en GitHub Actions** | Incidente (Sprint 4) | La primera ejecución no pudo instalar los navegadores. | Uso de la imagen oficial de Playwright. |
| **Las vistas previas de Vercel no podían llamar a la API** | Impedimento | Los cambios no se podían probar en preview, por la protección de Vercel. | Flujo PR → merge → publicación en producción, con un backend en memoria para probar en local. |

---

## 4. Evaluación del Éxito y Cierre

**Satisfacción de los interesados (Stakeholders):**

| Interesado | Evidencia | Resultado |
|---|---|---|
| **ST-01 Docente del curso** (patrocinador y cliente académico) | 4 Sprint Reviews con demostración en producción | **100 % de las historias aceptadas**; CSI = 100 % en cada sprint (ver el [gráfico de burbujas](04%20Tableros%20de%20Control%20-%20H%C3%ADbridos%20V_1_0_0.md)) |
| **ST-03 / ST-04 Responsables de WankaLogística S.A.C.** (perfil simulado) | Tareas T3 y T5 de la prueba SUS (jefe de operaciones, P4) | SUS 80,0; generó rutas y revisó el CO₂ evitado sin ayuda |
| **ST-05 Operador logístico** (P5, P6) | Tareas T1, T2 y T4 | SUS 87,5 y 72,5. Lo más lento: marcar la ubicación en el mapa (2 min 40 s) |
| **ST-06 Conductor** (P7) | Tarea T4 | SUS 62,5, el único bajo la meta: esperaba que el aviso de WhatsApp se enviara solo |
| **ST-07 Cliente del pedido** (P3, P8) | Tarea T5 (seguimiento público) | 100 % de éxito en 35 s; SUS 75,0 y 77,5 |
| **Satisfacción global** | SUS promedio | **79,06 (A−, «bueno»)** |

**Satisfacción y reconocimiento del equipo:**

- El [Mood Chart](05%20Radiadores%20de%20Informaci%C3%B3n%20V_1_0_0.md) subió de **2,5 (Sprint 1) a 5,0 (cierre)**.
- **Reconocimientos internos:**
  - **Javier Curi Dayana:** liderazgo, Scrum y documentación (inicio, planificación, revisiones, retrospectivas, usabilidad, CI/CD y reportes de cierre).
  - **Arroyo Canchari Henry:** migración CC-01, motor de rutas y re-optimización, despliegue en Vercel, pruebas automáticas y Green IT.
- Ambos integrantes coinciden en que el producto final supera el MVP del Acta: tiene seguimiento público del pedido, simulador de reparto y auditoría automática de rendimiento.

**Transición operativa y cierre administrativo:**

- **Transición operativa:**
  - el sistema queda **publicado y funcionando** en Vercel (frontend y API), con la base de datos en Neon y 4 workflows de GitHub Actions que prueban y publican cada cambio;
  - el README del repositorio sirve como guía de instalación, configuración (`.env.example`) y despliegue;
  - la entrega a WankaLogística S.A.C. (enlaces de producción, README y guía de uso) está programada para el **02/12/2026** con la sustentación.
- **Cierre administrativo:**
  - [x] 10 historias en «Listo» y sprints cerrados en Jira.
  - [x] Ramas integradas a `main` mediante Pull Requests (#1 a #20).
  - [x] 7 documentos de cierre en `docs/04 Cierre`, enlazados desde el README y con enlace de retorno.
  - [x] Video del proyecto en `docs/05 Video proyecto`.
  - [x] Reserva de contingencia no usada (S/ 3,165.35) liberada.
  - [x] Lecciones aprendidas registradas en el [07 Reporte Final de Lecciones Aprendidas](07%20Reporte%20Final%20de%20Lecciones%20Aprendidas%20V_1_0_0.md).
  - [ ] Aceptación formal del docente en la sustentación del 02/12/2026.
- **Mantenimiento después del cierre:** si el sistema pasa a operación real, el orden recomendado es:
  1. autenticación por roles (RN-001);
  2. tráfico por horario (`TRAFICO_HABILITADO`);
  3. medir O1–O3 con datos reales durante 6 meses.

**Conclusión:** el proyecto se considera **exitoso**.

- Entregó el 100 % del alcance (más una historia nueva) **10 días antes** de lo planificado.
- Terminó **dentro del presupuesto total aprobado**: usó el 54,6 % de la reserva.
- Cerró con la calidad verificada (131 + 79 pruebas, SonarQube, OWASP, WCAG y Lighthouse) y validada por el docente en cada Review.
- El único indicador por debajo de su meta es el costo frente al BAC (CPI 0,939, en ámbar).

---

[⬅️ Volver al README Principal](../../README.md)

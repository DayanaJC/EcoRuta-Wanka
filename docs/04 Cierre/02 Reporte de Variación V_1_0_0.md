# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 02. Reporte de Variación (Variance Report)

**Proyecto:** EcoRuta Wanka — Optimizador de rutas sostenibles de última milla para WankaLogística S.A.C. | **Periodo Reportado:** 17/08/2026 – 26/11/2026 (todo el proyecto, desde el inicio hasta el cierre) | **Fecha de Corte:** 26/11/2026 | **Versión:** 1.0.0

**Líder del proyecto:** Javier Curi Dayana | **Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

Este reporte compara **lo que se planificó** con **lo que realmente pasó** en tres aspectos: tiempo, dinero y calidad. Para cada diferencia explica por qué ocurrió y qué se hizo.

---

## 1. Variación de Cronograma

| Métrica / Aspecto | Detalle |
|---|---|
| **Resultados Planificados** | Cronograma de 16 semanas (17/08 – 06/12/2026):<br>• **Planificación:** hasta el 09/09.<br>• **Sprint 1:** 10/09 – 25/09 (23 SP).<br>• **Sprint 2:** 28/09 – 08/10 (29 SP).<br>• **Sprint 3:** 12/10 – 30/10 (18 SP).<br>• **Sprint 4 (integración y pruebas):** 02/11 – 20/11.<br>• **Cierre:** 23/11 – 06/12.<br>Al 26/11 debía estar terminado el **92,9 %** del proyecto (PV = S/ 53,931.43). |
| **Resultados Reales** | • **Sprint 1:** terminó el **02/10** (7 días tarde).<br>• **Sprints 2, 3 y 4:** terminaron en su fecha.<br>• **Alcance:** las 10 historias terminadas (78 SP, incluida US-010, que se agregó).<br>• **Cierre:** se hizo del 20/11 al **26/11**, con los 7 documentos, el video y la versión final publicada.<br>Al 26/11 el avance real es del **100 %** (EV = S/ 58,080.00). |
| **Variación Obtenida** | • **Sprint 1:** 7 días de retraso, recuperado en el Sprint 2.<br>• **Al cierre:** SV = EV − PV = **+S/ 4,148.57** y **SPI = 1,077**. El proyecto terminó **10 días antes** de lo planificado (26/11 en lugar del 06/12). |
| **Causa Raíz** | • **Retraso del Sprint 1:** el cambio de tecnología **CC-01** (de Python/FastAPI/Firebase a Node.js/Next.js/Neon) obligó a migrar lo ya hecho. Es el riesgo **RSK-16**, que se materializó.<br>• **Adelanto del cierre:** el desarrollo terminó a tiempo y la documentación se fue preparando durante los sprints, así que el cierre se completó en una semana en lugar de dos. |
| **Respuesta Planificada** | • **Sprint 1:** se aplicó la respuesta de RSK-16: migrar por módulos reutilizando las reglas de negocio y ampliar el Sprint 1 una semana.<br>• **Cierre:** se aprovechó el adelanto para revisar la coherencia de todos los documentos y preparar la sustentación con el sistema ya publicado. |

## 2. Variación de Costo

| Métrica / Aspecto | Detalle |
|---|---|
| **Resultados Planificados** | **Presupuesto base (BAC):** S/ 58,080.00 (recursos humanos, herramientas y nube), más una reserva de contingencia de S/ 6,969.60 (12 %).<br>**Costo para todo el proyecto terminado:** **S/ 58,080.00**. |
| **Resultados Reales** | **Costo real final (AC) al 26/11:** **S/ 61,884.25**, con todo el trabajo terminado (EV = S/ 58,080.00). |
| **Variación Obtenida** | CV = EV − AC = **−S/ 3,804.25** y **CPI = 0,939**. Por cada sol gastado se obtuvieron 0,94 soles de trabajo planificado. Hay un **sobrecosto del 6,5 %** sobre el presupuesto base. |
| **Causa Raíz** | **Mano de obra:** se usaron **130 horas más** de lo estimado en los sprints:<br>• **Sprint 1:** 60 h, por la migración de tecnología (CC-01).<br>• **Sprint 3:** 20 h, para corregir las observaciones de SonarQube, OWASP y WCAG.<br>• **Sprint 4:** 50 h, por la historia nueva US-010 y las mejoras Green IT.<br>Por otro lado, hubo **ahorros**:<br>• el cierre usó 160 h en lugar de unas 173, es decir, **S/ 424.00 menos**;<br>• **S/ 146.25** porque Vercel gratuito reemplazó el hosting y el dominio de pago. |
| **Respuesta Planificada** | • El exceso se cubrió con la **reserva de contingencia**: se usaron S/ 3,804.25 de S/ 6,969.60 (**54,6 %**). El proyecto cerró dentro del presupuesto total aprobado (S/ 65,049.60).<br>• No se agregaron funciones en el cierre.<br>• Se usaron servicios gratuitos (Neon, Vercel, OpenRouteService y GitHub Actions).<br>• **Para futuros proyectos:** estimar las horas con la velocidad real de los sprints anteriores. |

## 3. Variación de Calidad

| Métrica / Aspecto | Detalle |
|---|---|
| **Resultados Planificados (Métricas/Criterios)** | • 100 % de las pruebas aprobadas.<br>• Cobertura de pruebas del backend **≥ 80 %**.<br>• Quality Gate de SonarQube aprobado.<br>• Página principal con puntaje Lighthouse ≥ 90.<br>• API con respuesta **< 500 ms**.<br>• Usabilidad SUS **≥ 68**.<br>• 100 % de los criterios de aceptación de cada historia cumplidos. |
| **Resultados Reales (Defectos/Pruebas)** | • **131 de 131** pruebas del backend aprobadas.<br>• **79 de 79** pruebas E2E aprobadas en 3 navegadores.<br>• **Cobertura:** **86,1 %** (en el Sprint 3 era 77,4 %).<br>• **Quality Gate:** aprobado.<br>• **API:** entre 245 y 278 ms.<br>• **SUS:** **79,06** (grado A−).<br>• **Criterios de aceptación:** 100 % cumplidos en las 10 historias.<br>**Defectos encontrados:**<br>• 4 de confiabilidad y 1 de seguridad en SonarQube (Sprint 3).<br>• 7 avisos de seguridad de Next.js 16.4.3.<br>• 1 fallo de instalación de navegadores en GitHub Actions. |
| **Variación Obtenida** | • **Sprint 3:** la cobertura quedó **2,6 puntos por debajo** de la meta (77,4 % frente a 80 %).<br>• **Al cierre:** está **6,1 puntos por encima** (86,1 %).<br>• **SUS:** 11 puntos sobre el mínimo.<br>• **Defectos:** todos están corregidos; no queda ningún defecto abierto. |
| **Causa Raíz** | • **Cobertura baja:** en el Sprint 3 se agregaron funciones nuevas (preferencias e incidentes) antes de completar sus pruebas.<br>• **Defectos de SonarQube:** comparación de horas sin un orden explícito y detalles de accesibilidad.<br>• **Next.js:** se publicaron vulnerabilidades nuevas en esa versión.<br>• **GitHub Actions:** el sistema operativo del servidor cambió y la instalación con `--with-deps` falló. |
| **Respuesta Planificada** | • Se escribieron más pruebas (de 109 a 131).<br>• Se corrigieron los hallazgos de SonarQube, OWASP y WCAG.<br>• Se actualizó Next.js a 16.4.6.<br>• Las pruebas E2E ahora usan la imagen oficial de Playwright.<br>• Las pruebas y la auditoría se ejecutan solas en cada cambio (`ci.yml`, `tests.yml` y `green-audit.yml`), para detectar errores a tiempo. |

---

**Nota sobre los montos:** el costo real es una **estimación académica**. Se calcula multiplicando las horas del equipo por la tarifa promedio del presupuesto (S/ 33.65 por hora = S/ 57,540 ÷ 1,710 h). El detalle está en el [03 Reporte de Análisis de Valor Ganado](03%20Reporte%20de%20An%C3%A1lisis%20de%20Valor%20Ganado%20-%20EVM%20V_1_0_0.md).

[⬅️ Volver al README Principal](../../README.md)

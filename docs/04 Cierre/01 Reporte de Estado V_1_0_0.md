# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 01. Reporte de Estado del Proyecto (Status Report)

**Proyecto:** EcoRuta Wanka — Optimizador de rutas sostenibles de última milla para WankaLogística S.A.C. (Huancayo, Junín)

**Fecha de Corte:** 26/11/2026

**Versión:** 1.0.0

**Periodo reportado:** 31/10/2026 – 26/11/2026 (Sprint 4 y etapa de cierre). Se compara con el periodo anterior, que terminó el 30/10/2026 (fin del Sprint 3).

**Líder del proyecto:** Javier Curi Dayana | **Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

---

## Resumen ejecutivo

El proyecto **EcoRuta Wanka está terminado, publicado en internet y cerrado**:

- **Aplicación web:** https://ecoruta-frontend.vercel.app
- **API:** https://ecoruta-backend.vercel.app/health

Se entregó **el 100 % del alcance: 10 historias de usuario y 78 Story Points**, todas aceptadas en las Sprint Reviews y en estado «Listo» en Jira. También se completaron todos los entregables de cierre: los 7 documentos, el video y la versión final publicada.

- **Cronograma:** el proyecto terminó **10 días antes** de la fecha planificada, el 26/11 en lugar del 06/12 (SPI 1,077).
- **Costo:** el costo final fue **un 6,5 % mayor** que el presupuesto base (CPI 0,939). Ese exceso lo cubrió la reserva de contingencia, así que el proyecto cerró **dentro del presupuesto total aprobado** (S/ 65,049.60).

| Aspecto | Estado | Periodo anterior (al 30/10) | Este periodo (al 26/11) | Tendencia |
|---|---|---|---|---|
| Alcance | 🟢 Verde | 70 de 70 SP (9 historias) | 78 de 78 SP (10 historias) y cierre completo | ⬆️ Mejora |
| Cronograma | 🟢 Verde | SPI 1,000 (al día) | SPI 1,077 (terminado antes de lo planificado) | ⬆️ Mejora |
| Costos | 🟡 Ámbar | CPI 0,938 | CPI 0,939 | ➡️ Estable |
| Calidad | 🟢 Verde | 109 pruebas aprobadas | 131 pruebas + 79 pruebas E2E aprobadas | ⬆️ Mejora |

**Indicadores de valor ganado al corte** (detalle en el [Reporte EVM](<03 Reporte de Análisis de Valor Ganado - EVM V_1_0_0.md>)):

| Indicador | Este periodo (31/10 – 26/11) | Acumulado al 26/11 | Acumulado al 30/10 |
|---|---|---|---|
| Valor Planificado (PV) | S/ 13,275.43 | S/ 53,931.43 | S/ 40,656.00 |
| Valor Ganado (EV) | S/ 17,424.00 | S/ 58,080.00 | S/ 40,656.00 |
| Costo Real (AC) | S/ 18,536.25 | S/ 61,884.25 | S/ 43,348.00 |
| SV (EV − PV) | + S/ 4,148.57 | + S/ 4,148.57 | S/ 0.00 |
| CV (EV − AC) | − S/ 1,112.25 | − S/ 3,804.25 | − S/ 2,692.00 |
| SPI (EV / PV) | 1,312 | 1,077 | 1,000 |
| CPI (EV / AC) | 0,940 | 0,939 | 0,938 |

**Avance respecto al presupuesto (BAC = S/ 58,080.00):** 92,9 % planificado · **100 % ganado** · 106,6 % gastado.

---

## 1. Información de Alcance

- **Logros completados:**
  - **Historia US-010 (8 SP):** avisos al cliente en 3 momentos del pedido (registrado, en camino y entregado o no entregado), página pública de seguimiento y búsqueda «¿Dónde está mi pedido?» por código, DNI/RUC o celular. Se cerró con el [PR #19](https://github.com/DayanaJC/EcoRuta-Wanka/pull/19) y el [PR #20](https://github.com/DayanaJC/EcoRuta-Wanka/pull/20).
  - **Mejoras de rendimiento Green IT:** paginación, carga diferida, caché y auditoría automática con Lighthouse.
  - **Pruebas automáticas con Playwright:** 79 de 79 aprobadas en Chromium, Firefox y WebKit.
  - **Evaluación de usabilidad (SUS):** 79,06 puntos con 8 participantes. Supera el promedio de referencia de 68 puntos, así que la usabilidad se considera **buena** (grado A−).
  - **Automatización con GitHub Actions:** los workflows `ci.yml`, `tests.yml`, `deploy-production.yml` y `green-audit.yml` están en verde.
  - **Versión final publicada en Vercel**, con Next.js 16.4.6 (sin avisos de seguridad).
  - **Entregables de cierre completos:**
    - los 7 documentos de `docs/04 Cierre` (estado, variación, valor ganado, tableros, radiadores, reporte final y lecciones aprendidas);
    - el video del proyecto en `docs/05 Video proyecto` (elevator pitch y demostración).
  - **Documentación al día:**
    - Sprint 4: revisión, retrospectiva, análisis con Playwright y usabilidad.
    - README con índice de todos los documentos y badges de los workflows.
    - Documentos de inicio y planificación actualizados con RF-10 / US-010.
    - Backlog de Jira con las 10 historias en «Listo».
- **Cambios al alcance (adiciones, eliminaciones o modificaciones):**
  - Se **agregó** la historia **US-010** (8 SP), que no estaba en el backlog inicial de 9 historias (70 SP). El alcance pasó de **70 a 78 SP** (+11,4 %).
  - Se trabajó dentro del Sprint 4, que estaba reservado para integración y pruebas, **sin mover la fecha de cierre**.
  - No se eliminó ni modificó ninguna historia.
- **Información de calidad (defectos o incidentes detectados):**
  - **Defectos detectados en el periodo, ambos corregidos:**
    - Next.js 16.4.3 tenía **7 avisos de seguridad** (severidad moderada) que detenían la compilación. Se actualizó a 16.4.6.
    - La primera ejecución de las pruebas E2E en GitHub Actions **falló al instalar los navegadores**. Se corrigió usando la imagen oficial de Playwright.
  - **Funciones del sistema:** sin errores. Las pruebas automáticas del backend pasaron de 109 a **131 aprobadas** (+22) y la cobertura subió a **86,1 %** (meta ≥ 80 %).
  - **Velocidad:** la API responde en **menos de 0,3 segundos** (meta < 0,5 s).

## 2. Información de Cronograma

- **Actividades/Hitos planificados pero no completados:** **ninguno**. Todos los hitos se cumplieron:
  - Sprint 4: 19/11/2026.
  - Inicio del cierre: 20/11/2026.
  - Cierre del proyecto con todos sus entregables: 26/11/2026.
- **Causa raíz de las desviaciones:**
  - En este periodo no hay retraso. El adelanto (SPI 1,077; SV + S/ 4,148.57) se debe a que el desarrollo terminó a tiempo y el cierre **empezó el 20/11 y terminó el 26/11**, cuando estaba planificado del 23/11 al 06/12.
  - El único retraso del proyecto fue en el **Sprint 1** (+7 días), por el cambio de tecnología CC-01. Se recuperó en el Sprint 2.
- **Impacto en próximos hitos o en la ruta crítica:** positivo. Con el cierre terminado, la ruta crítica queda libre. La sustentación final se presenta con el producto y la documentación ya completos.
- **Acciones correctivas o preventivas planificadas:** no se necesitan acciones correctivas. Como acción preventiva, ensayar la sustentación y comprobar el sistema en producción el día anterior a la presentación.

## 3. Información de Costos

- **Fondos ejecutados en este periodo:** **S/ 18,536.25** (costo real del 31/10 al 26/11), para un trabajo valorizado en **S/ 17,424.00** (Sprint 4 y cierre completos).
  - La diferencia es de **S/ 1,112.25** (6,4 % más que el valor del trabajo realizado).
  - El costo final del proyecto es de **S/ 61,884.25**.
- **Causa raíz de la variación (mano de obra, materiales o estimaciones):** **mano de obra**.
  - En el Sprint 4 se trabajaron **50 horas más** de lo planificado, por la historia nueva US-010 y las mejoras Green IT.
  - El cierre costó **S/ 424.00 menos** de lo presupuestado: 160 horas en lugar de unas 173.
  - Se **ahorraron S/ 146.25** porque el hosting del backend y el dominio no se contrataron: el plan gratuito de Vercel cubre ambos.
- **Impacto en el presupuesto general o reserva de contingencia:**
  - **Costo final (EAC = AC):** S/ 61,884.25, que supera en S/ 3,804.25 el presupuesto base de S/ 58,080.00.
  - **Reserva de contingencia usada:** S/ 3,804.25 de los S/ 6,969.60 disponibles (**54,6 %**). Quedan S/ 3,165.35 sin usar.
  - **Presupuesto total aprobado:** el proyecto cerró **dentro** de los S/ 65,049.60 (presupuesto base + reserva).
- **Acciones correctivas o preventivas planificadas:** el proyecto está cerrado y no habrá más gastos de desarrollo. Para futuros proyectos se recomienda estimar las horas con la velocidad real de los sprints anteriores, porque el sobrecosto vino de subestimar horas.

## 4. Proyección (Look Ahead)

- **Logros/Entregables planificados para el próximo periodo (27/11 – 02/12/2026):**

| Actividad | Responsable | Fecha |
|---|---|---|
| Sustentación final (10 min de gestión y cierre + 10 min de demostración del sistema) | Ambos integrantes | 02/12/2026 |
| Entrega del sistema a WankaLogística S.A.C.: enlaces de producción, README y guía de uso | Javier Curi Dayana | 02/12/2026 |
| Revisión del sistema en producción antes de la sustentación (API, base de datos y pruebas en verde) | Arroyo Canchari Henry | 01/12/2026 |

- **Costos planificados para el próximo periodo:** **S/ 0.00 adicionales** (ETC = 0). El trabajo está terminado y el costo final es igual al costo real (EAC = AC = S/ 61,884.25). La sustentación usa el sistema y los servicios gratuitos ya publicados.

## 5. Riesgos, Incidentes y Comentarios

- **Nuevos riesgos identificados:**
  - **Publicación dependiente de una sola cuenta:** el proyecto de Vercel está en la cuenta de un integrante (Arroyo Canchari Henry).
    - **Respuesta:** él publica cada versión aprobada. Además, el workflow `deploy-production.yml` comprueba después de cada cambio que producción responda correctamente.
  - **Arranque lento de la base de datos:** Neon (plan gratuito) se suspende cuando no se usa (RSK-01, IMP-09).
    - **Respuesta:** «despertar» la API minutos antes de la demostración. Los workflows de pruebas ya lo hacen automáticamente.
- **Nuevos incidentes (Issues) surgidos:**
  - Compilación del frontend bloqueada por la versión vulnerable de Next.js (**resuelto**).
  - Fallo inicial de las pruebas E2E en GitHub Actions (**resuelto**).
- **Comentarios relevantes:**
  - El producto cumple su objetivo, funciona en producción y el proyecto queda cerrado con todos sus entregables.
  - Los montos son una **estimación académica**: horas del equipo valorizadas con las tarifas del [Presupuesto del proyecto](../02%20Planificacion/04%20Presupuesto%20del%20proyecto%20V_1_0_0.md). No son gastos reales de dinero.

---

[⬅️ Volver al README Principal](../../README.md)

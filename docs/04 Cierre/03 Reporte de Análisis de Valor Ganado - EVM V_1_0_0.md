# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 03. Reporte de Análisis de Valor Ganado - EVM (Earned Value Analysis Report)

**Proyecto:** EcoRuta Wanka — Optimizador de rutas sostenibles de última milla para WankaLogística S.A.C. | **Presupuesto hasta la Conclusión (BAC):** S/ 58,080.00 | **Estado General:** 🟢 Proyecto terminado al 100 %, antes de lo planificado y dentro del presupuesto total aprobado | **Versión:** 1.0.0

**Fecha de corte:** 26/11/2026 (cierre del proyecto) | **Líder del proyecto:** Javier Curi Dayana | **Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

---

## ¿Qué es el valor ganado?

El análisis de valor ganado responde tres preguntas con números:

- **PV (Valor Planificado):** ¿cuánto trabajo **debíamos** tener hecho a la fecha, valorizado en soles?
- **EV (Valor Ganado):** ¿cuánto trabajo **realmente** terminamos, valorizado con el mismo presupuesto?
- **AC (Costo Real):** ¿cuánto **nos costó** lo que hicimos?

### Datos usados

| Dato | Valor | De dónde sale |
|---|---|---|
| **BAC** (presupuesto base) | **S/ 58,080.00** | Recursos humanos (S/ 57,540.00) + herramientas (S/ 393.75) + nube (S/ 146.25), según el [Presupuesto del proyecto](../02%20Planificacion/04%20Presupuesto%20del%20proyecto%20V_1_0_0.md). |
| Reserva de contingencia | S/ 6,969.60 (12 %) | No forma parte del BAC: se usa solo si hay sobrecostos. Total aprobado: **S/ 65,049.60**. |
| Tarifa promedio | S/ 33.65 por hora | S/ 57,540 ÷ 1,710 horas presupuestadas. |
| Reparto del BAC en el tiempo | Planificación 10 %, cada sprint 20 % (S1 a S4) y cierre 10 % | Etapas del [Acta de constitución](../01%20Inicio/02.%20Acta%20de%20constituci%C3%B3n%20V_1_0_0.md): inicio, desarrollo, integración y pruebas, cierre. El cierre se planificó del 23/11 al 06/12 (14 días), y su valor planificado se reparte por igual entre esos días. |
| Cómo se mide el avance (EV) | Una etapa vale su presupuesto completo solo cuando sus entregables fueron aceptados: las historias en la Sprint Review y, en el cierre, los 7 documentos, el video y la versión final publicada. | Revisiones del Sprint 1 a 4 y entregables de `docs/04 Cierre` y `docs/05 Video proyecto`. |
| Cómo se mide el costo (AC) | Horas trabajadas × S/ 33.65, más herramientas, menos lo que no se gastó. | Estimación académica del equipo (no son pagos reales). |

### Detalle por etapa (en soles)

| Etapa | Fechas planificadas | Fechas reales | PV al 26/11 | EV | AC | Por qué AC es distinto |
|---|---|---|---:|---:|---:|---|
| Planificación | 17/08 – 09/09 | 17/08 – 09/09 | 5,808.00 | 5,808.00 | 5,808.00 | Sin diferencia. |
| Sprint 1 | 10/09 – 25/09 | 10/09 – 02/10 | 11,616.00 | 11,616.00 | 13,635.00 | +60 h por el cambio de tecnología CC-01. |
| Sprint 2 | 28/09 – 08/10 | 28/09 – 08/10 | 11,616.00 | 11,616.00 | 11,616.00 | Sin diferencia. |
| Sprint 3 | 12/10 – 30/10 | 12/10 – 30/10 | 11,616.00 | 11,616.00 | 12,289.00 | +20 h para corregir SonarQube, OWASP y WCAG. |
| Sprint 4 | 02/11 – 20/11 | 02/11 – 20/11 | 11,616.00 | 11,616.00 | 13,152.25 | +50 h (US-010 y Green IT) − S/ 146.25 de hosting y dominio no gastados. |
| Cierre | 23/11 – 06/12 | 20/11 – 26/11 | 1,659.43 | 5,808.00 | 5,384.00 | 160 h en lugar de unas 173: costó S/ 424.00 menos. Al 26/11 solo tocaban 4 de 14 días de cierre (PV = 5,808.00 × 4 ÷ 14). |
| **Total al 26/11** | | | **53,931.43** | **58,080.00** | **61,884.25** | |

---

## 1. Métricas de Desempeño EVM

- **Periodo actual:** del 31/10 al 26/11/2026 (Sprint 4 y etapa de cierre).
- **Acumulado del periodo anterior:** hasta el 30/10/2026 (fin del Sprint 3).

| Métrica / Indicador | Periodo Actual | Acumulado Periodo Actual | Acumulado Periodo Anterior |
|---|---:|---:|---:|
| Valor Planificado (PV) | S/ 13,275.43 | S/ 53,931.43 | S/ 40,656.00 |
| Valor Ganado (EV) | S/ 17,424.00 | S/ 58,080.00 | S/ 40,656.00 |
| Costo Real (AC) | S/ 18,536.25 | S/ 61,884.25 | S/ 43,348.00 |
| Variación del Cronograma (SV = EV - PV) | +S/ 4,148.57 | +S/ 4,148.57 | S/ 0.00 |
| Variación del Costo (CV = EV - AC) | −S/ 1,112.25 | −S/ 3,804.25 | −S/ 2,692.00 |
| Índice de Desempeño del Cronograma (SPI = EV / PV) | 1.312 | 1.077 | 1.000 |
| Índice de Desempeño del Costo (CPI = EV / AC) | 0.940 | 0.939 | 0.938 |

**Cómo se calcularon los acumulados actuales:**

- SV = 58,080.00 − 53,931.43 = **+4,148.57**
- CV = 58,080.00 − 61,884.25 = **−3,804.25**
- SPI = 58,080.00 ÷ 53,931.43 = **1.077**
- CPI = 58,080.00 ÷ 61,884.25 = **0.939**

**Qué significan:**

- **SPI mayor a 1** → terminamos **antes de lo planificado**: al 26/11 ya estaba hecho todo el proyecto, cuando solo se esperaba el 92,9 %.
- **CPI menor a 1** → gastamos **un poco más de lo planificado**: por cada S/ 1.00 gastado obtuvimos S/ 0.94 de trabajo.
- **Comparación con el periodo anterior:** el cronograma pasó de «al día» (1.000) a «adelantado» (1.077). El costo se mantuvo estable (de 0.938 a 0.939), porque el cierre costó menos de lo presupuestado.

## 2. Porcentajes de Avance Acumulado (Respecto al BAC)

- **Porcentaje Planificado (PV / BAC):** 53,931.43 ÷ 58,080.00 = **92.86 %**
- **Porcentaje Ganado (EV / BAC):** 58,080.00 ÷ 58,080.00 = **100.00 %**
- **Porcentaje Gastado (AC / BAC):** 61,884.25 ÷ 58,080.00 = **106.55 %**

En palabras simples: a la fecha de cierre debíamos llevar el 92,9 % y **terminamos el 100 %**. Para lograrlo se gastó el 106,6 % del presupuesto base. Ese 6,6 % extra se pagó con parte de la reserva de contingencia.

## 3. Análisis de Desviaciones

- **Causa raíz de la variación del cronograma:**
  - **Único retraso:** el **Sprint 1** terminó 7 días tarde por el cambio de tecnología **CC-01** (riesgo RSK-16). Se recuperó en el Sprint 2, y al 30/10 el SPI ya era 1.000.
  - **Adelanto final:** el desarrollo terminó a tiempo y la documentación se fue preparando durante los sprints. Por eso el cierre se completó en una semana (del 20/11 al 26/11) en lugar de las dos planificadas (del 23/11 al 06/12).
- **Impacto en el cronograma:** **positivo**. El proyecto terminó **10 días antes** de la fecha planificada y no quedan hitos pendientes de desarrollo ni de documentación.
- **Causa raíz de la variación del costo:** **más horas de trabajo** que las presupuestadas en los sprints (130 h en total):
  - migración de tecnología: 60 h;
  - correcciones de calidad y seguridad: 20 h;
  - historia nueva US-010 y mejoras Green IT: 50 h.

  Hubo ahorros que redujeron el exceso: el cierre costó S/ 424.00 menos (160 h en lugar de unas 173), y no se gastaron S/ 146.25 en hosting y dominio.
- **Impacto en el presupuesto:** el proyecto terminó **S/ 3,804.25 por encima del BAC** (S/ 58,080.00), pero **dentro del presupuesto total aprobado** (S/ 65,049.60), porque el exceso se cubrió con el 54,6 % de la reserva de contingencia.

## 4. Estimaciones a la Conclusión (EAC)

Se usan los valores acumulados al cierre:

- BAC = 58,080.00, EV = 58,080.00, AC = 61,884.25
- CPI = 0.938526, SPI = 1.076923
- CPI × SPI = 1.010721

**Resultados:**

- **Fórmula 1 (EAC = BAC / CPI):** 58,080.00 ÷ 0.938526 = **S/ 61,884.25**
- **Fórmula 2 (EAC = BAC / (CPI × SPI)):** 58,080.00 ÷ 1.010721 = **S/ 57,463.95**
- **Fórmula 3 (EAC = AC + [(BAC - EV) / (CPI × SPI)]):** 61,884.25 + (0.00 ÷ 1.010721) = **S/ 61,884.25**
- **EAC Seleccionado, Justificación y Explicación:** se elige la **Fórmula 1, EAC = S/ 61,884.25**.
  - **Por qué esta fórmula:** el proyecto ya está terminado (EV = BAC), así que el costo final es simplemente lo que se gastó: EAC = AC. La Fórmula 1 da exactamente ese valor, porque supone la misma eficiencia de costo (CPI) que tuvo el proyecto.
  - **La Fórmula 3 coincide** con la 1: como no queda trabajo por hacer (BAC − EV = 0), solo suma el costo real.
  - **Por qué no la Fórmula 2:** da S/ 57,463.95, un valor **menor a lo que ya se gastó** (S/ 61,884.25). Eso es imposible, porque «premia» el adelanto del cronograma (SPI mayor a 1) como si redujera el costo.
  - **Lo que significa:**
    - **Costo para terminar:** S/ 0.00 (ETC = EAC − AC = 0), porque no queda trabajo pendiente.
    - **Diferencia con el BAC:** el proyecto cerró **S/ 3,804.25 por encima** (VAC = BAC − EAC = −3,804.25).
    - **Reserva de contingencia:** equivale al **54,6 %** de la reserva, así que el costo final queda **dentro de los S/ 65,049.60 aprobados**, con S/ 3,165.35 de reserva sin usar.

---

La evolución de estos valores se ve en los gráficos del [04 Tableros de Control - Híbridos](04%20Tableros%20de%20Control%20-%20H%C3%ADbridos%20V_1_0_0.md).

[⬅️ Volver al README Principal](../../README.md)

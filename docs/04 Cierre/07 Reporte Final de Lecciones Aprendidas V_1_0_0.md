[⬅️ Volver al README Principal](../../README.md)

# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 07. Reporte Final de Lecciones Aprendidas (Final Lessons Learned Report)

**Proyecto:** EcoRuta Wanka — Optimizador de rutas sostenibles de última milla para WankaLogística S.A.C. | **Fecha de Reunión de Cierre:** 26/11/2026 | **Versión:** 1.0.0

**Líder del proyecto:** Javier Curi Dayana | **Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

**Fuentes:**

- las cuatro retrospectivas de sprint;
- los registros de impedimentos de los Sprints 1 y 2;
- el registro de riesgos;
- los reportes [01](01%20Reporte%20de%20Estado%20V_1_0_0.md) a [06](06%20Reporte%20Final%20del%20Proyecto%20V_1_0_0.md) de esta carpeta;
- la reunión de cierre del equipo (26/11/2026).

Cada lección se apoya en un dato del proyecto, para que un futuro equipo pueda comprobarla y no la tome como un consejo general.

---

## 1. Matriz Consolidada de Aprendizajes

| Categoría de Gestión | Prácticas Efectivas (Qué mantener) | Oportunidades de Mejora (Qué evitar/ajustar) | Recomendación para Futuros Equipos |
|---|---|---|---|
| **Desempeño del Equipo (Dinámica ágil y general)** | • Reunión corta de avances desde el Sprint 2: el ánimo pasó de 2,5 a 4,0 y no hubo más retrasos.<br>• Ramas y Pull Requests para todo cambio (20 PR), cada uno revisado en menos de un día.<br>• Retrospectivas con acciones concretas, responsable y fecha. Todas se cumplieron. | • El cambio CC-01 se hizo sin conversarlo antes con todo el equipo, y fue el peor momento del proyecto (ánimo 2,5).<br>• El conocimiento quedó concentrado: el motor de rutas en un integrante y la documentación en el otro (retrospectivas 1 y 3).<br>• Una sola cuenta integraba y publicaba en Vercel. | • Toda decisión técnica grande se conversa y se registra como control de cambios **antes** de ejecutarla.<br>• Hacer al menos un Pull Request «cruzado» por sprint: cada integrante revisa o programa una parte del otro.<br>• Dar acceso de despliegue a 2 personas como mínimo. |
| **Evolución y Control del Alcance (Predictivo vs. Adaptativo)** | • Alcance de producto fijo en historias de Jira con Story Points: 70 SP estables durante 3 sprints.<br>• El cambio de alcance (US-010, +8 SP) se aceptó solo porque había capacidad: el Sprint 4 estaba reservado para integración.<br>• Ocultar funciones que no aportaban (Resumen, Asignaciones) en vez de mantenerlas. | • Durante el Sprint 2 hubo documentación que daba historias por terminadas antes de que el código existiera. Se detectó y corrigió con el PR #10.<br>• El docente esperaba un envío automático de avisos; el alcance real era un envío asistido por WhatsApp (retrospectiva 4). | • **La documentación sigue al código, no al revés:** una historia se marca «Listo» solo cuando su PR está integrado y publicado.<br>• Escribir en el criterio de aceptación lo que **no** incluye la historia (por ejemplo, «el envío lo confirma el usuario»).<br>• Dejar un sprint con holgura antes del cierre para absorber cambios. |
| **Desempeño e Integración del Cronograma Híbrido** | • Marco predictivo (16 semanas, hitos, cierre) con ejecución en sprints: el retraso del Sprint 1 (+7 días) no movió ningún hito.<br>• Preparar la documentación durante los sprints permitió cerrar en 1 semana en lugar de 2 (−10 días, SPI 1,077).<br>• Publicar en producción desde el Sprint 1: cada Review se hizo sobre el sistema real. | • Las fechas de los sprints en Jira (S3: 23/10 – 29/10; S4: 14/11 – 19/11) no coinciden con las del cronograma (S3: 12/10 – 30/10; S4: 02/11 – 20/11).<br>• Los sprints duraron entre 6 y 22 días, sin un ritmo fijo. | • Usar **la misma fecha** de sprint en Jira y en el cronograma, y sprints de duración fija (2 semanas).<br>• Planificar el cierre como un entregable continuo, con plantillas desde el primer sprint. |
| **Gestión del Presupuesto y Costos** | • Reserva de contingencia del 12 %: cubrió todo el sobrecosto (S/ 3,804.25 = 54,6 % de la reserva).<br>• Servicios gratuitos (Neon, Vercel, ORS, GitHub Actions): costo de nube S/ 0.00 y S/ 146.25 ahorrados.<br>• Valorizar las horas con una tarifa única (S/ 33.65/h) facilitó el EVM. | • CPI 0,939: los 3 sobrecostos (60 h, 20 h y 50 h) vinieron de horas no estimadas, no de compras.<br>• El costo real se calculó al final y no sprint por sprint. | • Registrar las horas reales **cada semana** (en Jira o en una hoja compartida) y calcular el CPI en cada Review.<br>• Reservar horas explícitas para corregir hallazgos de calidad (SonarQube, OWASP, WCAG). Costaron 20 h no planificadas. |
| **Técnicas de Estimación (Velocidad, duración, recursos)** | • Story Points con la serie de Fibonacci (5, 8, 13): las historias de 13 SP (US-003 y US-007) fueron, en efecto, las más complejas.<br>• Velocidad estable una vez fijada la tecnología: 29 y 18 SP en sprints de distinta duración, sin arrastrar trabajo. | • La estimación de horas del Sprint 1 no contempló el riesgo de migración (RSK-16), aunque estaba identificado.<br>• No se midió la velocidad en horas por SP, así que no se pudo predecir el costo de US-010. | • Estimar con la **velocidad real** de los sprints anteriores (23,3 SP por sprint de desarrollo en este proyecto).<br>• Sumar a la estimación el impacto de los riesgos con probabilidad media o alta.<br>• Llevar la relación horas/SP para convertir puntos en costo. |
| **Procesos de Aseguramiento de Calidad** | • Pruebas automáticas que crecieron con el producto: de 71 a 131 en el backend, más 79 E2E en 3 navegadores.<br>• Calidad revisada con herramientas externas (SonarQube, axe, Lighthouse, `npm audit`), que encontraron defectos que las pruebas no veían.<br>• CI/CD con 4 workflows: ningún cambio llega a producción sin pasar las pruebas. | • En el Sprint 3 se agregaron funciones antes que sus pruebas: cobertura del 77,4 %, bajo la meta del 80 %.<br>• QA concentrado al final del Sprint 1 (el cuello de botella del tablero: 22 días de ciclo).<br>• Las vistas previas de Vercel no podían probarse contra la API por la protección de despliegue. | • Escribir la prueba **junto con** la función y bloquear el merge si la cobertura baja de la meta.<br>• Configurar desde el inicio un entorno de prueba completo (frontend y backend de preview conectados).<br>• Ejecutar SonarQube y la auditoría de dependencias en cada PR, no solo al final. |
| **Involucramiento de Interesados (Stakeholders)** | • Una Sprint Review por sprint con demostración en producción ante el docente: 100 % de aceptación.<br>• Prueba de usabilidad SUS con 8 perfiles de los 5 roles del sistema (79,06, A−).<br>• Mensajes de los avisos escritos con palabras sencillas para bodegas de Huancayo. | • Los interesados de WankaLogística son ficticios: la validación del negocio depende de perfiles simulados (RSK-09).<br>• El perfil de conductor quedó bajo la meta (SUS 62,5): esperaba que el aviso se enviara solo.<br>• Las observaciones del docente se aclaraban tarde (avisos de US-010). | • Validar con **al menos un usuario real** del rubro (una distribuidora o bodega local) antes del Sprint 2.<br>• Diseñar una vista simplificada para el conductor, en el celular.<br>• Al iniciar cada historia, confirmar con el docente el criterio de aceptación en 5 minutos. |
| **Gestión de Riesgos, Incidentes e Impedimentos** | • Registro de riesgos con respuesta preparada: cuando RSK-16 se materializó, la respuesta (migrar por módulos) ya existía.<br>• Impedimentos con responsable y fecha tope: los 11 de los Sprints 1 y 2 se resolvieron. Los del Sprint 2 tardaron de 2 a 3 días; los del Sprint 1, de 5 a 16 días, porque 4 de los 7 se cerraron recién con la migración CC-01 (27/09).<br>• Respuesta técnica a RSK-01: un paso que «despierta» la API antes de medir. | • Algunos riesgos se trataron como «aceptados» sin fecha de revisión (RSK-14, autenticación).<br>• Las dependencias de terceros (Next.js, imagen de GitHub Actions) generaron 2 incidentes en el Sprint 4 que no estaban en el registro. | • Agregar al registro un riesgo de **dependencias y herramientas** (vulnerabilidades, cambios de versión) y revisarlo en cada sprint.<br>• Todo riesgo aceptado lleva un responsable y una condición que lo reactiva (por ejemplo, «si se usan datos reales → implementar autenticación»). |

---

## 2. Conclusiones de la Retrospectiva de Cierre

La reunión de cierre se hizo el **26/11/2026** con los dos integrantes. Se revisaron los radiadores ([05](05%20Radiadores%20de%20Informaci%C3%B3n%20V_1_0_0.md)), los indicadores híbridos ([04](04%20Tableros%20de%20Control%20-%20H%C3%ADbridos%20V_1_0_0.md)) y el EVM ([03](03%20Reporte%20de%20An%C3%A1lisis%20de%20Valor%20Ganado%20-%20EVM%20V_1_0_0.md)). Las conclusiones son:

1. **El enfoque híbrido funcionó porque cada parte controló lo suyo.**
   - El marco predictivo protegió las fechas y el presupuesto: ningún hito se movió y el sobrecosto quedó dentro de la reserva.
   - Scrum absorbió los cambios: una migración de tecnología y una historia nueva.
   - La lección es usar cada enfoque para lo que hace bien, y no aplicar los dos a todo.

2. **Los dos peores momentos del proyecto tienen la misma causa: cambios sin conversar.**
   - El cambio CC-01 en el Sprint 1 y las dudas sobre los avisos de US-010 en el Sprint 4 bajaron el ánimo y subieron el costo (110 de las 130 horas extra).
   - Para cualquier equipo, la práctica más rentable es conversar y registrar el cambio antes de ejecutarlo.

3. **La calidad automatizada fue la mejor inversión.**
   - Las pruebas, SonarQube, Lighthouse CI y los workflows costaron horas, pero bajaron el tiempo de ciclo de 22 a 5 días.
   - También permitieron agregar US-010 al final sin romper lo existente: 131/131 y 79/79 pruebas en verde.

4. **El costo es lo que más debe mejorar.**
   - El CPI de 0,939 se explica por estimar en Story Points sin convertirlos a horas reales.
   - Un registro semanal de horas habría mostrado la desviación en el Sprint 1 y no en el cierre.

5. **El producto queda listo para operar; el negocio queda por medir.**
   - El sistema mide CO₂, combustible y puntualidad (O1–O3), pero esas metas solo pueden comprobarse con meses de operación real.
   - El siguiente equipo debería empezar por la autenticación y por una prueba piloto con una distribuidora real de Huancayo.

**Las 3 lecciones que el equipo aplicaría desde el primer día en un nuevo proyecto:**

| # | Lección | Indicador para saber si se cumple |
|---|---|---|
| 1 | Conversar y registrar todo cambio importante antes de ejecutarlo. | 0 cambios técnicos sin un control de cambios aprobado. |
| 2 | Registrar las horas reales cada semana y revisar el CPI en cada Review. | CPI calculado en las 4 Reviews; alerta si baja de 0,95. |
| 3 | Marcar una historia como «Listo» solo cuando su código está integrado, probado y publicado. | 100 % de las historias «Listo» con su PR integrado y con los workflows en verde. |

---

[⬅️ Volver al README Principal](../../README.md)

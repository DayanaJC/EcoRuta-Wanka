# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 02. Estándares de Ingeniería de Software V_1_0_0

**Versión:** V_1_0_0 | **Fecha:** 12/11/2026 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Nombre del proyecto:** EcoRuta Wanka

**Líder del proyecto:** Javier Curi Dayana | **Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

**Tecnologías del proyecto:** Next.js 16 + React 19 (frontend), Node.js + Express 5 (backend), PostgreSQL (Neon) con Prisma 7 (base de datos) y Vercel (publicación).

**Documento relacionado:** [01 Informe de reducción del impacto ambiental V_1_0_0](01%20Informe%20de%20reduccion%20del%20impacto%20ambiental%20V_1_0_0.md)

---

## 1. Propósito y alcance

Este documento reúne los estándares de ingeniería de software que sigue el equipo de EcoRuta Wanka para que el sistema sea **mantenible, seguro, accesible y eficiente en el uso de recursos (Green IT)**.

El informe 01 explica qué optimizaciones se hicieron y cuánto redujeron el impacto ambiental. Este documento convierte esas optimizaciones en **reglas permanentes**: cualquier cambio futuro en el código debe cumplirlas para que el sistema no vuelva a crecer en peso, solicitudes o consumo de energía.

**Alcance:** todo el código del repositorio (`backend/` y `frontend/`), la base de datos, la documentación de `docs/` y el flujo de trabajo con Git y Vercel.

**Adaptación a las tecnologías del proyecto:** la guía de referencia del curso está planteada para la arquitectura MERN (MongoDB, Express, React, Node). EcoRuta Wanka usa Express, React y Node, pero reemplaza MongoDB por **PostgreSQL con Prisma**. Por eso, las reglas sobre consultas (proyección de campos, índices, paginación) se aplican con `select`, `@@index`, `skip`/`take` de Prisma en lugar de sus equivalentes de Mongoose.

---

## 2. Marco normativo adoptado

| Estándar / guía | Qué regula | Cómo se aplica en EcoRuta Wanka |
|---|---|---|
| **ISO/IEC 25010:2023** (modelo de calidad del producto) | Características de calidad: eficiencia de desempeño, mantenibilidad, seguridad, usabilidad, fiabilidad. | La eficiencia de desempeño se controla con el presupuesto de rendimiento (sección 7); la mantenibilidad con la arquitectura por capas y SonarQube; la seguridad con OWASP; la usabilidad con WCAG. |
| **ISO/IEC/IEEE 12207:2017** (procesos del ciclo de vida del software) | Procesos de desarrollo, verificación, gestión de configuración y documentación. | Se aplica con Scrum (sprints, revisión, retrospectiva), control de versiones en Git, Pull Requests y documentación versionada en `docs/`. |
| **ISO/IEC 21031:2024 — Software Carbon Intensity (SCI)** | Forma de medir las emisiones de un software por unidad funcional. | La unidad funcional adoptada es **una visita a la aplicación**; las emisiones se estiman en g CO₂e por visita (sección 8). |
| **Sustainable Web Design Model v4 (SWDM v4)** | Fórmula para estimar el CO₂ de una página según los datos transferidos. | Se usa en el informe 01 y en la sección 8 de este documento (0,300 kWh/GB × 494 g CO₂e/kWh). |
| **W3C Web Sustainability Guidelines (WSG 1.0)** | Buenas prácticas de diseño y desarrollo web sostenible. | Origen de las reglas de Green coding GS-01 a GS-10 (sección 4). |
| **Principios de la Green Software Foundation** | Eficiencia energética, de hardware y de carbono. | Menos datos transferidos y menos solicitudes = menos energía en servidor, red y dispositivo. |
| **Core Web Vitals / Lighthouse** | Métricas de experiencia: FCP, LCP, TBT, CLS. | Metas del presupuesto de rendimiento y auditoría con PageSpeed Insights. |
| **OWASP Top 10:2025** | Riesgos de seguridad en aplicaciones web. | Evaluado en `Sprint 3/04 OWASP V_1_0_0.md`; ningún cambio puede reintroducir hallazgos corregidos. |
| **WCAG 2.2 nivel AA** | Accesibilidad. | Evaluado en `Sprint 3/05 WCAG V_1_0_0.md`; los componentes nuevos (por ejemplo, la paginación) siguen las mismas reglas. |
| **Conventional Commits 1.0** | Formato de los mensajes de commit. | `tipo(ámbito): descripción`, por ejemplo `perf(green-it): …` o `docs(green-it): …` (sección 5). |
| **Versionado de documentos V_X_Y_Z** | Control de versiones de la documentación del proyecto. | X = entrega mayor, Y = cambio de contenido, Z = corrección menor (sección 5.3). |

---

## 3. Estándares de codificación

### 3.1 Arquitectura y estructura de carpetas

El sistema sigue una arquitectura **cliente-servidor** con un backend **MVC con capa de servicios**:

```text
backend/src/
├── routes/         → define los endpoints REST (/api/v1/...) y valida la entrada
├── controllers/    → recibe la petición y devuelve la respuesta HTTP
├── services/       → reglas de negocio (RN-xxx); no conoce Express ni Prisma
├── repositories/   → único lugar con acceso a la base de datos (Prisma)
├── schemas/        → esquemas Zod de validación
├── middlewares/    → validación y manejo centralizado de errores
└── aplicacion.js   → ensambla la app (inyección de dependencias)

frontend/
├── app/            → layout, página y estilos globales (Next.js App Router)
├── components/     → componentes de interfaz; modulos/ = una pantalla por módulo
├── services/api.js → único punto de comunicación con la API
└── utils/          → formatos y funciones puras
```

**Reglas:**

| Código | Regla |
|---|---|
| EC-01 | Las capas solo llaman a la capa inferior: rutas → controladores → servicios → repositorios. |
| EC-02 | Toda lectura o escritura en la base de datos se hace con **Prisma** dentro de `repositories/`; no se escribe SQL a mano (excepción: `SELECT 1` del health check). |
| EC-03 | Toda entrada del usuario se valida en el servidor con un esquema **Zod** antes de llegar al servicio. |
| EC-04 | El frontend se comunica con el backend solo a través de `services/api.js`. |
| EC-05 | Las reglas de negocio se implementan en el backend; el frontend puede repetir validaciones solo para mejorar la experiencia. |

### 3.2 Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Variables y funciones | camelCase, en español y con el término del negocio | `columnasListadoPedido`, `recargar` |
| Componentes React | PascalCase, un componente principal por archivo | `PedidoLista.jsx`, `RutaDetalle.jsx` |
| Constantes de configuración | MAYÚSCULAS_CON_GUION | `POR_PAGINA`, `CACHE_MS`, `TIMEOUT_MS` |
| Tablas y columnas | snake_case en plural (tablas) | `pedidos`, `ventana_entrega_inicio` |
| Endpoints REST | sustantivos en plural, versión en la ruta | `GET /api/v1/pedidos?pagina=1` |
| Clases CSS | kebab-case en español | `.resultado-filtros`, `.paginacion` |

### 3.3 Estilo y legibilidad

- **ESLint** (configuración de Next.js) en el frontend; un cambio no se integra con errores de lint.
- Comentarios en español que explican el **porqué** de una decisión, no el qué (por ejemplo, por qué un GET no lleva `Content-Type`).
- Funciones cortas con una sola responsabilidad; los números con significado se declaran como constantes con nombre.
- Los secretos (`DATABASE_URL`, `ORS_API_KEY`) van en variables de entorno; `.env` nunca se sube al repositorio.

---

## 4. Estándares de Green coding (reglas obligatorias)

Cada regla surge de una de las optimizaciones del informe 01 y queda implementada en el código. Un Pull Request que la incumpla debe justificarlo o corregirse.

| Código | Regla | Criterio de verificación | Implementación en el código |
|---|---|---|---|
| **GS-01** | Consultar solo las columnas que la vista necesita. | Las consultas de listados usan `select` con las columnas de la tabla; no `include` completo. | `columnasListadoPedido` en `backend/src/repositories/prisma.repositories.js` |
| **GS-02** | Paginar los listados que pueden crecer. | Máximo **50** registros por página en la API; **12** por página en la tabla. Página < 1 o límite > 50 → error 422. | `filtroPedidos` (`pagina`, `limite`) en `backend/src/schemas/esquemas.js`; `POR_PAGINA = 12` en `frontend/components/PedidoLista.jsx` |
| **GS-03** | Crear índices para los filtros y ordenamientos frecuentes. | Toda consulta frecuente con `where` + `orderBy` tiene un índice que la cubre. | `@@index([estado, created_at(sort: Desc)])` en `schema.prisma`; migración `20261112231921_indice_pedidos_estado_fecha` |
| **GS-04** | Imágenes en formatos modernos. | Toda imagen se muestra con `next/image` (AVIF/WebP). Los íconos se dibujan con código (lucide-react), no con archivos. | `images.formats` en `frontend/next.config.mjs` |
| **GS-05** | Cargar solo el código que la pantalla necesita. | Solo el módulo inicial (Pedidos) va en el paquete principal; el resto se carga con `lazy` + `Suspense`. Los mapas (Leaflet) se cargan al abrir el mapa. | `frontend/components/App.jsx` |
| **GS-06** | No agregar dependencias para lo que Node.js, React o Next.js ya resuelven. | Antes de instalar una librería se revisa si existe una función nativa equivalente. | `process.loadEnvFile()` en lugar de `dotenv` en `backend/prisma/seed.js` |
| **GS-07** | Reducir solicitudes HTTP. | Las lecturas (GET) no envían cabeceras que obliguen a una solicitud OPTIONS previa. Cada módulo pide sus datos cuando se abre (las asignaciones, al abrir Rutas). | `frontend/services/api.js` y `frontend/components/App.jsx` |
| **GS-08** | Usar caché en el navegador y en el servidor. | GET de la API con `Cache-Control: private, no-cache` + ETag (304 si no hubo cambios); factores de tráfico 1 día; caché del cliente de 30 s que se vacía con cualquier escritura. | `backend/src/aplicacion.js`; `CACHE_MS` en `frontend/services/api.js` |
| **GS-09** | Comprimir las respuestas y limitar los cuerpos recibidos. | Respuestas con Brotli/gzip (Vercel); cuerpo JSON de entrada máximo 100 kB. | Vercel + `express.json({ limit: "100kb" })` en `backend/src/aplicacion.js` |
| **GS-10** | Reservar el espacio de lo que carga después (estabilidad visual). | CLS ≤ 0,02. Los esqueletos de carga tienen el mismo número de filas que la vista final y los contenedores existen desde el inicio. | `FilasCargando filas={POR_PAGINA}` y `.resultado-filtros { min-height }` |

**Regla general:** el mayor aporte ambiental de EcoRuta Wanka es la **optimización de rutas** (menos kilómetros y combustible). Por eso, ninguna regla de este documento puede empeorar el cálculo de rutas, la validación de capacidad ni la precisión de las ventanas horarias.

---

## 5. Gestión de versiones y flujo de trabajo

### 5.1 Ramas y Pull Requests

| Rama | Uso |
|---|---|
| `main` | Versión estable. Cada cambio en `main` se despliega en Vercel (frontend y backend). |
| `feature/<tema>` | Nuevas funcionalidades u optimizaciones (por ejemplo, `feature/green-it`). |
| `docs/<tema>` | Cambios solo de documentación. |

- Los cambios de código llegan a `main` mediante **Pull Request** con la descripción del cambio y su verificación.
- Antes de integrar: pruebas en verde, lint sin errores y, si cambia la interfaz, una captura de escritorio y otra de celular.

### 5.2 Mensajes de commit (Conventional Commits)

```text
<tipo>(<ámbito>): <descripción en imperativo>

tipos: feat · fix · perf · docs · test · refactor · chore
```

Ejemplos del proyecto:

```text
perf(green-it): paginación, carga diferida, caché y menos solicitudes HTTP
docs(green-it): add MERN performance optimization reports and software engineering standards
docs(sprint-3): evaluación OWASP Top 10 2025 y WCAG 2.2 AA con correcciones
```

### 5.3 Versionado de la documentación

Los documentos de `docs/` llevan la versión en el nombre del archivo con el formato **V_X_Y_Z**:

| Posición | Cuándo cambia | Ejemplo |
|---|---|---|
| X | Entrega o línea base nueva | V_1_0_0 → V_2_0_0 |
| Y | Se agrega o modifica contenido | V_1_0_0 → V_1_1_0 |
| Z | Corrección menor u observación del docente | V_1_0_0 → V_1_0_1 |

### 5.4 Base de datos

- Todo cambio de esquema se hace con una **migración de Prisma** versionada en `backend/prisma/migrations/`.
- Tras `prisma migrate dev` se ejecuta `prisma generate`.

---

## 6. Estándares de pruebas y calidad

| Aspecto | Estándar | Estado al 12/11/2026 |
|---|---|---|
| Pruebas automatizadas | Vitest + Supertest; cada regla de negocio o regla GS nueva tiene su prueba. | **115 pruebas en verde** (8 archivos), incluidas 6 nuevas de Green IT (`backend/tests/green-it.test.js`). |
| Cobertura | Mínimo 80 % de líneas en el backend. | **87,22 % de líneas** y 85,91 % de sentencias (`npm run test:coverage`). |
| Calidad de código | SonarQube Cloud, perfil "Sonar way". | Ver `Sprint 3/03 Calidad de código V_1_0_0.md`. |
| Dependencias | `npm audit` sin vulnerabilidades altas ni críticas. | 0 vulnerabilidades (Sprint 3). |
| Rendimiento | Lighthouse ≥ 90 en escritorio y celular. | 100/100 (informe 01, Evidencias 27–29). |
| Accesibilidad | Lighthouse accesibilidad = 100 y axe sin errores graves. | 100 (Sprint 3). |

**Pruebas nuevas de Green IT (`backend/tests/green-it.test.js`):**

1. Sin `pagina`, la API devuelve la lista completa (compatibilidad con las pantallas que necesitan todos los pedidos, como Generar ruta).
2. Con 19 pedidos, la página 1 devuelve 12 y la página 2 los 7 restantes, con `{ pagina, limite, total, paginas }`.
3. Página 0 o límite 51 → error 422.
4. Los listados responden `Cache-Control: private, no-cache` con ETag y devuelven **304** cuando no hubo cambios.
5. Los factores de tráfico responden `public, max-age=86400`.
6. Las escrituras no llevan cabecera de caché.

---

## 7. Presupuesto de rendimiento

El presupuesto de rendimiento fija los límites que la aplicación no debe superar. Se revisa con PageSpeed Insights cada vez que se publica un cambio en la interfaz.

| Métrica | Límite | Valor medido (producción, informe 01) |
|---|---:|---:|
| Rendimiento Lighthouse | ≥ 90 | 100 |
| First Contentful Paint (FCP) | ≤ 1,0 s | 0,2 s |
| Largest Contentful Paint (LCP) | ≤ 1,4 s | 0,5 s |
| Total Blocking Time (TBT) | ≤ 85 ms | 0 ms |
| Cumulative Layout Shift (CLS) | ≤ 0,02 | 0,043 antes · 0,0022 después (medición local, sección 8) |
| Peso total de la página | ≤ 1,1 MB | 258 KiB |
| Solicitudes a la API al abrir | ≤ 6 | 12 antes · 5 después (sección 8) |
| Registros por página en la API | ≤ 50 | 12 por defecto |

---

## 8. Verificación de cumplimiento: medición antes y después

Para comprobar las reglas GS con datos reales (y no solo proyectados) se midió la carga inicial de la aplicación **antes** (rama `main`, commit `8cbaf93`) y **después** (rama `feature/green-it`) de las optimizaciones.

**Método:** ambas versiones se compilaron con `next build` y se sirvieron con `next start` en `localhost:3000`, conectadas al mismo backend (`localhost:4000`) y a la misma base de datos Neon (19 pedidos). La carga se registró con Microsoft Edge sin interfaz (Puppeteer + Chrome DevTools Protocol), con la caché del navegador desactivada, ventana de 1350 × 940 y midiendo el CLS con `PerformanceObserver`.

| Indicador | ANTES | DESPUÉS | Variación | Regla |
|---|---:|---:|---:|---|
| Solicitudes a la API al abrir | 12 (6 GET + 6 OPTIONS) | **5** (5 GET + 0 OPTIONS) | −7 (**−58,3 %**) | GS-07 |
| CLS | 0,0469 | **0,0022** | −0,0447 (**−95,3 %**) | GS-10 |
| JavaScript transferido | 175,9 KiB | **154,2 KiB** | −21,7 KiB (**−12,3 %**) | GS-05 |
| Peso total transferido | 273,0 KiB | **251,6 KiB** | −21,4 KiB (**−7,8 %**) | GS-05, GS-07 |
| Lista de pedidos (19 completos → 1 página de 12 con columnas de tabla) | 13 558 bytes | **4 773 bytes** | −8 785 bytes (**−64,8 %**) | GS-01, GS-02 |
| Consulta repetida sin cambios | 200 con todos los datos | **304** sin cuerpo | — | GS-08 |
| CO₂ por visita (SWDM v4) | 0,0414 g | **0,0382 g** | −0,0032 g (**−7,8 %**) | — |

**Lectura de los resultados:**

- La reducción de solicitudes (12 → 5), el tamaño de la página de pedidos (4 773 bytes) y la respuesta 304 **coinciden** con lo reportado en el informe 01.
- El CLS bajó a 0,0022, **mejor** que la proyección de 0,02 del informe 01.
- El JavaScript inicial bajó **21,7 KiB**, menos que los 84 KiB de "JavaScript sin utilizar" que señaló Lighthouse. La diferencia se explica porque gran parte de ese código es el propio React/Next.js y el módulo Pedidos, que es la pantalla inicial y no puede diferirse. Por eso, el peso de 174 KiB y el CO₂ de 0,0264 g del informe 01 deben actualizarse con la auditoría de PageSpeed Insights sobre la versión publicada (V_1_0_1 del informe 01).
- Los valores de esta medición local son más altos que los de PageSpeed porque `next start` no aplica la misma compresión ni la red de distribución de Vercel; lo que se compara es la **diferencia** entre ambas versiones medidas en las mismas condiciones.

**Evidencia 31: Paginación de pedidos (escritorio)**

La tabla muestra 12 pedidos de 19, con los botones Anterior / Siguiente y el indicador "Página 1 de 2".

![Evidencia 31: Paginación de pedidos](../../06%20Otros/evidencias/Evidencia%2031%20Paginacion%20de%20pedidos.jpg)

**Evidencia 32: Paginación en celular**

La paginación se adapta al ancho del celular sin desplazamiento horizontal.

![Evidencia 32: Paginación en celular](../../06%20Otros/evidencias/Evidencia%2032%20Paginacion%20en%20celular.jpg)

---

## 9. Lista de verificación para cada Pull Request

- [ ] Las capas se respetan (EC-01) y el acceso a datos es con Prisma (EC-02).
- [ ] Las entradas nuevas se validan con Zod (EC-03).
- [ ] Los listados nuevos usan `select` y paginación (GS-01, GS-02).
- [ ] Las consultas nuevas frecuentes tienen índice y migración (GS-03).
- [ ] No se agregan imágenes sin `next/image` ni dependencias evitables (GS-04, GS-06).
- [ ] Las pantallas nuevas se cargan de forma diferida (GS-05) y piden solo sus datos (GS-07).
- [ ] Las escrituras vacían la caché del cliente (GS-08).
- [ ] Los esqueletos de carga reservan el espacio final (GS-10).
- [ ] Pruebas en verde, cobertura ≥ 80 % y lint sin errores.
- [ ] Sin vulnerabilidades altas o críticas en `npm audit`.
- [ ] Capturas de escritorio y celular si cambia la interfaz.
- [ ] Mensaje de commit con Conventional Commits y documentos con versión V_X_Y_Z.

---

## 10. Conclusiones

1. EcoRuta Wanka adopta un marco de estándares reconocidos (ISO/IEC 25010, ISO/IEC/IEEE 12207, ISO/IEC 21031 SCI, WSG 1.0, OWASP, WCAG) adaptado a su arquitectura Node.js + Express + Next.js + PostgreSQL.
2. Las ocho optimizaciones del informe 01 quedaron convertidas en diez reglas de Green coding (GS-01 a GS-10), cada una con un criterio verificable y su ubicación en el código.
3. La medición antes/después confirma la reducción de solicitudes al abrir el sistema (12 → 5), la estabilidad visual (CLS 0,0469 → 0,0022) y la página de pedidos más liviana (13 558 → 4 773 bytes).
4. La reducción real de JavaScript (−21,7 KiB) es menor que la proyectada; el informe 01 debe actualizarse con una nueva auditoría de PageSpeed Insights sobre la versión publicada.
5. Las reglas se mantienen mediante pruebas automatizadas (115 en verde, 87,22 % de cobertura de líneas) y la lista de verificación de cada Pull Request, para que el sistema no vuelva a crecer en peso ni en consumo de recursos.

---

[Volver al README principal](../../../README.md)

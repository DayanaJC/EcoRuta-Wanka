# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 01. Informe de reducción del impacto ambiental V_1_0_0

**Versión:** V_1_0_0 | **Fecha:** 13/11/2026 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Nombre del proyecto:** EcoRuta Wanka

**Líder del proyecto:** Javier Curi Dayana | **Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

**Tecnologías del proyecto:** Next.js 16 + React 19 (frontend), Node.js + Express 5 (backend), PostgreSQL con Prisma (base de datos) y Vercel (publicación).

**Nota sobre las mediciones (13/11/2026):** los valores DESPUÉS de las secciones 1.4, 1.5 y 1.6 se midieron con Lighthouse CI sobre la versión publicada (workflow `green-audit.yml`, Evidencias 33 y 34) y con una comparación local ANTES/DESPUÉS en condiciones idénticas; el cálculo de CO₂ usa el peso medido.

---

## 1. Informe de Reducción del Impacto Ambiental y Optimización de EcoRuta Wanka

### 1.1 Introducción y Propósito del Informe

EcoRuta Wanka es un sistema que ayuda a WankaLogística S.A.C. a organizar sus entregas en Huancayo, El Tambo y Chilca. Su objetivo es encontrar mejores rutas para reducir los kilómetros recorridos, el consumo de combustible y la contaminación.

Sin embargo, el uso de una página web también consume energía, ya que necesita servidores, conexión a internet y dispositivos como computadoras o celulares. Por eso, es importante buscar formas de hacer que el sistema funcione utilizando menos recursos.

A esto se le conoce como **Green IT**, que consiste en utilizar la tecnología de manera más eficiente para reducir su impacto ambiental.

El propósito de este informe es:

1. Revisar el sistema e identificar qué partes podían mejorarse.
2. Aplicar mejoras para reducir el uso de datos y recursos.
3. Comparar los resultados antes y después de las optimizaciones.
4. Estimar la reducción de emisiones de CO₂ generadas por el uso de la página web.
5. Comprobar que las mejoras no afecten el funcionamiento del sistema.

**Adaptación a las tecnologías del proyecto:** Las mejoras se realizaron teniendo en cuenta las tecnologías que utiliza EcoRuta Wanka. Por ejemplo, se trabajó con Prisma y PostgreSQL en lugar de MongoDB, ya que son las tecnologías utilizadas en nuestro proyecto.

**Nota sobre los resultados:** Los valores de ANTES corresponden a las mediciones realizadas sobre el sistema publicado. Los valores de DESPUÉS se midieron sobre la versión optimizada ya publicada, con Lighthouse CI desde GitHub Actions (ver sección 1.4).

---

### 1.2 Diagnóstico Inicial del Proyecto (Métricas Previas)

Para conocer el estado inicial del sistema, se realizó una prueba con **PageSpeed Insights**, utilizando Lighthouse 13.6.0, el día **11/11/2026 a las 6:03 p. m.**

Se evaluó la página publicada:

https://ecoruta-frontend.vercel.app

Los resultados mostraron que el sistema ya tenía un buen rendimiento, pero todavía había algunos aspectos que podían mejorarse:

- La lista de pedidos enviaba más información de la necesaria.
- Al ingresar al sistema se realizaban 12 solicitudes al servidor.
- Los seis módulos se cargaban al inicio, aunque el usuario no los utilizara todos.
- Algunas listas se volvían a solicitar aunque no hubieran cambiado.
- La tabla de pedidos cambiaba de tamaño mientras cargaba la información.

**Resumen de métricas iniciales (ANTES, escritorio):**

| Medida | Descripción | Valor ANTES | Meta |
|---|---|---:|---:|
| Rendimiento (Lighthouse) | Puntaje general de la página | **100/100** | 90 o más |
| First Contentful Paint (FCP) | Tiempo hasta mostrar el primer contenido | **0.2 s** | 1.0 s o menos |
| Largest Contentful Paint (LCP) | Tiempo hasta mostrar el contenido principal | **0.5 s** | 1.4 s o menos |
| Total Blocking Time (TBT) | Tiempo en que la página no responde | **0 ms** | 85 ms o menos |
| Cumulative Layout Shift (CLS) | Cambios de posición de los elementos | **0.043** | 0.02 o menos |
| Peso total de la página | Cantidad de datos descargados | **258 KiB** | 1.1 MB o menos |
| Solicitudes al servidor al abrir | Consultas realizadas al servidor | **12** | Reducir |
| Tamaño de la lista de pedidos | Datos de los 19 pedidos | **13 558 bytes** | Reducir |
| Tiempo de respuesta del servidor | Tiempo de respuesta observado | **250 a 380 ms** | Reducir |
| CO₂ por visita (SWDM v4) | Emisiones estimadas por visita | **0.0392 g** | Reducir |

En la prueba desde un celular también se obtuvo un puntaje de **100/100**, con FCP de 0.9 s, LCP de 0.9 s, TBT de 20 ms y CLS de 0.02.

**Aspectos que ya funcionaban correctamente:**

- La base de datos ya contaba con índices.
- Vercel comprimía las respuestas utilizando Brotli.
- Las respuestas del servidor utilizaban ETag.
- Los mapas se cargaban cuando el usuario abría ese módulo.
- Los íconos se mostraban mediante código, sin descargar imágenes.
- El proyecto utilizaba pocas librerías adicionales.

---

### 1.3 Detalle Técnico de las 8 Optimizaciones

Se revisaron ocho aspectos del sistema y se realizaron cambios en el código para mejorar su funcionamiento. No fue necesario instalar nuevas librerías.

#### 1. Optimización de Consultas a la Base de Datos

**Diagnóstico:** La lista de pedidos obtenía todos los datos de cada registro, aunque la tabla solamente necesitaba mostrar información como el cliente, dirección, peso, fecha, prioridad y estado.

**Implementación:** Se modificó la consulta de Prisma para obtener solamente los campos necesarios. También se agregó un índice que permite buscar los pedidos por estado y ordenarlos por fecha.

**ANTES — `backend/src/repositories/prisma.repositories.js`**

```js
return (
  await prisma.pedido.findMany({
    where,
    include: conBultos,
    orderBy: { created_at: "desc" }
  })
).map(aPedido);
```

**DESPUÉS — `backend/src/repositories/prisma.repositories.js`**

```js
const columnasListadoPedido = {
  id: true,
  cliente_id: true,
  cliente_nombre: true,
  direccion: true,
  punto_referencia: true,
  peso_kg: true,
  volumen_m3: true,
  ventana_entrega_inicio: true,
  ventana_entrega_fin: true,
  prioridad: true,
  estado: true,
  created_at: true,
  bultos: {
    select: { cantidad: true }
  }
};
```

**DESPUÉS — `backend/prisma/schema.prisma`**

```prisma
@@index([estado, created_at(sort: Desc)])
```

**Resultado:** El tamaño de la lista de pedidos pasó de **13 558 a 4 773 bytes**, lo que representa una reducción del **64.8 %**.

#### 2. Paginación de Datos en Backend y Frontend (12 registros)

**Diagnóstico:** El sistema mostraba todos los pedidos en una sola lista. Esto podía afectar el rendimiento si la cantidad de registros aumentaba.

**Implementación:** Se agregó la paginación para mostrar los pedidos de 12 en 12. El usuario puede cambiar de página utilizando los botones Anterior y Siguiente.

**ANTES — `backend/src/schemas/esquemas.js`**

```js
export const filtroPedidos = z.object({
  estado: z.enum(ESTADOS_PEDIDO).optional(),
  prioridad: z.enum(PRIORIDADES).optional(),
  busqueda: z.string().optional(),
});
```

**DESPUÉS — `backend/src/schemas/esquemas.js`**

```js
export const filtroPedidos = z.object({
  estado: z.enum(ESTADOS_PEDIDO).optional(),
  prioridad: z.enum(PRIORIDADES).optional(),
  busqueda: z.string().optional(),
  pagina: z.coerce.number().int().min(1).optional(),
  limite: z.coerce.number().int().min(1).max(50).default(12),
});
```

**DESPUÉS — `backend/src/repositories/prisma.repositories.js`**

```js
const [filas, total] = await prisma.$transaction([
  prisma.pedido.findMany({
    where,
    select: columnasListadoPedido,
    orderBy: { created_at: "desc" },
    skip: (pagina - 1) * limite,
    take: limite,
  }),
  prisma.pedido.count({ where }),
]);

return {
  datos: filas.map(aPedido),
  paginacion: {
    pagina,
    limite,
    total,
    paginas: Math.max(1, Math.ceil(total / limite))
  },
};
```

**DESPUÉS — `frontend/components/PedidoLista.jsx`**

```jsx
const POR_PAGINA = 12;

const visibles = filtrados.slice(
  (pagina - 1) * POR_PAGINA,
  pagina * POR_PAGINA
);
```

La tabla también cuenta con los botones para cambiar de página.

**Prueba realizada con 19 pedidos:** La primera página muestra 12 pedidos y la segunda muestra los 7 restantes. También se verificó que no se acepten números de página menores a 1 ni límites mayores a 50.

#### 3. Optimización de Imágenes (WebP / AVIF)

**Diagnóstico:** El sistema no utiliza fotografías propias en sus pantallas. Los íconos se muestran mediante código y el mapa utiliza información de OpenStreetMap. Por eso, no se encontraron imágenes pesadas que necesitaran ser reemplazadas.

**Implementación:** Se configuró Next.js para permitir el uso de los formatos AVIF y WebP cuando se agreguen imágenes al proyecto.

**ANTES — `frontend/next.config.mjs`**

```js
const nextConfig = {
  /* config options here */
};
```

**DESPUÉS — `frontend/next.config.mjs`**

```js
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
};
```

Esta configuración permitirá utilizar imágenes de menor tamaño en caso de que posteriormente se agreguen logotipos o fotografías.

**Resultado:** Se dejó preparada la configuración para optimizar las imágenes futuras. Esta mejora no representa una reducción actual del peso de la página, porque el sistema no utiliza imágenes propias.

#### 4. Carga Diferida (Lazy Loading) y Code Splitting

**Diagnóstico:** Los seis módulos del sistema (Pedidos, Clientes, Vehículos, Conductores, Rutas y Sostenibilidad) se cargaban al ingresar, aunque el usuario solamente necesitara uno. Lighthouse identificó **84 KiB de JavaScript sin utilizar**.

**Implementación:** Se modificó la carga de los módulos utilizando `lazy` y `Suspense` de React. Ahora los módulos secundarios se cargan cuando el usuario los abre.

**ANTES — `frontend/components/App.jsx`**

```jsx
import { Clientes } from './modulos/Clientes.jsx'
import { Conductores } from './modulos/Conductores.jsx'
import { Pedidos } from './modulos/Pedidos.jsx'
import { Sostenibilidad } from './modulos/Sostenibilidad.jsx'
import { Rutas } from './modulos/Rutas.jsx'
import { Vehiculos } from './modulos/Vehiculos.jsx'
```

**DESPUÉS — `frontend/components/App.jsx`**

```jsx
import { lazy, Suspense } from 'react'
import { Pedidos } from './modulos/Pedidos.jsx'

const Clientes = lazy(() =>
  import('./modulos/Clientes.jsx').then(
    (m) => ({ default: m.Clientes })
  )
);

const Vehiculos = lazy(() =>
  import('./modulos/Vehiculos.jsx').then(
    (m) => ({ default: m.Vehiculos })
  )
);

const Conductores = lazy(() =>
  import('./modulos/Conductores.jsx').then(
    (m) => ({ default: m.Conductores })
  )
);

const Rutas = lazy(() =>
  import('./modulos/Rutas.jsx').then(
    (m) => ({ default: m.Rutas })
  )
);

const Sostenibilidad = lazy(() =>
  import('./modulos/Sostenibilidad.jsx').then(
    (m) => ({ default: m.Sostenibilidad })
  )
);
```

También se agregó `Suspense` para mostrar un indicador mientras se carga el módulo.

**Resultado:** Se evita descargar todos los módulos al inicio, lo que permite reducir el código que necesita cargar el navegador.

#### 5. Depuración y Eliminación de Dependencias Innecesarias

**Diagnóstico:** Se revisaron las librerías utilizadas en el proyecto. Se encontró que el archivo de datos de prueba utilizaba `dotenv` para leer las variables del archivo `.env`, aunque Node.js ya cuenta con una función para realizar esta tarea.

También se encontraron archivos que ya no se utilizaban: `frontend/public/icons.svg` y la carpeta antigua `frontend/dist`.

**Implementación:** Se reemplazó el uso de `dotenv` por la función disponible en Node.js.

**ANTES — `backend/prisma/seed.js`**

```js
import "dotenv/config";
```

**DESPUÉS — `backend/prisma/seed.js`**

```js
try {
  process.loadEnvFile();
} catch {
  // Se utilizan las variables del entorno disponibles.
}
```

Los archivos que ya no se utilizan quedaron identificados para su revisión y posible eliminación.

**Resultado:** Se evita utilizar una dependencia adicional para una tarea que Node.js puede realizar directamente. No se eliminaron archivos sin autorización.

#### 6. Reducción de Solicitudes HTTP

**Diagnóstico:** Al abrir el sistema se realizaban **12 solicitudes al servidor**. Esto ocurría porque se cargaban las seis listas y, además, el navegador realizaba solicitudes OPTIONS antes de algunas consultas. También se solicitaban las asignaciones de rutas desde el inicio.

**Implementación:** Se modificó el envío de la cabecera `Content-Type` para utilizarla solamente cuando se envían datos. También se cambió la carga de asignaciones para que se realice al ingresar al módulo Rutas.

**ANTES — `frontend/services/api.js`**

```js
headers: {
  'Content-Type': 'application/json'
},
```

**DESPUÉS — `frontend/services/api.js`**

```js
headers: opciones.body
  ? { 'Content-Type': 'application/json' }
  : {},
```

**DESPUÉS — `frontend/components/App.jsx`**

```js
const claves = Object.keys(CARGADORES)
  .filter((c) => c !== 'asignaciones');

useEffect(() => {
  if (modulo.id === 'rutas') {
    recargar('asignaciones');
  }
}, [modulo.id, recargar]);
```

**Resultado:** Las solicitudes al abrir el sistema pasan de **12 a 5**, lo que representa una reducción del **58.3 %**.

#### 7. Estrategia de Caché de Recursos

**Diagnóstico:** El servidor ya utilizaba ETag para identificar si una respuesta había cambiado, pero el navegador volvía a solicitar algunas listas aunque sus datos siguieran siendo los mismos.

**Implementación:** Se configuró la caché para evitar descargar nuevamente información que no ha cambiado.

También se realizaron estos ajustes:

- Los factores de tráfico se guardan durante un día.
- Las listas se guardan durante 30 segundos.
- Cuando se realiza una modificación, se limpia la información guardada para obtener los datos actualizados.

**ANTES — `backend/src/aplicacion.js`** (commit `8cbaf93`): las respuestas GET no indicaban ninguna política de caché.

```js
const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: origenesCors }));
app.use(express.json({ limit: "100kb" }));

app.get("/health", controladores.salud);
app.use("/api/v1", crearRouterApi(controladores));
```

**ANTES — `frontend/services/api.js`** (commit `8cbaf93`): cada lectura volvía a pedir los datos al servidor, aunque no hubieran cambiado, y enviaba `Content-Type` incluso en los GET.

```js
async function pedir(ruta, opciones = {}) {
  const controlador = new AbortController()
  const id = setTimeout(() => controlador.abort(), TIMEOUT_MS)

  try {
    const respuesta = await fetch(`${BASE}${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
      signal: controlador.signal,
    })

    if (!respuesta.ok) throw new Error(await detalleError(respuesta))
    if (respuesta.status === 204) return null
    return respuesta.json()
  } finally {
    clearTimeout(id)
  }
}
```

**DESPUÉS — `backend/src/aplicacion.js`**

```js
app.use("/api/v1", (req, res, next) => {
  if (req.method === "GET") {
    res.set(
      "Cache-Control",
      req.path.startsWith("/factores-trafico")
        ? "public, max-age=86400"
        : "private, no-cache"
    );
  }

  next();
});
```

**DESPUÉS — `frontend/services/api.js`**

```js
const CACHE_MS = 30_000;
const cache = new Map();

const lectura =
  (opciones.method ?? 'GET').toUpperCase() === 'GET';

if (!lectura) cache.clear();

const guardado = lectura ? cache.get(ruta) : null;

if (guardado && Date.now() - guardado.hora < CACHE_MS) {
  return guardado.datos;
}
```

**Prueba realizada:** Se repitió una consulta de pedidos y se obtuvo una respuesta **304**, lo que indica que la información no había cambiado y no era necesario volver a enviarla.

#### 8. Optimización de APIs (Compresión)

**Diagnóstico:** En la guía de referencia (MERN) esta optimización consiste en activar el middleware `compression` de Express. En EcoRuta Wanka el backend se publica en Vercel, que ya comprime con Brotli todas las respuestas cuando el navegador lo admite (`Accept-Encoding: br`). Por ello, la evidencia de esta área no es un cambio de código, sino la comparación medida de la misma respuesta **sin compresión (ANTES)** y **con compresión Brotli (DESPUÉS)**.

**Implementación:** No se instaló `compression` (principio YAGNI: la plataforma ya cumple esa función). Se mantiene el límite de 100 kB para los cuerpos JSON que recibe el servidor:

```js
// backend/src/aplicacion.js
app.use(express.json({ limit: "100kb" }));
```

**ANTES — respuesta sin compresión** (`Accept-Encoding: identity`):

```text
$ curl -s -o /dev/null -H "Accept-Encoding: identity" \
    -w "%{size_download} bytes\n" https://ecoruta-backend.vercel.app/api/v1/pedidos
13558 bytes
```

**DESPUÉS — respuesta con Brotli** (`Accept-Encoding: br, gzip`):

```text
$ curl -s -D - -o /dev/null -H "Accept-Encoding: br, gzip" \
    -w "%{size_download} bytes\n" https://ecoruta-backend.vercel.app/api/v1/pedidos
Content-Encoding: br
2877 bytes
```

**Resultados medidos el 13/11/2026 sobre la API publicada:**

| Endpoint | Sin compresión (ANTES) | Con Brotli (DESPUÉS) | Reducción |
|---|---:|---:|---:|
| `GET /api/v1/pedidos` (lista completa) | 13 558 bytes | 2 877 bytes | −78,8 % |
| `GET /api/v1/pedidos?pagina=1&limite=12` | 4 773 bytes | 1 244 bytes | −73,9 % |
| `GET /api/v1/rutas` | 14 219 bytes | 2 848 bytes | −80,0 % |

**Resultado:** todas las respuestas JSON viajan comprimidas con Brotli (cabecera `Content-Encoding: br`) y se transfieren entre 73,9 % y 80,0 % menos bytes, sin agregar dependencias. Si el sistema se publicara en un servidor propio sin compresión, se agregaría el middleware `compression` según la norma NB-05 del documento 02.

---

#### Mejora adicional: evitar que la tabla cambie de tamaño (CLS)

**Diagnóstico:** Lighthouse identificó que la tabla de pedidos era la principal causa del CLS de **0.043** (Evidencia 30). Mientras cargaban los datos, se mostraban cuatro filas de espera y después aparecían los pedidos, haciendo que la tabla cambiara de tamaño.

**Implementación:** Se modificó la cantidad de filas de espera para que coincida con los 12 pedidos que se muestran por página. También se reservó espacio para el texto que indica la cantidad de resultados.

**DESPUÉS — Componente de pedidos**

```jsx
<FilasCargando
  columnas={7}
  filas={POR_PAGINA}
/>
```

**DESPUÉS — CSS**

```css
.resultado-filtros {
  min-height: 2.6rem;
}
```

**Resultado:** La tabla mantiene un espacio más estable mientras carga la información. El valor de CLS de 0.02 se considera una proyección que debe verificarse nuevamente con Lighthouse después de publicar los cambios.

---

### 1.4 Tabla Comparativa de Métricas ANTES vs. DESPUÉS

En la siguiente tabla se comparan los resultados iniciales con los valores **medidos** después de publicar las optimizaciones (PR #13, commit `265aaec`).

- **ANTES:** auditoría de PageSpeed Insights (Lighthouse 13.6.0, escritorio) del 11/11/2026 sobre `https://ecoruta-frontend.vercel.app` (Evidencias 27 y 28).
- **DESPUÉS:** auditoría de Lighthouse CI 0.15.1 (Lighthouse 12.6.1, preset escritorio) ejecutada por el workflow `green-audit.yml` en GitHub Actions el 13/11/2026 sobre la misma URL (Evidencias 33 y 34). Ambas auditorías se ejecutan desde servidores en Estados Unidos.

| Métrica / Indicador | ANTES | DESPUÉS | Variación | Mejora (%) | Meta | Origen |
|---|---:|---:|---:|---:|---:|---|
| Rendimiento (Lighthouse) | 100/100 | **99/100** | −1 pt | −1,0 % | ≥ 90 | Medido |
| FCP | 0,2 s | **0,27 s** | +0,07 s | — | ≤ 1,0 s | Medido |
| LCP | 0,5 s | **0,86 s** | +0,36 s | — | ≤ 1,4 s | Medido |
| TBT | 0 ms | **0 ms** | 0 ms | Se mantiene | ≤ 85 ms | Medido |
| CLS | 0,043 | **0,0038** | −0,0392 | −91,2 % | ≤ 0,02 | Medido |
| Peso total de la página | 258 KiB | **229,2 KiB** | −28,8 KiB | −11,2 % | ≤ 1,1 MB | Medido |
| Solicitudes a la API al abrir | 12 | **5** | −7 | −58,3 % | Reducir | Medido |
| Tamaño de una lista de pedidos | 13 558 bytes | **4 773 bytes** | −8 785 bytes | −64,8 % | Reducir | Medido |
| Lista de pedidos comprimida | 2 934 bytes | **1 245 bytes** | −1 689 bytes | −57,6 % | Reducir | Medido |
| Pedidos mostrados por página | 19 | **12** | −7 | −36,8 % | 12 | Medido |
| Consulta sin cambios | Se volvía a enviar | **Respuesta 304** | — | — | Caché | Medido |
| CO₂ por visita (SWDM v4) | 0,0392 g | **0,0348 g** | −0,0044 g | −11,2 % | Reducir | Calculado con el peso medido |

**Fórmula para calcular la mejora:**

`Mejora (%) = (DESPUÉS - ANTES) / ANTES × 100`

En el caso del peso, tiempo y solicitudes, una reducción representa una mejora.

**Resultado:** todas las métricas medidas cumplen las metas de la rúbrica: puntaje de 99 (≥ 90), FCP de 0,27 s (≤ 1,0 s), LCP de 0,86 s (≤ 1,4 s), TBT de 0 ms (≤ 85 ms), CLS de 0,0038 (≤ 0,02) y peso de 229,2 KiB (≤ 1,1 MB). El workflow `green-audit.yml` verifica estos límites de forma automática en cada push y Pull Request.

**Lectura de las métricas de tiempo:** FCP y LCP variaron unas décimas de segundo, dentro del margen normal entre ejecuciones y entre PageSpeed Insights y Lighthouse CI, y siguen muy por debajo de sus metas. En EcoRuta Wanka el elemento LCP es una celda de la tabla de pedidos, por lo que su tiempo depende de la respuesta de la API y de la base de datos. Por eso, la mejora de las optimizaciones se aprecia con mayor claridad en las métricas que no dependen de la red: peso, JavaScript, solicitudes y CLS.

#### 1.4.1 Comparación local en condiciones idénticas

Para aislar el efecto del código, se compilaron las dos versiones con `next build` (ANTES = commit `8cbaf93`, DESPUÉS = versión optimizada), se sirvieron con `next start` y se conectaron al mismo backend publicado. Cada versión se auditó tres veces con Lighthouse 12.8.2 (escritorio) y se tomó la ejecución mediana.

| Métrica | ANTES | DESPUÉS | Mejora (%) |
|---|---:|---:|---:|
| Peso total transferido | 247,2 KiB | **224,1 KiB** | −9,3 % |
| JavaScript transferido | 175,9 KiB | **154,3 KiB** | −12,3 % |
| Solicitudes totales de la página | 23 | **16** | −30,4 % |
| Solicitudes a la API (incluidas OPTIONS) | 12 | **5** | −58,3 % |
| CLS | 0,043 | **0,004** | −90,7 % |

Los resultados locales confirman la tendencia de producción: menos datos, menos JavaScript, menos solicitudes y una tabla estable mientras carga.

#### 1.4.2 Comparación con los valores proyectados inicialmente

| Medida | Proyectado | Medido | Observación |
|---|---:|---:|---|
| Peso total | 174 KiB | 229,2 KiB | La proyección restaba los 84 KiB de "JavaScript sin utilizar"; gran parte de ese código pertenece a React/Next.js y al módulo inicial (Pedidos), que siguen siendo necesarios. La reducción real del JavaScript fue de 21,6 KiB. |
| CLS | 0,02 | 0,0038 | Mejor que lo proyectado: las filas de espera reservan el espacio final de la tabla. |
| Rendimiento | 100/100 | 99/100 | Se mantiene por encima de la meta. |
| CO₂ por visita | 0,0264 g | 0,0348 g | Se recalculó con el peso medido. |

---

### 1.5 Análisis de Impacto Ambiental y Eficiencia Energética

Para calcular las emisiones de CO₂ generadas por el uso de EcoRuta Wanka se utilizó el **Sustainable Web Design Model, versión 4 (SWDM v4)**.

Este modelo considera la energía que utilizan tres partes:

- Los servidores donde se almacena la información.
- Las redes que permiten enviar los datos por internet.
- Las computadoras y celulares que utilizan los usuarios.

**Valores utilizados en el cálculo:**

| Lugar donde se consume energía | Durante el uso (kWh/GB) | Fabricación de equipos (kWh/GB) | Total (kWh/GB) |
|---|---:|---:|---:|
| Servidores | 0.055 | 0.012 | 0.067 |
| Redes de internet | 0.059 | 0.013 | 0.072 |
| Computadoras y celulares | 0.080 | 0.081 | 0.161 |
| **Total** | **0.194** | **0.106** | **0.300** |

**Fórmula utilizada:**

```text
E (g CO₂e) = Datos descargados (GB) ×
             0.300 kWh/GB ×
             494 g CO₂e/kWh
```

Para el cálculo se utilizó un valor de 494 gramos de CO₂e por cada kWh de electricidad.

**Comparación de emisiones por visita:**

- **ANTES:** La página tenía un peso de 258 KiB, equivalente a aproximadamente 0.000264 GB. El resultado fue de **0.0392 g de CO₂e por visita**.
- **DESPUÉS:** Con el peso medido de 229,2 KiB (234 673 bytes, equivalente a aproximadamente 0.000235 GB), las emisiones son de **0.0348 g de CO₂e por visita**.

```text
ANTES:   0.000264 GB × 0.300 kWh/GB × 494 g CO₂e/kWh = 0.0392 g CO₂e
DESPUÉS: 0.000235 GB × 0.300 kWh/GB × 494 g CO₂e/kWh = 0.0348 g CO₂e
```

Esto representa una reducción del **11.2 %** por visita.

**Comparación con la meta de la rúbrica:**

Una página de 1.1 MB generaría aproximadamente 0.163 g de CO₂e por visita, utilizando los mismos valores del modelo.

Con los resultados obtenidos, EcoRuta Wanka genera aproximadamente 4,2 veces menos emisiones que ese límite antes de las mejoras y 4,7 veces menos después de las mejoras.

**Proyección anual (18 000 visitas):**

Para realizar una estimación anual se consideró el siguiente uso:

3 personas × 20 visitas diarias × 300 días de trabajo = **18 000 visitas al año**.

Este número es una estimación y deberá confirmarse con WankaLogística S.A.C.

| Escenario | Emisiones anuales |
|---|---:|
| Antes de las mejoras | 0.705 kg CO₂e |
| Después de las mejoras | 0.626 kg CO₂e |
| **Ahorro anual estimado** | **0.079 kg CO₂e** |

El ahorro es pequeño porque el sistema ya tenía un peso reducido y un buen rendimiento.

Además, es importante considerar que el mayor aporte ambiental de EcoRuta Wanka está en la organización de las rutas de reparto. Al reducir los kilómetros recorridos, también se puede reducir el consumo de combustible y las emisiones de los vehículos.

Por lo tanto, este informe evalúa las emisiones relacionadas con el uso de la página web, mientras que el módulo Sostenibilidad permite revisar el impacto de los vehículos de reparto.

---

### 1.6 Evidencias Visuales de Validación (Auditoría Lighthouse)

El estado inicial se auditó con PageSpeed Insights (Lighthouse 13.6.0) el 11/11/2026. El estado optimizado se auditó con Lighthouse CI desde el workflow `green-audit.yml` en GitHub Actions el 13/11/2026.

**Resultados iniciales (ANTES):**

```text
========================================
AUDITORÍA LIGHTHOUSE - ESTADO INICIAL
Fecha: 11/11/2026
========================================

ESCRITORIO:
Rendimiento:       100/100
Accesibilidad:    100/100
Recomendaciones:  100/100
SEO:              100/100

FCP:  0.2 s
LCP:  0.5 s
TBT:  0 ms
CLS:  0.043
Peso: 258 KiB

CELULAR:
Rendimiento: 100/100
FCP:  0.9 s
LCP:  0.9 s
TBT:  20 ms
CLS:  0.02
```

**Resultados posteriores (DESPUÉS):**

```text
========================================
AUDITORÍA LIGHTHOUSE CI - ESTADO OPTIMIZADO
Fecha: 13/11/2026 · GitHub Actions (green-audit.yml)
URL: https://ecoruta-frontend.vercel.app
========================================

ESCRITORIO:
Rendimiento:     99/100
Accesibilidad:  100/100

FCP:  0.27 s
LCP:  0.86 s
TBT:  0 ms
CLS:  0.0038
Índice de velocidad: 0.35 s
Peso: 229.2 KiB

Solicitudes a la API al abrir: 5
CO₂ por visita: 0.0348 g
Aserciones de la rúbrica: todas aprobadas
```

**Evidencia 27: Puntajes en escritorio**

Se muestran los resultados de rendimiento, accesibilidad, recomendaciones y SEO, todos con un puntaje de 100/100.

![Evidencia 27: PageSpeed escritorio puntajes](../../06%20Otros/evidencias/Evidencia%2027%20PageSpeed%20escritorio%20puntajes.jpg)

**Evidencia 28: Métricas en escritorio**

Se muestran los resultados de FCP 0.2 s, LCP 0.5 s, TBT 0 ms, CLS 0.043 e índice de velocidad de 0.6 s.

![Evidencia 28: PageSpeed escritorio métricas](../../06%20Otros/evidencias/Evidencia%2028%20PageSpeed%20escritorio%20metricas.jpg)

**Evidencia 29: Métricas en celular**

Se muestran los resultados de rendimiento 100/100, FCP 0.9 s, LCP 0.9 s, TBT 20 ms y CLS 0.02.

![Evidencia 29: PageSpeed celular métricas](../../06%20Otros/evidencias/Evidencia%2029%20PageSpeed%20celular%20metricas.jpg)

**Evidencia 30: Causa del cambio de diseño (CLS)**

Lighthouse identifica la tabla de pedidos (`tabla-envoltorio`) como el elemento que genera el CLS de 0.043. Este problema se tomó como referencia para realizar la mejora de las filas de carga.

![Evidencia 30: Causante del cambio de diseño](../../06%20Otros/evidencias/Evidencia%2030%20Causante%20del%20cambio%20de%20diseno.jpg)

**Evidencia 33: Workflow green-audit.yml aprobado en GitHub Actions**

El workflow ejecuta las 115 pruebas del backend y la auditoría de Lighthouse CI; ambos trabajos terminan en verde (duración total 1 min 28 s).

![Evidencia 33: Workflow green-audit en GitHub Actions](../../06%20Otros/evidencias/Evidencia%2033%20Workflow%20green-audit%20en%20GitHub%20Actions.jpg)

**Evidencia 34: Reporte de Lighthouse CI sobre la versión publicada (escritorio)**

Rendimiento 99/100, FCP 0.3 s, LCP 0.9 s, TBT 0 ms, CLS 0.004 e índice de velocidad 0.4 s (valores redondeados por el reporte).

![Evidencia 34: Lighthouse CI producción escritorio](../../06%20Otros/evidencias/Evidencia%2034%20Lighthouse%20CI%20produccion%20escritorio.jpg)

---

### 1.7 Conclusiones

1. EcoRuta Wanka ya contaba con un buen rendimiento (100/100 en Lighthouse) y, después de las optimizaciones, mantiene un puntaje de 99/100 con todas las métricas dentro de las metas de la rúbrica, verificado automáticamente por el workflow `green-audit.yml`.

2. Se revisaron ocho aspectos del sistema y se realizaron mejoras en las consultas a la base de datos, paginación, carga de módulos, solicitudes al servidor, caché y configuración de recursos.

3. Se identificó que la tabla de pedidos generaba cambios de posición mientras cargaba. Por ello, se modificaron las filas de espera para mantener un espacio más estable.

4. Las solicitudes al servidor al abrir el sistema se redujeron de 12 a 5, lo que representa una disminución del 58.3 %.

5. La lista de pedidos pasó de 13 558 a 4 773 bytes, reduciendo su tamaño en un 64.8 %.

6. La paginación de 12 pedidos por página permite organizar mejor la información y evita mostrar todos los registros al mismo tiempo.

7. Con el peso medido, el cálculo con SWDM v4 muestra que las emisiones pasaron de 0.0392 g a 0.0348 g de CO₂e por visita (−11.2 %), y el CLS bajó de 0.043 a 0.0038 (−91.2 %).

8. Finalmente, estas mejoras ayudan a que EcoRuta Wanka utilice menos recursos al funcionar. Sin embargo, el principal aporte ambiental del proyecto sigue siendo la optimización de las rutas de reparto, ya que permite reducir los kilómetros recorridos y el combustible utilizado por los vehículos.

---

[Volver al README principal](../../../README.md)
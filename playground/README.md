# Playground · galería + generador de temas

App de desarrollo del paquete. **No se publica** (excluida en `.npmignore`).

```bash
cd playground && pnpm install && pnpm dev    # http://localhost:8106
```

## Para qué sirve

1. **Ver los componentes funcionando** — incluidos los que dependen de un backend.
2. **Generar un tema**: mover los controles del panel y copiar el SCSS resultante
   al `app.scss` del consumidor. Los cambios se aplican **en runtime**, sin
   recompilar Sass, porque los componentes derivan de los tokens `--x-*`
   (ver `_tokens.scss`). Con variables Sass esto sería imposible.

   El panel tiene **dos niveles**:

   | Nivel | Alcance | Sale como |
   |---|---|---|
   | **Global** | los ~15 tokens raíz: cambian todos los componentes que derivan de ellos | `:root { --x-brand: … }` |
   | **Por componente** | las 127 variables de cada componente, y las de **cada variante** (`.x-badge-pill`, `.x-toggle-sm`…) por separado | `.x-badge-pill { --x-badge-font-size: … }` |

   Los dos se combinan en el mismo SCSS y son independientes: tocar
   `--x-badge-border-radius` no mueve el botón ni la card.

### El catálogo se genera solo

Los 17 componentes, sus 127 variables y sus 28 variantes **no están escritos a
mano**: los extrae `scripts/build-catalog.mjs` de los `.scss`/`.vue` del paquete,
resolviendo además las interpolaciones `#{$x-…}` contra `_variables.scss` para
saber si un control debe ser color, slider o texto.

```bash
pnpm catalog   # tras agregar un componente o una variable --x-*
```

Una variable nueva aparece en el panel sin tocar código del playground.
3. **Ver qué falta**: al montar todo junto quedan a la vista los huecos
   (componentes sin slots, props inconsistentes, acoplamientos al consumidor).

El SCSS generado es un **diff**: solo incluye los tokens que difieren del default,
no un volcado de los 25.

## Componentes con backend: mock del contrato

`XTableServer`, `XcTable`, `XSelect` y otros piden datos a un backend Laravel.
El playground **no** usa JSON estático (pintaría tablas muertas, sin paginación
ni filtrado real) ni una API real (exigiría Laravel + auth y dejaría de ser
standalone). Usa un **mock que implementa el contrato** (`src/mock/api.js`) y
calcula paginación, filtro y orden en JS.

La inyección ya existía en el paquete, no hubo que forzarla:

```js
app.config.globalProperties.$api = createMockApi()   // lo leen 8 componentes
useXcTable(resource, onLoaded, createMockApi())      // lo recibe por parámetro
```

Ventaja extra: el mock **documenta el contrato de forma ejecutable** (hasta ahora
solo estaba en prosa) y permite forzar estados que con un backend real cuestan.
Los chips del panel cambian entre:

| Escenario | Qué prueba |
|---|---|
| `ok` | 120 registros, operación normal |
| `empty` | empty state |
| `error` | error state (500) |
| `slow` | respuesta de 2,5 s — para ver los loaders |
| `huge` | 10.000 filas |

## Acoplamientos del paquete que este playground expone

Cosas que un consumidor **debe** proveer y que hoy no están documentadas fuera de aquí:

- **`$api` global** — la usan `XSelect`, `XSelectLocation`, `XcTable`,
  `XDialogAction`, `XInputSearchPerson`, `XCellColumnRenderer`, `XTableServer`,
  `XPdfViewerBackup`.
- **Alias `stores/data.js`** — `XTableServer` lo importa asumiendo el alias del
  consumidor, y solo usa `dataStore.appName`. Candidato claro a volverse una prop
  con default y eliminar la dependencia. El stub está en `src/stores/data.js`.
- **`src/css/quasar.variables.scss`** — su sola presencia activa la inyección de
  `quasar/src/css/variables.sass`; sin él no existe `$primary` ni ninguna variable
  de Quasar.

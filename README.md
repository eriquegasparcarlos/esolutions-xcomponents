# @esolutions/x-components

Librería de componentes Vue 3 + Quasar 2 del ecosistema esolutions (design system `x-*`). Cada componente vive en su carpeta (`XInput/`, `XDialog/`, `XTableServer/`, …) con su propio `README.md`.

## Instalación

Se instala **por tag de GitHub** (no está en npm). En el `package.json` del consumidor:

```json
"dependencies": {
  "@esolutions/x-components": "github:eriquegasparcarlos/esolutions-xcomponents#v2.4.54"
}
```

```bash
pnpm install
```

Los imports son por ruta directa al `.vue` (no hay barrel/build previo — el consumidor compila los SFC con su propio Vite/Quasar):

```js
import XInput from '@esolutions/x-components/XInput/XInput.vue'
```

## Configuración REQUERIDA del consumidor (Vite / Quasar)

Como los `.vue` se compilan en el proyecto consumidor, hay configuración que **debe** existir en su `quasar.config.js` → `extendViteConf`. Si falta, fallará en dev y/o build:

### 1. Drag & drop: `vue-draggable-plus` (desde v2.5.0)

Desde **v2.5.0**, `XDnd` y `PrintTemplates/BlockTree` usan **`vue-draggable-plus`** (ESM nativo, mantenido) — no requiere configuración especial de Vite.

**Solo para tags ≤ v2.4.x** (usaban `vuedraggable`, UMD/CommonJS abandonado): el consumidor DEBE agregar en `quasar.config.js` → `extendViteConf`:

```js
viteConf.optimizeDeps = viteConf.optimizeDeps || {}
viteConf.optimizeDeps.include = [...(viteConf.optimizeDeps.include || []), 'vuedraggable']
```

Sin eso, al invalidarse la caché `node_modules/.vite` el dev server revienta con `does not provide an export named 'default'` en todos los listados (`XDnd` → `XTableServer`).

### 2. Estilos (SCSS) — **obligatorio, si no los componentes salen sin estilo**

Los `.vue` traen el markup, pero el CSS de los componentes vive en `.scss` aparte.
Si no lo importás, todo **renderiza pero sin layout ni tipografía** (síntoma típico:
el título de `XDialog` aparece como texto suelto pegado al botón de cerrar).

En el `app.scss` (o el entry CSS) del consumidor:

```scss
// Todos los componentes
@import '@esolutions/x-components/index';
```

Desde **v2.8.0** cada `.scss` es **auto-suficiente**, así que también se puede
importar solo lo que se usa (menos CSS muerto: el paquete completo son ~46 KB):

```scss
@import '@esolutions/x-components/XDialog/XDialog';
@import '@esolutions/x-components/XInput/XInput';
```

### 3. Tokens de tema (desde v2.9.0) — la forma recomendada de re-tematizar

Las ~129 variables `--x-*` de los componentes derivan ahora de **~25 tokens raíz**
(`_tokens.scss`, emitido en `:root` por `index.scss`). Cambiar un token re-tematiza
todos los componentes que lo usan, **en runtime y sin recompilar Sass**:

```scss
// app.scss del consumidor — después del @import del paquete
:root {
  --x-brand: #0e8f5e;   // toggle, checkbox, datepicker, file…
  --x-radius: 10px;     // input, select, botón, card, checkbox…
  --x-radius-md: 10px;  // diálogos
  --x-radius-lg: 14px;  // menús desplegables
}
```

**Tokens disponibles**

| Grupo | Tokens |
|---|---|
| Marca | `--x-brand`, `--x-brand-contrast` |
| Escala neutral | `--x-white`, `--x-gray-50` … `--x-gray-900` |
| Semánticos | `--x-success`, `--x-danger`, `--x-warning`, `--x-info` |
| Roles | `--x-surface`, `--x-surface-hover`, `--x-border`, `--x-text`, `--x-text-body`, `--x-text-muted` |
| Forma | `--x-radius` (4px), `--x-radius-md` (8px), `--x-radius-lg` (12px) |
| Movimiento | `--x-duration`, `--x-ease` |

Los **roles** son la capa que conviene tocar para un cambio de fondo: `_tokens.scss`
los reasigna en `.body--dark`, así que un componente que derive de roles obtiene el
dark mode sin escribir un solo bloque `.body--dark` propio.

Cada componente usa `var(--x-token, <valor histórico>)`, con fallback. Por eso un
`.scss` importado suelto (sin `index.scss`, que es quien emite el `:root`) sigue
renderizando exactamente igual.

### 4. Tema SCSS (opcional desde v2.8.0)

Para adoptar la identidad visual de un tema, en `src/css/quasar.variables.scss`:

```scss
@import '@esolutions/x-components/themes/shadcn.variables';
```

(Existen `shadcn` y `tailadmin`, cada uno con `.variables.scss` y `.overrides.scss`.)

**Ya no es obligatorio.** Hasta v2.7.x, un consumidor con identidad visual propia
(sin tema) o sin `src/css/quasar.variables.scss` rompía el build con
`Undefined variable: $primary` / `$table-th-font-color` / `$body-font-color`,
porque el paquete consumía variables que nadie le daba — y podía romperlo
**un componente que ni siquiera usa**, ya que `index.scss` compila todos los `.scss`.

Desde v2.8.0, `_defaults.scss` define con `!default` todo lo que el paquete
consume: la paleta de Quasar (con sus valores oficiales) y las variables propias
del paquete (`$body-font-color`, `$table-*`). El paquete compila solo; el tema y
las variables del consumidor siguen mandando cuando existen.

> Si querés controlar la paleta sin adoptar un tema, definí las variables de
> Quasar en tu `src/css/quasar.variables.scss` como siempre. **Ojo**: la sola
> existencia de ese archivo es lo que activa el plugin de Quasar que inyecta
> `quasar/src/css/variables.sass`; sin él, ninguna variable `$primary` existe.

## Gotchas de API (leer el README del componente antes de usarlo)

Cada componente tiene su `README.md` con props, eventos, slots y ejemplos.
Estos son los tropiezos más frecuentes:

| Componente | Trampa | Correcto |
|---|---|---|
| `XSelect` | Pasarle un array de **strings**: el desplegable abre con las filas **en blanco**, sin ningún error en consola. Internamente mapea `opt[optionValue]` / `opt[optionLabel]`, que sobre un string dan `undefined`. | Objetos. Por defecto lee `id` como valor y `name` como label; para otra forma, `option-value` / `option-label`. |
| `XDropdownMenu` | Poner el disparador en `#trigger` sin más: el menú **nunca abre**. | El slot expone `open`: `<template #trigger="{ open }">` y `@click="open"` en el disparador. |
| `XDropdownItem` | Marcar el ítem destructivo con una clase. | Prop `variant="danger"`. |
| `XBanner` | `message` + `type="info"`. | `label` + `type="information"` (válidos: `success`, `error`, `warning`, `information`). |
| `XTableServer` | Esperar que funcione suelto. | Requiere `$api` global, el alias `stores/data.js` del consumidor y un backend que cumpla el contrato (ver `playground/src/mock/api.js`). |
| `XTableServer` (filtros) | Que el backend mande `filter.options` como `{label, value}`: el filtro sale **con las opciones en blanco**. Los pasa a un `XSelect` **sin** `option-value`/`option-label`, así que valen los defaults. | El backend debe mandarlas como `{id, name}`. |

> El `playground/` monta todo junto y es la referencia viva de uso correcto.

## Actualizar de versión en un consumidor

1. Cambiar el tag en `package.json` (`#v2.4.53` → `#v2.4.54`).
2. `pnpm install`.
3. **Reiniciar el dev server** (`quasar dev`) — obligatorio: al cambiar el tag, pnpm reemplaza el directorio hash interno (`node_modules/.pnpm/@esolutions+x-components@ht_…`) y el server corriendo mantiene rutas resueltas contra el hash viejo (errores `ENOENT` de archivos que sí existen).
4. Si aparecen errores raros de módulos/CSS tras el upgrade: limpiar caché y relevantar —

```bash
rm -rf node_modules/.vite .quasar
```

## Publicar una versión nueva

1. Bump de `version` en `package.json`.
2. Commit + tag `vX.Y.Z` + push con tags:

```bash
git tag vX.Y.Z && git push origin main --tags
```

### Qué se publica (desde v2.8.0)

El paquete usa **`.npmignore`** (blacklist): **todo viaja por defecto** y solo se
excluye lo interno (`PACKAGES.md`, `version.json`). **Un componente nuevo no
requiere ningún registro** — se publica solo.

Hasta v2.7.x había un array `files` en `package.json` (whitelist de 59 entradas)
que había que actualizar a mano por cada componente. Olvidarlo publicaba un tag
**sin** ese componente: en v2.7.0 pasó con `XReportView`/`XcTable`, y el
consumidor instalaba una versión a la que simplemente le faltaban las carpetas,
con un error que no apuntaba a la causa. La whitelist tampoco excluía nada útil,
así que era solo riesgo.

Verificar qué va a viajar antes de taggear:

```bash
npm pack --dry-run
```

## Convención de documentación

Cada componente debe tener `README.md` propio (descripción, props, eventos, slots, ejemplos). Si usas uno que no lo tiene, generárselo siguiendo el patrón de los existentes.

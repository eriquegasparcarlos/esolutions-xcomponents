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

### 1. `optimizeDeps.include: ['vuedraggable']` — OBLIGATORIO

`XDnd` (usado por `XTableServer`, o sea por **todos los listados**) importa `vuedraggable`, que solo publica build **UMD/CommonJS**. Vite solo lo convierte a ESM en el pre-bundling, y como el import está dentro de este paquete, el escaneo inicial de Vite **no lo detecta**. Sin esto, el dev server lo sirve tal cual y revienta con:

```
SyntaxError: The requested module '...vuedraggable.umd.js' does not provide an export named 'default'
```

Traicionero porque a veces "funciona" gracias a la caché `node_modules/.vite` — y explota recién al limpiarla o al actualizar el tag del paquete (cambia el hash en `.pnpm` y la caché se invalida).

```js
// quasar.config.js → build.extendViteConf(viteConf)
viteConf.optimizeDeps = viteConf.optimizeDeps || {}
viteConf.optimizeDeps.include = [...(viteConf.optimizeDeps.include || []), 'vuedraggable']
```

### 2. Tema SCSS

`src/css/quasar.variables.scss` del consumidor debe importar las variables del tema:

```scss
@import '@esolutions/x-components/themes/shadcn.variables';
```

(Existen `shadcn` y `tailadmin`, cada uno con `.variables.scss` y `.overrides.scss`.)

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

## Convención de documentación

Cada componente debe tener `README.md` propio (descripción, props, eventos, slots, ejemplos). Si usas uno que no lo tiene, generárselo siguiendo el patrón de los existentes.

# Iconos

Los componentes de x-components no nombran un icono concreto: piden un **rol**
(`delete`, `save`, `close`) y este modulo decide con que se dibuja.

```vue
<script setup>
import { ic } from '@esolutions/x-components/icons'
</script>

<template>
  <q-icon :name="ic('delete')" />
  <q-btn :icon="ic('save')" />
</template>
```

## Por que roles y no nombres de iconos

El rol dice la intencion, no el dibujo. El dia que el icono de borrar deje de
ser un tacho se cambia **una linea** de `roles.json` y cambian los 25
componentes del paquete y todos los proyectos que lo consumen. Con el nombre
del dibujo (`trash`) habria que buscar y reemplazar en todos lados.

Tambien deshace ambiguedades que traia FontAwesome: `xmark` era a la vez cerrar
un dialogo, quitar una imagen y el toast de error. Hoy son `close`, `remove` y
`error`, y se pueden separar visualmente sin tocar ningun componente.

## Los tres idiomas que entiende

`resolveIcon()` (alias: `ic`) acepta las tres formas, y todas dan el mismo
resultado:

| Entrada | Que es |
|---|---|
| `delete` | el rol — la API publica |
| `trash-can` | el nombre del dibujo (ver `aliases.js`) |
| `fal fa-trash-can` | FontAwesome, en cualquiera de sus dos sintaxis |

Esto es lo que permite que un proyecto actualice el paquete **sin cambiar
nada**: los strings de FontAwesome que ya tiene escritos en el codigo, y los
que tiene guardados en base de datos, siguen resolviendo.

Lo que no reconoce lo deja pasar tal cual (`sym_o_delete`, `mdi-delete`,
`img:/x.svg`, un path SVG ya armado), asi que se puede mezclar con cualquier
otro set.

Y un nombre que no existe en ningun idioma cae en un icono generico en vez de
romper la pantalla: el icono lo elige a veces el backend
(`XDialogAction`, los botones de `esolutions/datatable`), y un nombre nuevo
alla no debe dejar un hueco aca.

## Cambiar los iconos en un proyecto

Los defaults viajan dentro del paquete, asi que funciona sin instalar nada. Un
proyecto que quiera otro set lo declara una vez, en un boot file, antes de
montar la app:

```js
import { setXIcons } from '@esolutions/x-components/icons'

// un proyecto que si tiene FontAwesome Pro
setXIcons({
  delete: 'fal fa-trash-can',
  save:   'fal fa-floppy-disk'
})

// o Material Symbols, que Quasar ya trae
setXIcons({ delete: 'sym_o_delete' })
```

El override se pasa tal cual a `QIcon`, asi que sirve para cualquier set. Solo
se reemplazan los roles que se listen; el resto queda en su default.

`resetXIcons()` los devuelve al default (util en tests y en el playground).

## De donde salen los dibujos

De [Lucide](https://lucide.dev) v1.32.0, **licencia ISC**: uso comercial libre,
sin atribucion en el producto. Se eligio porque su trazo fino es el equivalente
visual de `fa-light`, que era 43 de los 50 iconos que el paquete traia antes.

No se pueden usar los paths de FontAwesome Pro: son el mismo archivo fuente que
antes vivia en `vendor/`, y redistribuirlos en un repo publico es exactamente
lo que la licencia no permite.

Los iconos viajan como paths SVG dentro del propio paquete (~8 KB), no como
webfonts (eran 7.3 MB). No hace falta token, ni CDN, ni red.

## Agregar o cambiar un icono

1. Busca el nombre en https://lucide.dev
2. Agregalo a `roles.json` como `"rol": "nombre-lucide"`
3. Regenera:

```bash
node icons/generate.mjs > icons/paths.js
```

`paths.js` es **generado**: no editarlo a mano. El generador convierte a `path`
los `circle`, `line`, `rect` y `polyline` de Lucide, porque `QIcon` solo emite
`<path>`.

Necesita el paquete `lucide` en disco; por defecto lo busca en
`F:/laragon/www/pdfme/node_modules/lucide/dist/esm/icons`, y se puede apuntar a
otra copia con la variable de entorno `LUCIDE_ICONS`.

Si el icono es de uso interno de un solo componente, conviene igual darle un
rol: mantiene la superficie del paquete en un unico lugar.

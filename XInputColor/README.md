# XInputColor

Selector de color sobre un `XInput` readonly: muestra un punto con el color actual (prepend), el código hex (opcional) y un icono cuentagotas (append) que abre el `q-color` de Quasar en un popup. Modo alternativo `as-button`: un botón pintado del color elegido.

## Uso

```vue
<script setup>
import XInputColor from '@esolutions/x-components/XInputColor/XInputColor.vue'
import { ref } from 'vue'

const color = ref('#1976d2')
</script>

<template>
  <!-- Input con preview + código -->
  <x-input-color label="Color" v-model="color" />

  <!-- Sin código hex visible -->
  <x-input-color label="Color" v-model="color" :show-code="false" />

  <!-- Como botón pintado del color -->
  <x-input-color v-model="color" as-button />

  <!-- Los attrs extra van directo al q-color interno -->
  <x-input-color label="Color" v-model="color" no-header-tabs default-view="palette" />
</template>
```

## Props

| Prop          | Tipo      | Default | Descripción                                           |
|---------------|-----------|---------|-------------------------------------------------------|
| `modelValue`  | `String`  | `''`    | Color en hex (v-model)                                |
| `label`       | `String`  | `''`    | Label del input                                       |
| `customClass` | `String`  | `''`    | Clases extra para el input                            |
| `showCode`    | `Boolean` | `true`  | Muestra el código hex en el input / botón             |
| `asButton`    | `Boolean` | `false` | Renderiza un botón pintado del color en vez del input |
| `dense`       | `Boolean` | `true`  | Input denso                                           |

## Eventos

| Evento              | Payload  | Descripción           |
|---------------------|----------|-----------------------|
| `update:modelValue` | `String` | Color hex seleccionado |

## Notas

- Los **attrs no declarados** (`no-header-tabs`, `default-view`, `format-model`, ...) se pasan al `q-color` interno vía `v-bind` — cualquier prop de [QColor](https://quasar.dev/vue-components/color-picker) funciona.
- En modo `as-button` el texto del botón calcula su contraste (negro/blanco) por luminancia del color de fondo.
- El input es **readonly**: el color solo se cambia desde el popup (evita hex inválidos tipeados a mano).
- `modelValue` espera `String`; si el origen puede ser `null`, pasar `form.color || ''`.

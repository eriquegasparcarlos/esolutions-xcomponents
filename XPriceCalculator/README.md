
# PriceCalculator.vue

Un componente de calculadora numérica para ingresar precios de manera sencilla y táctil, ideal para apps de tablet, POS o cualquier interfaz que requiera ingreso rápido de montos.

## Características

- Teclado numérico tipo calculadora, optimizado para pantallas táctiles.
- Muestra el valor actual en un input grande.
- Solo permite un punto decimal.
- Botón de retroceso y botón para limpiar todo.
- Sin dependencias externas, puro Vue 3.

## Uso

1. **Copia el archivo `PriceCalculator.vue` a tu proyecto Vue 3.**
2. **Importa y usa el componente:**

```vue
<script setup>
import PriceCalculator from './PriceCalculator.vue'
import { ref } from 'vue'

const precio = ref('')
</script>

<template>
  <PriceCalculator v-model="precio" placeholder="Ingrese el precio" />
  <p>Precio: {{ precio }}</p>
</template>
```

## Props

| Prop         | Tipo             | Default             | Descripción                     |
|--------------|------------------|---------------------|---------------------------------|
| modelValue   | Number, String   | `''`                | El valor actual (usado por v-model) |
| placeholder  | String           | `"Ingrese el precio"` | Texto de ayuda en el input         |

## Personalización de estilos

Puedes sobrescribir los estilos con tu propio archivo SCSS:

```scss
// price-calculator.scss
@import './price-calculator.scss';
```

O modificar las clases CSS según tu diseño.

## Ejemplo de integración

```vue
<template>
  <PriceCalculator v-model="monto" placeholder="Monto a cobrar" />
</template>

<script setup>
import { ref } from 'vue'
import PriceCalculator from './PriceCalculator.vue'

const monto = ref('')
</script>
```

---

**Licencia:** MIT  
Desarrollado por [Tu Nombre o Empresa]

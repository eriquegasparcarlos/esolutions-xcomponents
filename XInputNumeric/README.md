# XInputNumeric

Input numérico que envuelve `QInput type="number"` de Quasar, ocultando las flechas nativas del navegador. Es el componente estándar para **cantidades y precios/montos** (no usar `XInput` para números). Soporta prefijo/sufijo (moneda, unidad) y un modo stepper con botones −/+ para cantidades.

## Instalacion

```vue
<script setup>
import XInputNumeric from '@esolutions/x-components/XInputNumeric/XInputNumeric.vue'
</script>
```

## Props

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `modelValue` | `Number \| String \| null` | — | Valor del input (v-model). Siempre emite `Number` o `null` (vacío/no numérico → `null`) |
| `isClassic` | `Boolean` | `false` | Usa label flotante dentro del input |
| `dense` | `Boolean` | `true` | Modo compacto |
| `error` | `String` | `null` | Mensaje de error a mostrar |
| `inputDebounce` | `Number \| String` | `0` | Debounce del `update:modelValue` |
| `autofocus` | `Boolean` | `false` | Auto-focus al montar |
| `isRequired` | `Boolean` | `false` | Muestra asterisco de requerido |
| `prefix` | `String` | `null` | Texto fijo a la izquierda dentro del input (ej. `"S/"`, `"$"`) |
| `suffix` | `String` | `null` | Texto fijo a la derecha dentro del input (ej. `"%"`, `"kg"`) |
| `controls` | `Boolean` | `false` | Modo stepper: botones −/+ a los lados (uso típico: cantidades) |
| `min` | `Number \| String` | `null` | Mínimo. Con `controls`, deshabilita el botón − en el límite y corrige en blur |
| `max` | `Number \| String` | `null` | Máximo. Con `controls`, deshabilita el botón + en el límite y corrige en blur |
| `step` | `Number \| String` | `1` | Incremento de los botones −/+ |
| `help` | `String` | `''` | Texto de ayuda: ícono "?" con tooltip (v2.12.0) |
| `helpPosition` | `String` | `'append'` | Dónde va el "?": `append` (dentro del campo) o `label` (v2.12.0) |

Ademas, soporta los atributos de `QInput` como `label`, `placeholder`, `disable`, `readonly`, etc. (el `type` está fijado a `number`).

### Ayuda contextual (v2.12.0)

Los campos numéricos son justo donde más falta hace una aclaración —el precio,
el factor de una presentación, una cantidad mínima—, así que `help` funciona
igual que en [XInput](../XInput/README.md):

```vue
<XInputNumeric v-model="form.precio" label="Precio" prefix="S/"
               help="El precio ya incluye IGV." />
<XInputNumeric v-model="pr.factor" label="Factor" controls min="1"
               help="Cuántas unidades de stock descuenta cada paquete vendido." />
```

Con `controls`, el "?" se coloca después del botón +.

## Eventos

| Evento | Payload | Descripcion |
|--------|---------|-------------|
| `update:modelValue` | `Number \| null` | Emitido al cambiar el valor (ya convertido a número) |
| `input` | `Event` | Evento nativo de input |
| `change` | `Event` | Evento nativo de change |

## Slots

| Slot | Descripcion |
|--------|-------------|
| `prepend` | Contenido al inicio del campo. Se renderiza ANTES de los controles propios (`controls`) y del `prefix`, sin reemplazarlos. Util para inyectar un selector (p. ej. `%` \| `S/`) dentro del input. |
| `append` | Contenido al final del campo. Se renderiza DESPUES del `suffix` y de los controles propios. |

```vue
<!-- Selector %|moneda dentro del propio campo de descuento -->
<XInputNumeric v-model="row.value" outlined>
  <template #prepend>
    <XButton flat size="sm" label="%" @click="row.type = 'percentage'" />
    <XButton flat size="sm" label="S/" @click="row.type = 'amount'" />
  </template>
  <template #append>
    <span>= S/ {{ amount.toFixed(2) }}</span>
  </template>
</XInputNumeric>
```

> Antes de v2.6.5 estos slots se descartaban en silencio: el componente definia sus
> propios `#prepend`/`#append` sobre el `q-input` interno y no reenviaba los del
> padre, asi que el contenido inyectado nunca se renderizaba.

## Metodos expuestos (defineExpose)

| Metodo | Descripcion |
|--------|-------------|
| `focus()` | Enfoca el input |
| `select()` | Selecciona el contenido |
| `focusAndSelect()` | Enfoca y selecciona (útil en grillas POS para sobreescribir rápido) |

## Uso Basico

```vue
<XInputNumeric v-model="form.price" label="Precio" prefix="S/" min="0" />
```

## Ejemplos

### Monto/precio con moneda

La moneda va como `prefix`, no en el label:

```vue
<XInputNumeric v-model="form.opening_amount" label="Apertura" prefix="S/" min="0" />
<XInputNumeric v-model="form.opening_amount_usd" label="Apertura" prefix="$" min="0" />
```

### Cantidad con stepper (controls)

Para cantidades, agregar `controls`. El valor se acota a `[min, max]`: los botones se deshabilitan en el límite y un valor escrito fuera de rango se corrige al salir del campo (blur) — evita cantidades en 0/vacío:

```vue
<XInputNumeric v-model="row.quantity" controls min="1" :max="row.stock" />
```

### Paso decimal

```vue
<XInputNumeric v-model="form.weight" label="Peso" suffix="kg" controls min="0" step="0.5" />
```

### Porcentaje con sufijo

```vue
<XInputNumeric v-model="form.discount_percent" label="Descuento" suffix="%" min="0" max="100" />
```

### Con error de validacion

```vue
<XInputNumeric v-model="form.amount" label="Importe" prefix="S/" :error="errors.amount" />
```

## Caracteristicas Especiales

### Sin flechas nativas

Las flechas del `input[type=number]` del navegador se ocultan por CSS (Webkit y Firefox); el incremento visual solo existe en modo `controls`.

### Emision siempre numerica

`update:modelValue` nunca emite strings: convierte con `Number()` y emite `null` si el campo queda vacío o no es un número finito. El backend recibe números sin castear.

### Modo controls

- Botón − gris a la izquierda, botón + en color primario a la derecha.
- El valor se centra entre ambos botones.
- `prefix`/`suffix` conviven con los botones (quedan entre el botón y el valor).

## Cuando usarlo

| Campo | Componente |
|------|------------|
| Precio, monto, importe | `XInputNumeric` con `prefix` de moneda y `min="0"` |
| Cantidad | `XInputNumeric` con `controls` (+ `min`/`max` si aplica) |
| Porcentaje | `XInputNumeric` con `suffix="%"` y `min`/`max` |
| Texto, código, serie | `XInput` |

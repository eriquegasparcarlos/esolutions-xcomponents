<script setup>
import { computed, useAttrs, useSlots } from 'vue'

defineOptions({
  name: 'XBanner',
  inheritAttrs: false // control manual de atributos externos
})

// --- Props ---
const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'success' // opciones válidas: success, error, warning, information
  },
  /**
   * Colores propios, para el caso puntual que no entra en ningún `type`. Pisan al
   * mapa sin tocar el paquete: antes, cambiar el color de UN banner obligaba a
   * publicar una versión nueva de la librería.
   *
   * Aceptan las dos formas:
   *   · nombre de la paleta de Quasar — 'orange-2', 'grey-3'  → clase `bg-*`/`text-*`
   *   · color CSS — '#FFE0B2', 'rgb(...)', 'var(--x-brand)'   → estilo inline
   *
   * La distinción es necesaria: los helpers `bg-*`/`text-*` de Quasar son clases
   * generadas para SU paleta, no aceptan un hexadecimal.
   */
  bgColor: {
    type: String,
    default: null
  },
  textColor: {
    type: String,
    default: null
  }
})

const attrs = useAttrs()

// --- Mapa de colores por tipo de banner ---
//
// Todos siguen el mismo patrón: fondo claro y texto oscuro. `warning` era la
// excepción — `yellow-7` (#FBC02D) es un amarillo de señalización, mucho más
// saturado que el `red-2` de un error, que es el estado más grave. Un aviso no
// puede gritar más que un error.
const colorMap = {
  success:     { text: 'green-10', bg: 'green-11' },
  error:       { text: 'red-10',   bg: 'red-2' },
  information: { text: 'blue-10',  bg: 'blue-3' },
  warning:     { text: 'orange-10', bg: 'orange-2' }
}

/** Un color CSS va por `style`; un nombre de la paleta de Quasar, por clase. */
const isCssColor = (value) => /^(#|rgb|hsl|var\()/i.test(String(value ?? ''))

const defaults = computed(() => colorMap[props.type] || colorMap.success)

const bg = computed(() => props.bgColor ?? defaults.value.bg)
const text = computed(() => props.textColor ?? defaults.value.text)

const colorClasses = computed(() => [
  isCssColor(bg.value) ? null : `bg-${bg.value}`,
  isCssColor(text.value) ? null : `text-${text.value}`
].filter(Boolean))

const colorStyles = computed(() => ({
  ...(isCssColor(bg.value) ? { backgroundColor: bg.value } : {}),
  ...(isCssColor(text.value) ? { color: text.value } : {})
}))

// QBanner tiene slots con nombre (#avatar para el ícono, #action para los botones del
// pie) que antes se perdían: el template solo renderizaba label + slot por defecto, así
// que un banner con ícono migrado desde q-banner quedaba sin ícono y sin acciones, sin
// avisar. Se reenvían todos salvo el default, que ya se renderiza abajo junto al label.
const slots = useSlots()
const passthroughSlots = computed(() =>
  Object.keys(slots).filter((name) => name !== 'default')
)
</script>

<template>
  <q-banner
    v-bind="attrs"
    class="x-banner"
    :class="colorClasses"
    :style="colorStyles"
  >
    <span v-if="props.label">{{ props.label }}</span>
    <slot />

    <template v-for="name in passthroughSlots" #[name]="slotProps" :key="name">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </q-banner>
</template>

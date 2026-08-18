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
  }
})

const attrs = useAttrs()

// --- Mapa de colores por tipo de banner ---
const colorMap = {
  success:     { text: 'green-10', bg: 'green-11' },
  error:       { text: 'red-10',   bg: 'red-2' },
  information: { text: 'blue-10',  bg: 'blue-3' },
  warning:     { text: 'yellow-10', bg: 'yellow-7' }
}

// --- Calcula los colores a aplicar según el tipo ---
const bannerColors = computed(() =>
  colorMap[props.type] || colorMap.success
)

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
    :class="[`text-${bannerColors.text}`, `bg-${bannerColors.bg}`]"
  >
    <span v-if="props.label">{{ props.label }}</span>
    <slot />

    <template v-for="name in passthroughSlots" #[name]="slotProps" :key="name">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </q-banner>
</template>

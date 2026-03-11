<script setup>
import { computed, useAttrs } from 'vue'

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
</script>

<template>
  <q-banner
    v-bind="attrs"
    class="x-banner"
    :class="[`text-${bannerColors.text}`, `bg-${bannerColors.bg}`]"
  >
    <span>{{ props.label }}</span>
    <slot />
  </q-banner>
</template>

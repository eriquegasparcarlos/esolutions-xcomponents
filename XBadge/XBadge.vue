<script setup>
import { computed, useAttrs } from 'vue'
import { resolveColor, lightenColor } from '@esolutions/js-utils'

defineOptions({
  name: 'XBadge',
  inheritAttrs: false // Control manual de atributos externos
})

// --- Props con valores por defecto ---
const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: null
  },
  isLightenColor: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: null // Ej: 'success', 'danger', 'warning'
  }
})

const attrs = useAttrs()

// --- Color resuelto (nombre/alias → hex) ---
const resolvedColor = computed(() => resolveColor(props.color))

// --- Color de fondo calculado si se pasa color ---
const bgColor = computed(() =>
  resolvedColor.value ? (props.isLightenColor ? lightenColor(resolvedColor.value) : resolvedColor.value) : null
)

// --- Clase dinámica para el tipo (si se usa sistema de tipo) ---
const badgeClass = computed(() =>
  props.type ? `x-badge-${props.type}` : ''
)
</script>

<template>
  <q-badge
    style="margin: 0!important;"
    v-bind="attrs"
    :label="label"
    :class="['x-badge', badgeClass]"
    :style="resolvedColor
      ? { color: resolvedColor, backgroundColor: bgColor }
      : undefined"
  />
</template>

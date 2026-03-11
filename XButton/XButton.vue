<script setup>
import { computed, useAttrs } from 'vue'

defineOptions({
  name: 'XButton',
  inheritAttrs: false
})

// --- PROPS ---
const props = defineProps({
  // Texto del botón (se pasa directo al label de QBtn)
  label: String,

  // Íconos opcionales (se pasan a QBtn como icon / icon-right)
  icon: String,
  iconRight: String,

  // Variante visual (antes usabas 'type' para estilo)
  variant: {
    type: String,
    default: null,
    validator: (val) =>
      ['primary', 'secondary', 'success', 'danger', 'warning', 'info', null].includes(val)
  },

  // LEGACY: 'type' puede ser nativo (submit/reset/button) o variante visual
  type: { type: String, default: null },

  // Tipo nativo del botón
  nativeType: {
    type: String,
    default: 'button', // button | submit | reset
    validator: (v) => ['button', 'submit', 'reset'].includes(v)
  },

  // Colores
  color: { type: String, default: null },
  textColor: { type: String, default: null },

  // Estilos visuales
  outline: Boolean,
  round: Boolean,
  rounded: Boolean,
  unelevated: { type: Boolean, default: true },
  flat: Boolean,
  stretch: Boolean,
  size: { type: String, default: 'md' },

  // Tooltip opcional
  tooltipColor: String,
  tooltipText: String,

  // Estado
  loading: Boolean,
  disable: Boolean,

  // --- BADGE ---
  hasBadge: {                // ¿Mostrar badge?
    type: Boolean,
    default: false
  },
  badgeColor: {           // Color del badge
    type: String,
    default: 'blue-grey-8'
  },
  badgeLabel: {           // Texto / número del badge
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['click'])

const attrs = useAttrs()

// --- Mapa de estilos por variante ---
const typeStyleMap = {
  primary: { color: 'primary', textColor: 'white' },
  secondary: { color: 'secondary', textColor: 'white' },
  success: { color: 'positive', textColor: 'white' },
  danger: { color: 'negative', textColor: 'white' },
  warning: { color: 'warning', textColor: 'black' },
  info: { color: 'info', textColor: 'white' }
}

// ¿'type' legacy luce nativo?
const legacyLooksNative = computed(() =>
  ['submit', 'reset', 'button'].includes(props.type)
)

// Variante visual final
const finalVariant = computed(() => {
  if (props.variant) return props.variant
  if (!legacyLooksNative.value && props.type) return props.type
  return null
})

// Tipo nativo final del botón
const finalNativeType = computed(() => {
  const fromAttrs = attrs.type
  if (fromAttrs && ['submit', 'reset', 'button'].includes(fromAttrs)) return fromAttrs
  if (legacyLooksNative.value) return props.type
  return props.nativeType || 'button'
})

// Colores finales (respetar attrs -> props -> variant)
const resolvedColorByVariant = computed(() =>
  finalVariant.value ? typeStyleMap[finalVariant.value]?.color : null
)
const resolvedTextColorByVariant = computed(() =>
  finalVariant.value ? typeStyleMap[finalVariant.value]?.textColor : null
)

const finalColor = computed(() =>
  attrs.color ?? props.color ?? resolvedColorByVariant.value ?? 'primary'
)

const finalTextColor = computed(() =>
  attrs['text-color'] ?? props.textColor ?? resolvedTextColorByVariant.value ?? null
)

// Iconos: solo usamos props / attrs y se los pasamos directo a QBtn
const finalIcon = computed(() => attrs.icon ?? props.icon ?? null)
const finalIconRight = computed(() => attrs['icon-right'] ?? props.iconRight ?? null)

// Tooltip
const hasTooltip = computed(() => !!props.tooltipText)

// Badge
const hasBadge = computed(() =>
  props.hasBadge && props.badgeLabel !== null && props.badgeLabel !== undefined && props.badgeLabel !== ''
)

const isTrueAttr = (key) => {
  if (!(key in attrs)) return undefined
  const val = attrs[key]
  // true si está presente (''), true, 'true', 1
  return val === '' || val === true || val === 'true' || val === 1 || val === '1'
}

// Click
function handleClick (event) {
  emit('click', event)
}
</script>

<template>
  <q-btn
    v-bind="{
      ...attrs,
      color: finalColor,
      'text-color': finalTextColor,
      outline: isTrueAttr('outline') ?? outline,
      round:   isTrueAttr('round')   ?? round,
      rounded: isTrueAttr('rounded') ?? rounded,
      unelevated: isTrueAttr('unelevated') ?? unelevated,
      flat:    isTrueAttr('flat')    ?? flat,
      dense:   isTrueAttr('dense')   ?? undefined,
      size,
      stretch,
      loading,
      disable: attrs.disable ?? disable,
      type: finalNativeType,
      label: attrs.label ?? label ?? undefined,
      icon: finalIcon || undefined,
      'icon-right': finalIconRight || undefined
    }"
    :class="['x-button', attrs.class]"
    no-caps
    @click="handleClick"
  >
    <!-- Si el padre quiere meter algo extra dentro del botón -->
    <slot />

    <!-- Tooltip -->
    <q-tooltip v-if="hasTooltip" :class="tooltipColor">
      {{ tooltipText }}
    </q-tooltip>

    <!-- Badge configurable -->
    <q-badge
      v-if="hasBadge"
      :color="badgeColor"
      rounded
      floating
    >
      {{ badgeLabel }}
    </q-badge>
  </q-btn>
</template>

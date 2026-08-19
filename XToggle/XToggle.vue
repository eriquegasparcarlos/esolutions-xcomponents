<script setup>
import { computed, useAttrs } from 'vue'
import { formDefaults } from '@esolutions/js-utils'

defineOptions({
  name: 'XToggle',
  inheritAttrs: false // Control manual de atributos
})

// --- PROPS: Configuración del toggle ---
const props = defineProps({
  // Valor vinculado al v-model (booleano, array o string)
  modelValue: {
    type: [Boolean, Array, String],
    required: true
  },

  // Si true, el label aparece al lado del toggle
  isClassic: {
    type: Boolean,
    default: formDefaults.isClassic,
  },

  // Etiqueta que se muestra arriba o al lado del toggle
  label: {
    type: String,
    default: ''
  },

  // Color del toggle (Quasar)
  color: {
    type: String,
    default: 'primary'
  },

  // Estado deshabilitado
  disable: {
    type: Boolean,
    default: false
  },

  // Activa el estado indeterminado (semi-activo)
  indeterminateValue: {
    type: Boolean,
    default: false
  },

  // Texto que se muestra debajo del toggle
  hint: {
    type: String,
    default: ''
  },

  // Texto del tooltip
  tooltipText: {
    type: String,
    default: ''
  },

  // Clase del fondo del tooltip (ej: 'bg-primary')
  tooltipColor: {
    type: String,
    default: ''
  },

  // Posición del switch respecto al bloque label+hint.
  // 'inline' (default, retrocompatible): switch y label en una fila, hint debajo de todo.
  // 'left'/'right': fila con el switch centrado verticalmente contra TODO el bloque
  // label+hint — el patrón de settings row (label ya no va dentro del q-toggle).
  layout: {
    type: String,
    default: 'inline',
    validator: (value) => ['inline', 'left', 'right'].includes(value)
  }
})

// --- EMITS: Comunicación al exterior ---
const emit = defineEmits(['update:modelValue'])

// --- Atributos dinámicos pasados al componente ---
const attrs = useAttrs()

// ID único con prefijo estandarizado, útil para <label for="">
const fallbackId = `app-q-checkbox-${Math.random().toString(36).substring(2, 9)}`
const elementId = computed(() =>
  attrs.id ? `app-q-checkbox-${attrs.id}` : fallbackId
)

// --- Mostrar label arriba del toggle si no es estilo clásico ---
const showTopLabel = computed(() => !props.isClassic && props.label)
const checkboxLabel = computed(() => props.isClassic ? props.label : undefined)

// --- Layout row (left/right): el label va como texto aparte, no dentro del q-toggle ---
const isRowLayout = computed(() => props.layout !== 'inline')
const toggleOrder = computed(() => (props.layout === 'right' ? 1 : 0))

// --- Mostrar el tooltip solo si hay texto definido ---
const hasTooltip = computed(() => !!props.tooltipText)

// --- Computed para v-model bidireccional ---
const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <div
    class="x-toggle flex-grow-1"
    :class="[attrs.class, isRowLayout ? 'row items-center no-wrap' : 'column']"
    :style="isRowLayout ? 'gap: 12px' : null"
  >
    <!-- Etiqueta superior (solo layout inline, no clásico) -->
    <label
      v-if="!isRowLayout && showTopLabel"
      :for="elementId"
      class="q-input__label"
      style="line-height: 15px; margin-top: 3px; margin-bottom: 2px"
    >
      {{ props.label }}
    </label>

    <!-- Toggle: en layout row, `order` lo manda a izquierda o derecha del bloque de texto -->
    <q-toggle
      v-bind="{
        ...attrs,
        class: null, // evita duplicidad de clase
        label: isRowLayout ? undefined : checkboxLabel,
        for: elementId,
        dense: true
      }"
      v-model="internalValue"
      :color="color"
      :disable="disable"
      :indeterminate-value="indeterminateValue"
      :style="isRowLayout
        ? { order: toggleOrder, flexShrink: 0 }
        : 'line-height: 40px; height: 40px'">
      <!-- Tooltip si está definido -->
      <q-tooltip v-if="hasTooltip" :class="tooltipColor">
        {{ tooltipText }}
      </q-tooltip>
    </q-toggle>

    <!-- Layout row: label + hint como bloque de texto aparte, centrado contra el toggle -->
    <div v-if="isRowLayout" class="col" :style="{ order: toggleOrder === 0 ? 1 : 0 }">
      <div v-if="label" class="text-body2 text-weight-medium">{{ label }}</div>
      <slot name="hint" v-if="hint">
        <div class="text-caption text-secondary">{{ hint }}</div>
      </slot>
    </div>

    <!-- Layout inline: texto de ayuda debajo del toggle -->
    <slot v-if="!isRowLayout && hint" name="hint">
      <div class="q-mt-sm text-caption text-secondary">{{ hint }}</div>
    </slot>
  </div>
</template>

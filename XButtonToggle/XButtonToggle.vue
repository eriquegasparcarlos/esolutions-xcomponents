<template>
  <q-btn-toggle
    class="x-button-toggle"
    :class="toggleClasses"
    v-bind="attrs"
    :model-value="modelValue"
    :options="normalizedOptions"
    :color="color"
    :text-color="textColor"
    :toggle-color="toggleColor"
    :unelevated="unelevated"
    :flat="flat"
    :outline="outline"
    :push="push"
    :spread="spread"
    :no-caps="noCaps"
    :dense="dense"
    :size="size"
    :disable="disable"
    :readonly="readonly"
    :clearable="clearable"
    :multiple="multiple"
    @update:model-value="onUpdate"
  />
</template>

<script setup>
import { computed, useAttrs } from 'vue'

defineOptions({
  name: 'XButtonToggle',
  inheritAttrs: false
})

const attrs = useAttrs()

const props = defineProps({
  modelValue: { type: [String, Number, Boolean, Array, Object, null], default: null },

  options: { type: Array, default: () => [] },

  // ✅ NUEVO: mapeo configurable
  optionLabel: { type: String, default: 'name' }, // campo para label
  optionValue: { type: String, default: 'id' },   // campo para value

  // Apariencia
  color: { type: String, default: null },
  textColor: { type: String, default: 'black-8' },
  toggleColor: { type: String, default: 'primary' },

  unelevated: { type: Boolean, default: false },
  flat: { type: Boolean, default: false },
  outline: { type: Boolean, default: false },
  push: { type: Boolean, default: false },

  spread: { type: Boolean, default: false },
  noCaps: { type: Boolean, default: true },
  dense: { type: Boolean, default: false },
  size: { type: String, default: 'md' },

  disable: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },

  // Muchos botones:
  scrollable: { type: Boolean, default: false },
  wrap: { type: Boolean, default: false },

  // Solo iconos (oculta label)
  iconOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change'])

const normalizedOptions = computed(() => {
  return (props.options || []).map((o) => {
    // primitives
    if (typeof o === 'string' || typeof o === 'number' || typeof o === 'boolean') {
      return { label: props.iconOnly ? '' : String(o), value: o }
    }

    // objects con mapeo configurable
    const label = o[props.optionLabel]
    const value = o[props.optionValue]

    return {
      ...o,
      label: props.iconOnly ? '' : label,
      value
      // icon: si viene en o.icon, Quasar lo usa automáticamente
    }
  })
})

const toggleClasses = computed(() => ({
  'x-button-toggle--scroll': props.scrollable && !props.wrap,
  'x-button-toggle--wrap': props.wrap,
  'x-button-toggle--icon-only': props.iconOnly,
  'x-button-toggle--unelevated': props.unelevated
}))

function onUpdate(val) {
  emit('update:modelValue', val)
  emit('change', val)
}
</script>

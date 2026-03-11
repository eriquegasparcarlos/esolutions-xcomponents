<script setup>
import XDatepicker from 'components/XDatepicker/XDatepicker.vue'
defineProps({
  modelValue: { type: String, default: null },
  label: { type: String, default: 'Fecha' },
  error: { type: String, default: null },
  readonly: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
</script>
<template>
  <x-datepicker :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" :label="label" :error="error" :readonly="readonly" />
</template>

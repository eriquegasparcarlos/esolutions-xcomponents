<script setup>
import XSelect from 'components/XSelect/XSelect.vue'
defineProps({
  modelValue: { type: String, default: 'PE' },
  label: { type: String, default: 'Nacionalidad' },
  error: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue'])
const options = [{ id: 'PE', name: 'Peruana' }, { id: 'US', name: 'Estadounidense' }, { id: 'CO', name: 'Colombiana' }, { id: 'EC', name: 'Ecuatoriana' }, { id: 'BO', name: 'Boliviana' }, { id: 'CL', name: 'Chilena' }, { id: 'BR', name: 'Brasileña' }]
</script>
<template>
  <x-select :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" :label="label" :options="options" :error="error" />
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: { type: [Number, String], default: 1 },
  label: { type: String, default: 'Cantidad' },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 999999 },
  error: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue'])
const value = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
</script>
<template>
  <q-input v-model.number="value" :label="label" type="number" :min="min" :max="max" outlined dense :error="!!error" :error-message="error" />
</template>

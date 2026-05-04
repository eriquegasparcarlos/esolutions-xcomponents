<script setup>
import XSelect from '../XSelect/XSelect.vue'
import { ref, onMounted } from 'vue'
import { api } from 'src/services/api'
defineProps({
  modelValue: { type: [String, Number], default: null },
  label: { type: String, default: 'País' },
  error: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue'])
const options = ref([])
onMounted(async () => {
  try {
    const res = await api.get('/catalog/countries')
    options.value = res.data?.data || res.data || []
  } catch { options.value = [{ id: 'PE', name: 'Perú' }] }
})
</script>
<template>
  <x-select :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" :label="label" :options="options" :error="error" />
</template>

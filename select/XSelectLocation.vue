<script setup>
import { ref } from 'vue'
import { api } from 'src/services/api'
defineProps({
  modelValue: { type: [String, Number], default: null },
  label: { type: String, default: 'Ubigeo' },
  error: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue'])
const options = ref([])
const search = ref('')
const loading = ref(false)
const onFilter = async (val, update) => {
  if (val.length < 3) { update(); return }
  loading.value = true
  try {
    const res = await api.get('/catalog/locations', { params: { search: val } })
    options.value = (res.data?.data || res.data || []).map(r => ({ label: r.description || r.name, value: r.id }))
  } catch { options.value = [] }
  finally { loading.value = false; update() }
}
</script>
<template>
  <q-select v-model="search" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" :label="label" :options="options" use-input emit-value map-options @filter="onFilter" :loading="loading" outlined dense :error="!!error" :error-message="error" />
</template>

<script setup>
defineProps({
  state: { type: [String, Boolean], default: null },
  label: { type: String, default: '' },
  // Props para estados de documentos (ventas, cotizaciones, etc.)
  state_type_id: { type: String, default: null },
  state_type_name: { type: String, default: '' },
  state_type_color: { type: String, default: null },
})
</script>
<template>
  <q-badge
    v-if="state_type_id"
    :color="state_type_color || 'grey'"
    :label="state_type_name"
  />
  <q-badge
    v-else
    :color="state ? 'positive' : 'negative'"
    :label="label || (state ? 'Activo' : 'Inactivo')"
  />
</template>

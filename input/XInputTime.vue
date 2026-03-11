<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: { type: String, default: null },
  label: { type: String, default: 'Hora' },
  error: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue'])
const value = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
</script>
<template>
  <q-input v-model="value" :label="label" outlined dense mask="time" :error="!!error" :error-message="error">
    <template v-slot:append>
      <q-icon name="access_time" class="cursor-pointer">
        <q-popup-proxy transition-show="scale" transition-hide="scale">
          <q-time v-model="value" format24h />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

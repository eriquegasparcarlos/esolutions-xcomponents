<script setup>
import { computed, ref, useAttrs } from 'vue'
import { formDefaults } from '@esolutions/js-utils'

// Define las opciones del componente
defineOptions({
  name: 'XFile',
  inheritAttrs: false,
});

// Props del componente
const props = defineProps({
  modelValue: {
    type: [File, Array],
    default: () => null,
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  outlined: {
    type: Boolean,
    default: formDefaults.outlined,
  },
  rules: {
    type: Array,
    default: () => [],
  },
  errorMessage: {
    type: String,
    default: '',
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  accept: {
    type: String,
    default: '',
  },
})

// Eventos emitidos
const emit = defineEmits(['update:modelValue', 'clear-error'])

// Atributos externos al componente
const attrs = useAttrs()

// Estado local para manejar errores personalizados
const localErrorMessage = ref(props.errorMessage)
const hasError = computed(() => localErrorMessage.value !== '')

// Manejador de actualización de archivos
function onInput(val) {
  emit('update:modelValue', val)
  if (props.errorMessage) {
    emit('clear-error')
  }
}
</script>

<template>
  <q-file
    v-bind="{
      ...attrs,
      label,
      placeholder,
      outlined,
      multiple,
      rules,
      error: hasError,
      errorMessage,
      clearable,
      accept
    }"
    :model-value="modelValue"
    @update:model-value="onInput"
  >
    <!-- Icono adjunto personalizado -->
    <template #append>
      <q-icon
        name="fal fa-paperclip"
        color="primary"
        size="md"
        class="q-mr-xs"
      />
    </template>
  </q-file>
</template>

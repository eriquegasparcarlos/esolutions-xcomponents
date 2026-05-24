<script setup>
defineOptions({
  name: 'XDropdownDivider',
})

defineProps({
  /** Label opcional para separar secciones (ej: "Administracion") */
  label: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="x-dropdown-divider">
    <span v-if="label" class="x-dropdown-divider__label">{{ label }}</span>
    <hr class="x-dropdown-divider__line" />
  </div>
</template>

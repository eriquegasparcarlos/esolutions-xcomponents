<script setup>
// Una muestra etiquetada: el codigo que la produce arriba, el componente abajo.
// Asi la galeria sirve de referencia copiable, no solo de vitrina.
defineProps({
  code: { type: String, default: '' },
  nota: { type: String, default: '' },
  fila: { type: Boolean, default: false }, // muestras en linea en vez de apiladas
})
</script>

<template>
  <div class="pg-demo-item" :class="{ 'pg-demo-item--fila': fila }">
    <div v-if="code || nota" class="pg-demo-label">
      <code v-if="code">{{ code }}</code>
      <span v-if="nota">{{ nota }}</span>
    </div>
    <div class="pg-demo-body"><slot /></div>
  </div>
</template>

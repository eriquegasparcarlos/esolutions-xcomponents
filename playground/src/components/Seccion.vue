<script setup>
// Envoltorio de cada bloque de la galeria. Declara que componentes cubre para
// poder ocultarse cuando el panel esta enfocado en otro.
import { computed } from 'vue'
import { useFoco } from '../composables/useFoco.js'

const props = defineProps({
  titulo: { type: String, required: true },
  nota: { type: String, default: '' },
  cubre: { type: Array, default: () => [] },
})

const { visible } = useFoco()
const seVe = computed(() => visible(props.cubre))
</script>

<template>
  <section v-if="seVe" class="pg-section">
    <h3>{{ titulo }} <code v-if="nota">{{ nota }}</code></h3>
    <slot />
  </section>
</template>

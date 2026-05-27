<script setup>
import { useSlots } from 'vue'
import XCard from '../XCard/XCard.vue'
import XTable from '../XTable/XTable.vue'

defineOptions({
  name: 'XTableCard',
  inheritAttrs: false,
})

/**
 * Wrapper que combina XCard + XTable con la configuracion comun:
 *  - x-card no-padding full-height
 *  - x-table no-border flat (integra visualmente con el card)
 *
 * Acepta props de XCard (title, icon, subtitle) directamente.
 * El resto de attrs ($attrs) se pasan a XTable (rows, columns, loading, etc.).
 * Forward de TODOS los slots de XTable + slot 'header-buttons' del XCard.
 */
defineProps({
  // XCard props
  title:    { type: String, default: '' },
  subtitle: { type: String, default: '' },
  icon:     { type: String, default: '' },
})

const slots = useSlots()
</script>

<template>
  <x-card :title="title" :subtitle="subtitle" :icon="icon" no-padding full-height>
    <!-- Slot del header del card (botones a la derecha del titulo) -->
    <template v-if="slots['header-buttons']" #header-buttons>
      <slot name="header-buttons" />
    </template>

    <!-- XTable con configuracion embedded por default -->
    <x-table v-bind="$attrs" no-border flat>
      <!-- Forward dinamico de todos los slots de XTable, excepto:
           - 'header-buttons' (va al card padre arriba)
           - 'footer' (va abajo despues de la tabla, ej: paginacion) -->
      <template
        v-for="(_, name) in slots"
        v-slot:[name]="slotProps"
        :key="name"
      >
        <slot
          v-if="name !== 'header-buttons' && name !== 'footer'"
          :name="name"
          v-bind="slotProps || {}"
        />
      </template>
    </x-table>

    <!-- Footer slot: contenido despues de la tabla dentro del card (paginacion, totales, etc.) -->
    <div v-if="slots.footer" class="x-table-card__footer">
      <slot name="footer" />
    </div>
  </x-card>
</template>

<style scoped>
.x-table-card__footer {
  padding: 12px 16px;
}
</style>

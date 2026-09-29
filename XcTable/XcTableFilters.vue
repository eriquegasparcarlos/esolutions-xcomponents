<script setup>
/**
 * Bloque de filtros del compound XcTable.
 * NO reinventa controles: reutiliza los MISMOS x-components que el XTableServer
 * (x-input, x-select, x-period-filter-inline, x-tree-select). El markup
 * es el del XTableServer movido tal cual; sólo cambia el origen del estado (ctx) y
 * el disparo de la consulta (ctx.fetch reiniciando la página).
 */
import { inject } from 'vue'
import XInput from '../XInput/XInput.vue'
import XSelect from '../XSelect/XSelect.vue'
import XPeriodFilterInline from '../XPeriodFilter/XPeriodFilterInline.vue'
import XTreeSelect from '../XTreeSelect/XTreeSelect.vue'

const ctx = inject('xctable')

// Igual que filterData() del XTableServer: cualquier cambio re-consulta desde la página 1.
function filterData () {
  ctx.pagination.page = 1
  ctx.fetch()
}

/**
 * Cambio de filtro. Pasa por el contexto porque un filtro puede tener hijos
 * cuyas opciones dependen de él: entonces se recargan y se consulta una sola
 * vez al final, en vez de una por cada hijo.
 */
function onChange (filter) {
  ctx.onFilterChange(filter)
}

/** Período: aplica solo los campos que cambiaron y consulta una vez. */
function onPeriodChange (filter, value) {
  for (const key of ['value', 'dateStart', 'dateEnd', 'monthStart', 'monthEnd']) {
    if (filter[key] !== value[key]) filter[key] = value[key]
  }
  filterData()
}

/**
 * Búsqueda remota de un filtro con `searchUrl`.
 *
 * Contrato de Quasar: (texto, update, abort). Con menos de dos caracteres no se
 * consulta —el endpoint devolvería medio catálogo— y se aborta.
 */
function buscar (filter, texto, update, abort) {
  const consulta = (texto || '').trim()

  if (consulta.length < (filter.minChars ?? 2)) {
    abort()
    return
  }

  ctx.searchFilterOptions(filter, consulta).then((opciones) => {
    update(() => { filter.options = opciones })
  }).catch(abort)
}
</script>

<template>
  <div v-if="ctx.filters.value.length" class="row q-col-gutter-sm items-start">
    <div v-for="filter in ctx.filters.value" :key="filter.name" :class="filter.class || 'col-12 col-sm-auto'">

      <x-input
        v-if="filter.type === 'input'"
        v-model="filter.value"
        :label="filter.label"
        debounce="750"
        @update:model-value="filterData"
      />

      <!-- El mismo componente que usa XTableServer: antes cada tabla tenía su copia. -->
      <x-period-filter-inline
        v-else-if="filter.name === 'period'"
        :model-value="filter"
        :options="filter.options"
        :label="filter.label"
        @update:model-value="(v) => onPeriodChange(filter, v)"
      />

      <!-- Filtro buscador: no trae opciones, las pide segun lo tecleado. Va antes
           del select normal porque tambien es de tipo 'select'. -->
      <x-select
        v-else-if="filter.type === 'select' && filter.searchUrl"
        v-model="filter.value"
        :label="filter.label"
        :options="filter.options"
        :disable="filter.disabled"
        :loading="filter.loading"
        :include-all-option="false"
        :placeholder="filter.placeholder || 'Escriba para buscar'"
        stack-label
        use-input
        clearable
        option-value="id"
        :option-label="filter.optionLabel || 'name'"
        emit-value
        map-options
        @filter="(texto, update, abort) => buscar(filter, texto, update, abort)"
        @update:model-value="onChange(filter)"
      />

      <x-select
        v-else-if="filter.type === 'select'"
        v-model="filter.value"
        :label="filter.label"
        :options="filter.options"
        :disable="filter.disabled"
        :loading="filter.loading"
        :filter-local="filter.filterLocal"
        :include-all-option="filter.hasOwnProperty('includeAllOption') ? filter.includeAllOption : false"
        :placeholder="filter.placeholder || undefined"
        :stack-label="!!filter.placeholder"
        @update:model-value="onChange(filter)"
      />

      <x-tree-select
        v-else-if="filter.type === 'tree-select'"
        v-model="filter.value"
        :label="filter.label"
        :options="filter.options"
        :disable="filter.disabled"
        :loading="filter.loading"
        :is-classic="false"
        :with-filter="filter.withFilter !== false"
        :multiple="filter.multiple || false"
        :only-leaf-selectable="filter.onlyLeafSelectable || false"
        :option-value="filter.optionValue || 'id'"
        :option-label="filter.optionLabel || 'label'"
        :option-children="filter.optionChildren || 'children'"
        @update:model-value="onChange(filter)"
      />
    </div>
  </div>
</template>


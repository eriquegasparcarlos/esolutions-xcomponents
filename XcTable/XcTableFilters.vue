<script setup>
/**
 * Bloque de filtros del compound XcTable.
 * NO reinventa controles: reutiliza los MISMOS x-components que el XTableServer
 * (x-input, x-select, x-datepicker, x-datepicker-month, x-tree-select). El markup
 * es el del XTableServer movido tal cual; sólo cambia el origen del estado (ctx) y
 * el disparo de la consulta (ctx.fetch reiniciando la página).
 */
import { inject } from 'vue'
import XInput from '../XInput/XInput.vue'
import XSelect from '../XSelect/XSelect.vue'
import XDatepicker from '../XDatepicker/XDatepicker.vue'
import XDatepickerMonth from '../XDatepicker/XDatepickerMonth.vue'
import XTreeSelect from '../XTreeSelect/XTreeSelect.vue'

const ctx = inject('xctable')

// Igual que filterData() del XTableServer: cualquier cambio re-consulta desde la página 1.
function filterData () {
  ctx.pagination.page = 1
  ctx.fetch()
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

      <div v-else-if="filter.name === 'period'">
        <div class="row q-col-gutter-x-sm q-col-gutter-y-sm">
          <div class="col" v-if="filter.options.length > 1">
            <x-select
              v-model="filter.value"
              :label="filter.label"
              :options="filter.options"
              @update:model-value="filterData"
            />
          </div>

          <div class="col" v-if="filter.value === 'date' || filter.value === 'between_dates'">
            <x-datepicker
              v-model="filter.dateStart"
              :label="$t('components.dateFrom')"
              @update:model-value="filterData"
            />
          </div>

          <div class="col" v-if="filter.value === 'between_dates'">
            <x-datepicker
              v-model="filter.dateEnd"
              :label="$t('components.dateTo')"
              @update:model-value="filterData"
            />
          </div>

          <div class="col" v-if="filter.value === 'month' || filter.value === 'between_months'">
            <x-datepicker-month
              v-model="filter.monthStart"
              :label="$t('components.monthFrom')"
              @update:model-value="filterData"
            />
          </div>

          <div class="col" v-if="filter.value === 'between_months'">
            <x-datepicker-month
              v-model="filter.monthEnd"
              :label="$t('components.monthTo')"
              @update:model-value="filterData"
            />
          </div>
        </div>
      </div>

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
        @update:model-value="filterData"
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
        @update:model-value="filterData"
      />
    </div>
  </div>
</template>


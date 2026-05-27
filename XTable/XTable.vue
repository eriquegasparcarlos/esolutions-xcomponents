<script setup>
import { computed, ref, useSlots, watch, getCurrentInstance } from 'vue'
import { useQuasar } from 'quasar'
import XLoading from '../XLoading/XLoading.vue'
import XInput from '../XInput/XInput.vue'
import XMobileMenuAction from '../XTableServer/XMobileMenuAction.vue'
import MobileLinkTitle from '../Mobile/MobileLinkTitle.vue'

defineOptions({
  name: 'XTable',
  inheritAttrs: false,
})

const props = defineProps({
  /** Filas a renderizar */
  rows: {
    type: Array,
    default: () => [],
  },
  /** Definicion de columnas (formato q-table: { name, label, field, align, sortable }) */
  columns: {
    type: Array,
    default: () => [],
  },
  /** Titulo opcional en el header del card */
  title: {
    type: String,
    default: '',
  },
  /** Loading overlay */
  loading: {
    type: Boolean,
    default: false,
  },
  /** Activa input de busqueda local */
  searchable: {
    type: Boolean,
    default: false,
  },
  /** Placeholder del input de busqueda */
  searchLabel: {
    type: String,
    default: 'Buscar',
  },
  /** Activa paginacion local */
  paginated: {
    type: Boolean,
    default: false,
  },
  /** Filas por pagina (cuando paginated=true) */
  rowsPerPage: {
    type: Number,
    default: 10,
  },
  /** Opciones de tamano de pagina */
  rowsPerPageOptions: {
    type: Array,
    default: () => [10, 25, 50, 100, 0],
  },
  /** Densidad compacta */
  dense: {
    type: Boolean,
    default: true,
  },
  /** Sin contenedor card (q-table plano) */
  flat: {
    type: Boolean,
    default: false,
  },
  /** Mensaje cuando no hay datos */
  noDataLabel: {
    type: String,
    default: 'No hay registros',
  },
  /** Subtitulo del empty-state */
  noDataSubtitle: {
    type: String,
    default: '',
  },
  /** Icono del empty-state */
  noDataIcon: {
    type: String,
    default: 'fa-light fa-inbox',
  },
  /** row-key para q-table (default 'id') */
  rowKey: {
    type: String,
    default: 'id',
  },
  /**
   * Configuracion de layout mobile (similar a XTableServer).
   * { leftWidth, primaryFields, titleField, subtitleField }
   * Si no se pasa, auto-generado desde las primeras columnas visibles.
   */
  mobileConfig: {
    type: Object,
    default: null,
  },
  /**
   * Sin separadores entre filas y sin border-bottom en celdas.
   * Util para tablas embedded compactas o mini-listas tipo "data display".
   */
  noBorder: {
    type: Boolean,
    default: false,
  },
  /**
   * Funcion que devuelve clases CSS para una fila (row, index) => string|object|array.
   * Util para marcar filas seleccionadas con bg-color, etc.
   * Ejemplo:
   *   :row-class="(row) => selectedId === row.id ? 'x-table-row--selected' : ''"
   */
  rowClass: {
    type: [Function, String],
    default: null,
  },
})

// Helper para resolver la clase de fila
function getRowClass(row, index) {
  if (typeof props.rowClass === 'function') return props.rowClass(row, index)
  return props.rowClass || ''
}

const emit = defineEmits(['row-click', 'update:search'])
const slots = useSlots()
const $q = useQuasar()
const instance = getCurrentInstance()

// Detecta si el padre tiene @row-click registrado (presente en vnode.props)
const hasRowClickListener = computed(() => !!instance?.vnode.props?.onRowClick)

// --- Mobile detection ---
const isMobileView = computed(() => $q.platform.is.mobile || $q.screen.lt.lg)

// --- First load tracking ---
// Marca true despues de que loading pase de true → false (carga inicial completa).
// O si nunca hubo loading=true (datos sincronos), se marca true al recibir rows.
// Mientras false: solo se ve XLoading (no la tabla vacia debajo).
const initialLoadDone = ref(!props.loading)
watch(() => props.loading, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    initialLoadDone.value = true
  }
})

// --- Busqueda local ---
const search = ref('')

// --- Pagination ---
const pagination = ref({
  rowsPerPage: props.paginated ? props.rowsPerPage : 0,
})

// --- Filas filtradas por search ---
const filteredRows = computed(() => {
  if (!props.searchable || !search.value) return props.rows
  const q = String(search.value).toLowerCase()
  return props.rows.filter(row =>
    props.columns.some(col => {
      const val = row[col.field || col.name]
      return val != null && String(val).toLowerCase().includes(q)
    })
  )
})

// --- Mobile config (con fallback auto) ---
const mobileConfigResolved = computed(() => {
  if (props.mobileConfig) return props.mobileConfig
  // Fallback: primeras 2 cols a la izquierda, siguientes 2 a la derecha (excluye actions)
  const visibleCols = props.columns.filter(c => c.name !== 'actions')
  const leftFields = visibleCols.slice(0, 2).map(c => ({
    field: c.field || c.name,
    label: c.label,
    position: 'left',
    align: 'left',
  }))
  const rightFields = visibleCols.slice(2, 4).map(c => ({
    field: c.field || c.name,
    label: c.label,
    position: 'right',
    align: 'right',
  }))
  return {
    leftWidth: '60%',
    primaryFields: [...leftFields, ...rightFields],
    titleField: visibleCols[0]?.field || visibleCols[0]?.name || null,
    subtitleField: visibleCols[1]?.field || visibleCols[1]?.name || null,
  }
})

const mobileLeftFields = computed(
  () => mobileConfigResolved.value.primaryFields?.filter(f => f.position === 'left') || []
)
const mobileRightFields = computed(
  () => mobileConfigResolved.value.primaryFields?.filter(f => f.position === 'right') || []
)
const mobileLeftWidth = computed(() => mobileConfigResolved.value.leftWidth || '60%')

function getMobileFieldValue(row, field) {
  return row?.[field.field] ?? ''
}
function getDisplayText(row, fieldName) {
  if (!row || !fieldName) return ''
  return row[fieldName] ?? ''
}

// --- Mobile bottom sheet ---
const showMobileActions = ref(false)
const selectedRow = ref(null)

function openMobileActions(row) {
  selectedRow.value = row
  showMobileActions.value = true
}
function closeMobileActions() {
  showMobileActions.value = false
}

/**
 * Click en una fila mobile: si hay slot mobile-actions abre bottom sheet;
 * si NO hay, emite row-click directo (sin menu intermedio).
 */
function onMobileRowClick(evt, row, idx) {
  if (hasMobileActionsSlot.value) {
    openMobileActions(row)
  } else {
    emit('row-click', { row, idx, evt })
  }
}

// --- Slots ---
const hasHeaderSlot = computed(() => !!slots.header || !!slots['header-buttons'] || !!props.title || props.searchable)
const hasMobileActionsSlot = computed(() => !!slots['mobile-actions'])

/**
 * La fila mobile es interactiva si hay slot de acciones O hay listener @row-click.
 * Si no, las filas son read-only (no cursor, sin click handler).
 */
const isRowInteractive = computed(() => hasMobileActionsSlot.value || hasRowClickListener.value)

// --- Helpers ---
function clearSearch() {
  search.value = ''
  emit('update:search', '')
}
function onSearchUpdate(val) {
  search.value = val
  emit('update:search', val)
}

defineExpose({ clearSearch, closeMobileActions })
</script>

<template>
  <q-card class="x-table" :class="{ 'x-table--no-border': noBorder }" :flat="flat">
    <!-- Header opcional (title + search + buttons) -->
    <q-card-section v-if="hasHeaderSlot" class="x-table__header q-py-sm">
      <div class="x-table__header-content">
        <div v-if="title" class="x-table__title">{{ title }}</div>
        <slot name="header" />
      </div>
      <div class="x-table__header-actions">
        <x-input
          v-if="searchable"
          :model-value="search"
          :label="searchLabel"
          debounce="300"
          dense
          class="x-table__search"
          @update:model-value="onSearchUpdate"
        />
        <slot name="header-buttons" />
      </div>
    </q-card-section>

    <q-table
      v-if="initialLoadDone"
      v-bind="$attrs"
      :rows="filteredRows"
      :columns="columns"
      :row-key="rowKey"
      :dense="dense"
      :flat="true"
      :loading="loading"
      :separator="noBorder ? 'none' : 'horizontal'"
      v-model:pagination="pagination"
      :rows-per-page-options="paginated ? rowsPerPageOptions : []"
      :hide-pagination="!paginated || filteredRows.length === 0"
      :hide-header="isMobileView"
      @row-click="(evt, row, idx) => emit('row-click', { row, idx, evt })"
    >
      <!-- DESKTOP: render de fila completa para poder aplicar rowClass al <q-tr>.
           Despacha body-cell-{name} dinamicamente para cada columna. -->
      <template v-if="!isMobileView" v-slot:body="props">
        <q-tr :props="props" :class="getRowClass(props.row, props.rowIndex)">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <slot
              :name="`body-cell-${col.name}`"
              v-bind="props"
              :row="props.row"
              :value="props.row[col.field || col.name]"
              :col="col"
            >
              {{ props.row[col.field || col.name] }}
            </slot>
          </q-td>
        </q-tr>
      </template>

      <!-- MOBILE: render custom de fila como card 2-cols + kebab (si hay actions) -->
      <template v-if="isMobileView" v-slot:body="props">
        <q-tr
          :class="[
            getRowClass(props.row, props.rowIndex),
            isRowInteractive ? 'cursor-pointer' : ''
          ]"
          :props="props"
          @click="isRowInteractive ? onMobileRowClick($event, props.row, props.rowIndex) : null"
        >
          <q-td colspan="100%" class="q-py-sm">
            <div class="x-table-mobile-row__content">
              <!-- Columna izquierda -->
              <div class="x-table-mobile-row__left" :style="{ flexBasis: mobileLeftWidth }">
                <template v-for="(field, idx) in mobileLeftFields" :key="idx">
                  <div class="ellipsis" :class="`text-${field.align || 'left'}`">
                    <slot
                      :name="`body-cell-${field.field}`"
                      :row="props.row"
                      :value="getMobileFieldValue(props.row, field)"
                      :col="{ name: field.field, field: field.field, label: field.label }"
                    >
                      {{ getMobileFieldValue(props.row, field) }}
                    </slot>
                  </div>
                </template>
              </div>
              <!-- Columna derecha -->
              <div class="x-table-mobile-row__right">
                <template v-for="(field, idx) in mobileRightFields" :key="idx">
                  <div class="ellipsis" :class="`text-${field.align || 'right'}`">
                    <slot
                      :name="`body-cell-${field.field}`"
                      :row="props.row"
                      :value="getMobileFieldValue(props.row, field)"
                      :col="{ name: field.field, field: field.field, label: field.label }"
                    >
                      {{ getMobileFieldValue(props.row, field) }}
                    </slot>
                  </div>
                </template>
              </div>
              <!-- Icono action: kebab si hay menu, chevron si solo click -->
              <div v-if="hasMobileActionsSlot" class="x-table-mobile-row__action">
                <q-icon size="1.25em" name="fa-light fa-ellipsis-vertical" color="grey-7" />
              </div>
            </div>
          </q-td>
        </q-tr>
      </template>

      <!-- Empty state -->
      <template v-slot:no-data>
        <div class="x-table-empty-state">
          <slot name="no-data">
            <q-icon :name="noDataIcon" size="48px" class="x-table-empty-state__icon" />
            <div class="x-table-empty-state__title">{{ noDataLabel }}</div>
            <div v-if="noDataSubtitle" class="x-table-empty-state__subtitle">{{ noDataSubtitle }}</div>
          </slot>
        </div>
      </template>
    </q-table>

    <!-- Mobile bottom sheet con acciones (slot mobile-actions del padre) -->
    <x-mobile-menu-action v-if="isMobileView && hasMobileActionsSlot" v-model="showMobileActions">
      <mobile-link-title
        :text-left="getDisplayText(selectedRow, mobileConfigResolved.titleField)"
        :text-right="getDisplayText(selectedRow, mobileConfigResolved.subtitleField)"
      />
      <slot name="mobile-actions" :row="selectedRow" :close="closeMobileActions" />
    </x-mobile-menu-action>

    <!-- Loading overlay -->
    <x-loading :loading="loading" />
  </q-card>
</template>

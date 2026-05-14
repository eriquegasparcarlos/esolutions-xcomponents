<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useMeta, useQuasar } from 'quasar'
import XSelect from '../XSelect/XSelect.vue'
import XInput from '../XInput/XInput.vue'
import XTreeSelect from '../XTreeSelect/XTreeSelect.vue'
import XDialogActive from '../XDialogAction/XDialogAction.vue'
import XDialogDelete from '../XDialogAction/XDialogAction.vue'
import XDatepicker from '../XDatepicker/XDatepicker.vue'
import XDatepickerMonth from '../XDatepicker/XDatepickerMonth.vue'
import XCellColumnRenderer from './XCellColumnRenderer.vue'
import XCellRenderer from './XCellRenderer.vue'
import XMobileMenuAction from './XMobileMenuAction.vue'
import MobileLinkTitle from '../Mobile/MobileLinkTitle.vue'
import { useDataStore } from 'stores/data.js'

const dataStore = useDataStore()

const props = defineProps({
  resource: { type: String, required: true },
})

const { proxy } = getCurrentInstance()
const $q = useQuasar()
const emit = defineEmits(['actions', 'ready'])

const refDialogDeleteForm = ref()
const refDialogActiveForm = ref()

const columns = ref([])
const rows = ref([])
const loading = ref(false)
const error = ref(null)

const pagination = ref({
  sortBy: '',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  pageSizes: [5, 10, 20, 50],
})

const pageTitle = ref('')
const tableTitle = ref('')
const tableBadge = ref(null)
const tableName = ref('')
const headerButtons = ref([])

const filters = ref([])
const appliedFilters = ref({})

const columnOptions = ref([])
const columnVisibleOptions = ref([])
const lockedColumns = ref([])
const visibleColumns = ref([])

const recordDeleteId = ref(null)
const recordActiveId = ref(null)

// evita doble fetch durante cascadas
const suppressFilterFetch = ref(false)

// -------------------------
// Mobile responsive
// -------------------------
const isMobileView = computed(() => $q.platform.is.mobile || $q.screen.lt.lg)
const showMobileActions = ref(false)
const selectedRow = ref(null)
const mobileConfigBackend = ref(null)

// Configuracion movil: usa backend si existe, sino genera automaticamente
const mobileConfig = computed(() => {
  // Si el backend envio configuracion, usarla
  if (mobileConfigBackend.value?.enabled) {
    return mobileConfigBackend.value
  }

  // Fallback automatico: usar las primeras columnas visibles (excluyendo actions)
  const visibleCols = columns.value.filter((c) => c.name !== 'actions')
  const leftFields = visibleCols.slice(0, 2).map((c) => ({
    field: c.name,
    label: c.label,
    position: 'left',
  }))
  const rightFields = visibleCols.slice(2, 4).map((c) => ({
    field: c.name,
    label: c.label,
    position: 'right',
  }))

  return {
    enabled: true,
    primaryFields: [...leftFields, ...rightFields],
    titleField: visibleCols[0]?.name || null,
    subtitleField: visibleCols[1]?.name || null,
  }
})

const mobileLeftFields = computed(
  () => mobileConfig.value.primaryFields?.filter((f) => f.position === 'left') || [],
)

const mobileRightFields = computed(
  () => mobileConfig.value.primaryFields?.filter((f) => f.position === 'right') || [],
)

function openMobileActions(row) {
  selectedRow.value = row
  showMobileActions.value = true
}

function closeMobileActions() {
  showMobileActions.value = false
}

function performMobileAction(action) {
  closeMobileActions()
  if (selectedRow.value) {
    performAction(action, selectedRow.value)
  }
}

// Obtener acciones directas (botones sin menú)
function getDirectActions(row) {
  const actions = row?.actions || []
  return actions.filter((a) => a && a.type !== 'group' && !a.disable)
}

// Obtener acciones de grupos/menús (botones dentro de menús)
function getGroupActions(row) {
  const actions = row?.actions || []
  const groupItems = []
  for (const action of actions.filter(Boolean)) {
    if (action.type === 'group' && Array.isArray(action.buttons)) {
      for (const btn of action.buttons.filter(Boolean)) {
        if (btn.type !== 'separator' && !btn.disable) {
          groupItems.push(btn)
        }
      }
    }
  }
  return groupItems
}

// Obtener valor para mostrar en movil (puede ser objeto cell o valor simple)
function getMobileFieldValue(row, field) {
  if (!row || !field) return ''
  const value = row[field.field]
  return value
}

// Extraer texto plano de un valor (para el titulo del bottom sheet)
function getDisplayText(row, fieldName) {
  if (!row || !fieldName) return ''
  const value = row[fieldName]
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number') return value
  // Si es un objeto cell, extraer el valor
  if (typeof value === 'object') {
    return value.value || value.label || ''
  }
  return ''
}

useMeta(() => ({
  title: dataStore.appName + ' | ' + pageTitle.value,
}))

// -------------------------
// Helpers filtros dependientes
// -------------------------
function findFilter(name) {
  return filters.value.find((f) => f.name === name)
}

function getDependents(parentName) {
  return filters.value.filter((f) => f.dependsOn === parentName)
}

/**
 * Carga opciones del filtro hijo segun el valor del padre.
 * - setea disabled/loading
 * - setea options
 * - resetea value (si resetOnParentChange)
 * NO llama fetchData() aqui.
 */
async function loadDependentOptions(child) {
  if (!child?.dependsOn || !child?.remote?.url) return

  const parent = findFilter(child.dependsOn)
  const parentValue = parent?.value

  const emptyParent = !parentValue || parentValue === 'all'
  child.disabled = child.disableWhenParentEmpty !== false && emptyParent

  if (child.disabled) {
    child.options = []
    if (child.resetOnParentChange !== false) child.value = 'all'
    return
  }

  // params reemplazando $parent
  const params = { ...(child.remote.params || {}) }
  Object.keys(params).forEach((k) => {
    if (params[k] === '$parent') params[k] = parentValue
  })

  child.loading = true
  try {
    const method = (child.remote.method || 'get').toLowerCase()

    const res =
      method === 'get'
        ? await proxy.$api.get(child.remote.url, { params })
        : await proxy.$api[method](child.remote.url, params)

    child.options = res.data.options || []
    if (child.resetOnParentChange !== false) child.value = 'all'
  } catch {
    child.options = []
  } finally {
    child.loading = false
  }
}

/**
 * Handler unico para cambios de filtros.
 * - Si no tiene dependientes -> fetch normal
 * - Si tiene dependientes -> carga opciones hijos y al final hace SOLO 1 fetch
 */
async function onFilterChange(filter) {
  if (suppressFilterFetch.value) return

  const dependents = getDependents(filter.name)

  // no dependientes -> comportamiento normal
  if (dependents.length === 0) {
    filterData()
    return
  }

  // cascada: cargar hijos sin disparar fetch intermedio
  suppressFilterFetch.value = true
  try {
    for (const child of dependents) {
      await loadDependentOptions(child)
    }
  } finally {
    suppressFilterFetch.value = false
  }

  // un solo fetch final
  filterData()
}

// -------------------------
// Fetch init + data
// -------------------------
const fetchColumnsAndData = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await proxy.$api.get(`${props.resource}/init-data-table`)

    pageTitle.value = response.data.pageTitle
    tableTitle.value = response.data.tableTitle
    tableBadge.value = response.data.tableBadge || null
    tableName.value = response.data.tableName

    pagination.value.rowsPerPage = response.data.pagination.perPage
    pagination.value.descending = response.data.pagination.descending
    pagination.value.sortBy = response.data.pagination.sortBy
    pagination.value.pageSizes = response.data.pagination.pageSizes || [5, 10, 20, 50]

    columnOptions.value = response.data.columns.map((column) => ({
      label: column.label,
      value: column.name,
      align: column.align,
      visible: column.visible,
      sortable: column.sortable,
      locked: column.locked,
    }))

    lockedColumns.value = columnOptions.value.filter((c) => c.locked).map((c) => c.value)
    columnVisibleOptions.value = columnOptions.value.filter((c) => !c.locked)
    visibleColumns.value = response.data.visibleColumns

    updateVisibleColumns(visibleColumns.value)

    // filtros
    filters.value = (response.data.filters || []).map((filter) => ({
      ...filter,
      type: filter.type || 'select',
      loading: false,
      disabled: false,
    }))

    // defaults
    filters.value.forEach((filter) => {
      appliedFilters.value[filter.name] = filter.default || null
      if (filter.value === undefined || filter.value === null) {
        filter.value = filter.default ?? (filter.includeAllOption ? 'all' : null)
      }
    })

    // carga inicial de dependientes sin disparar fetch extra
    suppressFilterFetch.value = true
    try {
      for (const f of filters.value) {
        if (f.dependsOn) await loadDependentOptions(f)
      }
    } finally {
      suppressFilterFetch.value = false
    }

    headerButtons.value = response.data.headerButtons || []

    // Configuracion movil desde backend (opcional)
    if (response.data.mobileConfig) {
      mobileConfigBackend.value = response.data.mobileConfig
    }

    emit('ready')
    await fetchData()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const toggleColumn = (columnValue) => {
  const idx = visibleColumns.value.indexOf(columnValue)
  const updated = [...visibleColumns.value]
  if (idx > -1) {
    updated.splice(idx, 1)
  } else {
    updated.push(columnValue)
  }
  visibleColumns.value = updated
  updateVisibleColumns(updated)
}

const updateVisibleColumns = (selectedColumns) => {
  proxy.$api.post(`${props.resource}/update-visible-columns`, {
    table_name: tableName.value,
    visible_columns: selectedColumns,
  })

  columns.value = columnOptions.value
    .filter((c) => selectedColumns.includes(c.value) || lockedColumns.value.includes(c.value))
    .map((c) => ({
      name: c.value,
      label: c.label,
      align: c.align,
      field: c.value,
      sortable: c.sortable || false,
    }))
}

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    const { page, rowsPerPage, sortBy, descending } = pagination.value

    const response = await proxy.$api.post(`${props.resource}/records`, {
      tableName: tableName.value,
      page,
      rowsPerPage,
      sortBy,
      descending,
      filters: filters.value,
    })

    const rawRows = response.data.data.map((row) => ({
      ...row,
      actions: Array.isArray(row.actions)
        ? row.actions
            .filter(Boolean)
            .map((a) =>
              a && a.type === 'group'
                ? { ...a, buttons: Array.isArray(a.buttons) ? a.buttons.filter(Boolean) : [] }
                : a,
            )
        : [],
    }))

    rows.value = rawRows

    pagination.value.rowsNumber = response.data.meta.total
    pagination.value.rowsPerPage = response.data.meta.per_page
    pagination.value.sortBy = response.data.meta.sort_by
    pagination.value.descending = response.data.meta.descending
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// -------------------------
// Export + acciones
// -------------------------
const exportTableData = async () => {
  try {
    const { sortBy, descending } = pagination.value

    const response = await proxy.$api.post(
      `${props.resource}/export`,
      {
        filters: filters.value,
        visibleColumns: visibleColumns.value,
        sortBy,
        descending,
      },
      { responseType: 'blob' },
    )

    let filename = `${tableName.value || 'export'}.xlsx`
    const disposition = response.headers['content-disposition']
    if (disposition && disposition.includes('filename=')) {
      filename = disposition.split('filename=')[1].split(';')[0].replace(/['"]/g, '').trim()
    }

    const urlBlob = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = urlBlob
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(urlBlob)
  } catch {
    $q.notify({ type: 'error', message: proxy.$t('common.exportExcelError') })
  }
}

const performAction = (button, row) => {
  if (button.action === 'delete') {
    recordDeleteId.value = row.id
    refDialogDeleteForm.value.openDialog()
    return
  }

  if (button.action === 'active') {
    recordActiveId.value = row.id
    refDialogActiveForm.value.openDialog()
    return
  }

  emit('actions', {
    action: button.action,
    id: row.id,
    url: button.url,
  })
}

const performHeaderAction = (button) => {
  if (button.action === 'export') {
    exportTableData()
    return
  }

  if (button.action === 'refresh') {
    fetchData()
    return
  }

  emit('actions', {
    action: button.action,
    url: button.route,
  })
}

const successDelete = () => fetchData()
const successActive = () => fetchData()

const onRequest = (propsReq) => {
  pagination.value = {
    ...pagination.value,
    ...propsReq.pagination,
  }
  fetchData()
}

const filterData = () => {
  pagination.value.page = 1
  fetchData()
}

onMounted(() => {
  fetchColumnsAndData()
})

const getFilterValues = () => {
  return filters.value.map(f => ({ name: f.name, value: f.value }))
}

const setFilterValues = (savedFilters) => {
  if (!savedFilters || !Array.isArray(savedFilters)) return
  savedFilters.forEach(sf => {
    const filter = filters.value.find(f => f.name === sf.name)
    if (filter) filter.value = sf.value
  })
  filterData()
}

defineExpose({ filterData, getFilterValues, setFilterValues })
</script>

<template>
  <q-card class="x-table-server" flat>
    <q-card-section class="q-py-none x-table-server-title">
      <div class="text-h6">
        {{ tableTitle }}
        <q-badge v-if="tableBadge" :color="tableBadge.color" class="q-ml-sm text-body2 q-pa-xs">{{ tableBadge.label }}</q-badge>
      </div>
      <div>
        <template v-for="button in headerButtons" :key="button.action">
          <q-btn
            v-if="
              button.type === 'group' && Array.isArray(button.buttons) && button.buttons.length > 0
            "
            flat
            round
            no-caps
            :size="button.size"
            :icon="button.icon"
          >
            <q-menu auto-close>
              <q-list>
                <q-item
                  v-for="(subBtn, j) in button.buttons"
                  :key="j"
                  clickable
                  @click="performHeaderAction(subBtn)"
                >
                  <q-item-section avatar style="min-width: 36px !important">
                    <q-icon :name="subBtn.icon" size="20px" />
                  </q-item-section>
                  <q-item-section>
                    <span>{{ subBtn.label }}</span>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <template v-else>
            <q-btn
              v-if="button.label && !isMobileView"
              :color="button.color"
              :disable="button.disable"
              unelevated
              no-caps
              class="q-mr-xs"
              @click="performHeaderAction(button)"
            >
              <q-icon :name="button.icon" size="16px" class="q-mr-sm" />
              {{ button.label }}
              <q-tooltip v-if="button.tooltip">{{ button.tooltip }}</q-tooltip>
            </q-btn>

            <q-btn
              v-else
              :icon="button.icon"
              :color="button.color"
              :disable="button.disable"
              round
              flat
              no-caps
              @click="performHeaderAction(button)"
            >
              <q-tooltip>{{ button.tooltip || button.label }}</q-tooltip>
            </q-btn>
          </template>
        </template>

        <q-btn flat round no-caps icon="fa-light fa-columns-3">
          <q-menu class="column-visibility-menu">
            <q-list dense style="min-width: 180px">
              <q-item-label header class="text-caption text-weight-medium q-pb-xs">{{ $t('common.columns') }}</q-item-label>
              <q-item
                v-for="col in columnVisibleOptions"
                :key="col.value"
                clickable
                v-close-popup="false"
                @click="toggleColumn(col.value)"
                class="column-visibility-item"
              >
                <q-item-section side style="min-width: 24px; padding-right: 0;">
                  <q-icon
                    :name="visibleColumns.includes(col.value) ? 'fa-solid fa-check' : ''"
                    size="14px"
                    color="primary"
                  />
                </q-item-section>
                <q-item-section>{{ col.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-card-section>

    <q-card-section v-if="filters.length > 0" class="q-py-md">
      <div class="row q-col-gutter-md">
        <div v-for="filter in filters" :key="filter.name" :class="filter.class">
          <x-input
            v-if="filter.type === 'input'"
            v-model="filter.value"
            :label="filter.label"
            debounce="750"
            @update:model-value="filterData"
          />

          <div :class="filter.class" v-if="filter.name === 'period'">
            <div class="row q-col-gutter-x-sm q-col-gutter-y-sm">
              <div class="col" v-if="filter.options.length > 1">
                <x-select
                  v-model="filter.value"
                  :label="filter.label"
                  :options="filter.options"
                  @update:model-value="filterData"
                />
              </div>

              <template v-if="filter.value === 'date' || filter.value === 'between_dates'">
                <div class="col">
                  <x-datepicker
                    v-model="filter.dateStart"
                    :label="$t('components.dateFrom')"
                    @update:model-value="filterData"
                  />
                </div>
              </template>

              <template v-if="filter.value === 'between_dates'">
                <div class="col">
                  <x-datepicker
                    v-model="filter.dateEnd"
                    :label="$t('components.dateTo')"
                    @update:model-value="filterData"
                  />
                </div>
              </template>

              <template v-if="filter.value === 'month' || filter.value === 'between_months'">
                <div class="col">
                  <x-datepicker-month
                    v-model="filter.monthStart"
                    :label="$t('components.monthFrom')"
                    @update:model-value="filterData"
                  />
                </div>
              </template>

              <template v-if="filter.value === 'between_months'">
                <div class="col">
                  <x-datepicker-month
                    v-model="filter.monthEnd"
                    :label="$t('components.monthTo')"
                    @update:model-value="filterData"
                  />
                </div>
              </template>
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
            :include-all-option="
              filter.hasOwnProperty('includeAllOption') ? filter.includeAllOption : false
            "
            :placeholder="filter.placeholder || undefined"
            :stack-label="!!filter.placeholder"
            @update:model-value="onFilterChange(filter)"
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
            @update:model-value="onFilterChange(filter)"
          />
        </div>
      </div>
    </q-card-section>

    <!-- MOBILE HEADER (mismo estilo que thead de la tabla) -->
    <div v-if="isMobileView" class="x-table-mobile-header">
      <div class="text-caption">
        {{ pagination.rowsNumber }} registro{{ pagination.rowsNumber !== 1 ? 's' : '' }}
      </div>
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      dense
      :loading="loading"
      v-model:pagination="pagination"
      :rows-per-page-options="pagination.pageSizes"
      :hide-header="isMobileView"
      @request="onRequest"
    >
      <!-- MOBILE VIEW: Vista compacta con una sola fila -->
      <template v-if="isMobileView" v-slot:body="props">
        <q-tr
          class="cursor-pointer"
          :props="props"
          @click="openMobileActions(props.row)"
        >
          <q-td colspan="100%" class="q-py-sm">
            <div class="flex items-center">
              <!-- Columna izquierda -->
              <div class="col-shrink column q-mr-sm" style="min-width: 100px">
                <template v-for="(field, idx) in mobileLeftFields" :key="idx">
                  <div class="text-left">
                    <x-cell-renderer :cell="getMobileFieldValue(props.row, field)" />
                  </div>
                </template>
              </div>
              <!-- Columna derecha -->
              <div class="col column">
                <template v-for="(field, idx) in mobileRightFields" :key="idx">
                  <div
                    class="text-left"
                    :class="{ ellipsis: field.truncate }"
                    :style="field.truncate ? { maxWidth: field.truncate + 'px' } : {}"
                  >
                    <x-cell-renderer :cell="getMobileFieldValue(props.row, field)" />
                  </div>
                </template>
              </div>
              <!-- Icono de menu -->
              <div class="col-shrink q-ml-sm">
                <q-icon class="cursor-pointer" size="1.5em" name="fal fa-ellipsis-v" color="grey-7" />
              </div>
            </div>
          </q-td>
        </q-tr>
      </template>

      <!-- DESKTOP VIEW: Renderizado normal -->
      <template v-else v-slot:body-cell="props">
        <q-td :props="props">
          <x-cell-column-renderer :cell="props.value" :row="props.row" @refresh="fetchData" />
        </q-td>
      </template>

      <template v-if="!isMobileView" v-slot:body-cell-actions="props">
        <q-td :props="props">
          <template v-for="(action, idx) in (props.row.actions || []).filter(Boolean)" :key="idx">
            <q-btn
              v-if="
                action.type === 'group' &&
                Array.isArray(action.buttons) &&
                action.buttons.length > 0
              "
              flat
              round
              no-caps
              :size="action.size"
              :icon="action.icon"
            >
              <q-menu auto-close>
                <q-list>
                  <template v-for="(subBtn, j) in (action.buttons || []).filter(Boolean)" :key="j">
                    <q-separator v-if="subBtn.type === 'separator'" />
                    <q-item v-else clickable @click="performAction(subBtn, props.row)">
                      <q-item-section avatar style="min-width: 32px !important">
                        <q-icon :name="subBtn.icon" size="20px" :color="subBtn.color" />
                      </q-item-section>
                      <q-item-section>
                        <div class="x-menu-item-label" :title="subBtn.label">
                          {{ subBtn.label }}
                        </div>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-list>
              </q-menu>
            </q-btn>

            <q-btn
              v-else
              :icon="action.icon"
              :label="action.label"
              :color="action.color"
              :disable="action.disable"
              :size="action.size"
              :title="action.tooltip"
              flat
              round
              @click="performAction(action, props.row)"
            />
          </template>
        </q-td>
      </template>
    </q-table>

    <!-- Mobile Actions Menu (Bottom Sheet) -->
    <x-mobile-menu-action v-model="showMobileActions">
      <mobile-link-title
        :text-left="getDisplayText(selectedRow, mobileConfig.titleField)"
        :text-right="getDisplayText(selectedRow, mobileConfig.subtitleField)"
      />
      <!-- Botones directos (sin menú) en horizontal -->
      <q-item v-if="getDirectActions(selectedRow).length > 0">
        <q-item-section>
          <div class="row q-gutter-sm justify-center">
            <q-btn
              v-for="(action, idx) in getDirectActions(selectedRow)"
              :key="'direct-' + idx"
              :icon="action.icon"
              :color="action.color || 'grey-8'"
              :title="action.label"
              flat
              round
              size="md"
              @click="performMobileAction(action)"
            />
          </div>
        </q-item-section>
      </q-item>

      <!-- Separador si hay ambos tipos -->
      <q-separator v-if="getDirectActions(selectedRow).length > 0 && getGroupActions(selectedRow).length > 0" />

      <!-- Acciones de menú/grupo como lista vertical -->
      <q-item
        v-for="(action, idx) in getGroupActions(selectedRow)"
        :key="'group-' + idx"
        clickable
        v-ripple
        @click="performMobileAction(action)"
      >
        <q-item-section avatar style="min-width: 40px">
          <q-icon :name="action.icon" :color="action.color || 'grey-8'" />
        </q-item-section>
        <q-item-section>{{ action.label }}</q-item-section>
      </q-item>
    </x-mobile-menu-action>

    <q-card-section v-if="error" class="text-negative"> Error: {{ error }} </q-card-section>

    <x-dialog-delete
      ref="refDialogDeleteForm"
      :resource="resource"
      :record-id="recordDeleteId"
      action="delete"
      @success="successDelete"
    />

    <x-dialog-active
      ref="refDialogActiveForm"
      :resource="resource"
      :record-id="recordActiveId"
      action="active"
      @success="successActive"
    />
  </q-card>
</template>

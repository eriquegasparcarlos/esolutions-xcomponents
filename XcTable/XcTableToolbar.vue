<script setup>
import { ic } from '../icons/index.js'
/**
 * Bloque de acciones del compound XcTable (va en #actions del ReportView).
 * Reutiliza tal cual el control de columnas y el DIÁLOGO de exportación con
 * selección/reordenamiento de columnas del XTableServer (mismo x-dialog/x-button/
 * x-dnd, misma lógica buildExportItems/toggleAll/soloVisibles/confirmExport).
 */
import { inject, ref, computed } from 'vue'
import XDialog from '../XDialog/XDialog.vue'
import XButton from '../XButton/XButton.vue'
import XDnd from '../XDnd/XDnd.vue'

const ctx = inject('xctable')

/* ── Menú de columnas visibles ─────────────────────────────────────────── */
const columnVisibleOptions = computed(() =>
  (ctx.columnOptions.value || []).filter((c) => !c.locked)
)
function toggleColumn (name) {
  const set = new Set(ctx.visibleColumns.value)
  if (set.has(name)) set.delete(name)
  else set.add(name)
  ctx.visibleColumns.value = [...set]
}

/* ── Diálogo de exportación (selección + orden de columnas) ────────────── */
const showExportDialog = ref(false)
const exportColumnItems = ref([])

const exportableColumns = computed(() =>
  (ctx.columnOptions.value || []).filter((c) => c.exportable !== false)
)
const exportSelectedColumns = computed(() =>
  exportColumnItems.value.filter((i) => i.checked).map((i) => i.value)
)
const exportAllChecked = computed(() =>
  exportColumnItems.value.length > 0 && exportColumnItems.value.every((i) => i.checked)
)

// Construye la lista al abrir: guardadas (en su orden, marcadas) + resto (sin marcar).
function buildExportItems () {
  const cols = exportableColumns.value.length ? exportableColumns.value : ctx.columnOptions.value
  const saved = ctx.savedExportColumns.value || []
  const validSaved = saved.filter((v) => cols.some((c) => c.value === v))
  const rest = cols.filter((c) => !validSaved.includes(c.value)).map((c) => c.value)
  const ordered = [...validSaved, ...rest]
  exportColumnItems.value = ordered.map((v) => {
    const c = cols.find((x) => x.value === v)
    return { value: v, label: c ? c.label : v, checked: validSaved.length ? validSaved.includes(v) : true }
  })
}
function openExport () {
  buildExportItems()
  showExportDialog.value = true
}
function toggleExportAll (val) {
  exportColumnItems.value.forEach((i) => { i.checked = !!val })
}
function exportOnlyVisible () {
  exportColumnItems.value.forEach((i) => { i.checked = ctx.visibleColumns.value.includes(i.value) })
}
async function confirmExport () {
  if (!exportSelectedColumns.value.length) return
  const selected = exportSelectedColumns.value.slice()
  const ok = await ctx.exportData(selected)
  if (ok) ctx.savedExportColumns.value = selected  // el diálogo queda abierto para reexportar
}

/* Intercepta las acciones internas igual que el XTableServer:
   'export' abre el diálogo, 'refresh' recarga; el resto se emite al consumidor. */
function onHeaderAction (button) {
  if (button.action === 'export') { openExport(); return }
  if (button.action === 'refresh') { ctx.fetch(); return }
  ctx.performHeaderAction(button)
}
</script>

<template>
  <div class="row items-center no-wrap q-gutter-x-xs">
    <!-- Botones del backend (headerButtons): grupo=dropdown, icon+label, o icon-only.
         'export'→diálogo y 'refresh'→recargar se interceptan aquí (igual que XTableServer). -->
    <template v-for="button in ctx.headerButtons.value" :key="button.action">
      <q-btn
        v-if="button.type === 'group' && Array.isArray(button.buttons) && button.buttons.length > 0"
        flat round no-caps :size="button.size" :icon="ic(button.icon)"
      >
        <q-menu auto-close>
          <q-list>
            <q-item v-for="(subBtn, j) in button.buttons" :key="j" clickable
                    @click="onHeaderAction(subBtn)">
              <q-item-section avatar style="min-width: 36px !important">
                <q-icon :name="ic(subBtn.icon)" size="20px" />
              </q-item-section>
              <q-item-section><span>{{ subBtn.label }}</span></q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-btn
        v-else-if="button.label"
        :color="button.color" :disable="button.disable"
        unelevated no-caps
        @click="onHeaderAction(button)"
      >
        <q-icon :name="ic(button.icon)" size="16px" class="q-mr-sm" />
        {{ button.label }}
        <q-tooltip v-if="button.tooltip">{{ button.tooltip }}</q-tooltip>
      </q-btn>

      <q-btn
        v-else
        :icon="ic(button.icon)" :color="button.color" :disable="button.disable"
        round flat no-caps
        @click="onHeaderAction(button)"
      >
        <q-tooltip>{{ button.tooltip || button.label }}</q-tooltip>
      </q-btn>
    </template>

    <!-- Único control fijo (igual que XTableServer): selector de columnas -->
    <q-btn flat round no-caps :icon="ic('columns')">
      <q-tooltip>Columnas</q-tooltip>
      <q-menu class="column-visibility-menu">
        <q-list dense style="min-width: 180px; max-height: 320px; overflow-y: auto;">
          <q-item-label header class="text-caption text-weight-medium q-pb-xs">
            {{ $t('common.columns') }}
          </q-item-label>
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
                :name="ctx.visibleColumns.value.includes(col.value) ? ic('selected') : ''"
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

  <!-- Exportar: selección + orden de columnas (movido del XTableServer) -->
  <x-dialog
    v-model="showExportDialog"
    title="Exportar a Excel"
    width="420px"
    show-button-close
    @action-button-close="showExportDialog = false"
  >
    <template #content>
      <div class="relative-position">
        <q-inner-loading :showing="ctx.exporting.value" label="Generando Excel…" color="primary" style="z-index: 10;" />
        <div class="row items-center justify-between q-mb-xs">
          <q-checkbox
            :model-value="exportAllChecked"
            label="Seleccionar todas"
            dense
            @update:model-value="toggleExportAll"
          />
          <x-button flat dense label="Solo visibles" @click="exportOnlyVisible" />
        </div>
        <div class="text-caption text-grey-6 q-mb-xs">
          Arrastra <q-icon :name="ic('drag')" size="14px" /> para ordenar cómo salen en el archivo.
        </div>
        <q-separator class="q-mb-sm" />
        <div style="max-height: 320px; overflow-y: auto;">
          <x-dnd v-model="exportColumnItems" item-key="value" handle=".x-export-drag">
            <template #item="{ element }">
              <div class="row items-center no-wrap q-py-xs">
                <q-icon :name="ic('drag')" size="18px"
                        class="x-export-drag text-grey-5 q-mr-xs" style="cursor: move;" />
                <q-checkbox v-model="element.checked" dense />
                <span class="q-ml-sm">{{ element.label }}</span>
              </div>
            </template>
          </x-dnd>
        </div>
        <div v-if="!exportSelectedColumns.length" class="text-caption text-negative q-mt-xs">
          Selecciona al menos una columna.
        </div>
      </div>
    </template>

    <template #action-buttons>
      <x-button flat label="Cancelar" :disable="ctx.exporting.value" @click="showExportDialog = false" />
      <x-button unelevated color="primary" label="Exportar"
                :loading="ctx.exporting.value"
                :disable="ctx.exporting.value || !exportSelectedColumns.length" @click="confirmExport" />
    </template>
  </x-dialog>
</template>

<script setup>
/**
 * Bloque de tabla del compound XTable. Solo renderiza la grilla (q-table server-side)
 * a partir del estado del provider. La paginación/orden se delega al backend vía @request.
 */
import { inject } from 'vue'
const ctx = inject('xctable')

function onRequest (req) {
  const { page, rowsPerPage, sortBy, descending } = req.pagination
  ctx.setPagination({ page, rowsPerPage, sortBy, descending })
}
</script>

<template>
  <q-table
    flat
    :rows="ctx.rows.value"
    :columns="ctx.columns.value"
    :visible-columns="ctx.visibleColumns.value"
    row-key="id"
    :loading="ctx.loading.value"
    :pagination="ctx.pagination"
    :rows-per-page-options="ctx.pagination.pageSizes"
    @request="onRequest"
  >
    <template #no-data>
      <div class="full-width text-center q-pa-xl text-grey-6">
        <q-icon name="fa-light fa-inbox" size="2.5em" color="grey-4" />
        <div class="q-mt-sm">{{ ctx.config.noDataLabel }}</div>
      </div>
    </template>
  </q-table>
</template>

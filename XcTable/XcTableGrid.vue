<script setup>
import { ic } from '../icons/index.js'
/**
 * Bloque de tabla del compound XTable. Solo renderiza la grilla (q-table server-side)
 * a partir del estado del provider. La paginación/orden se delega al backend vía @request.
 */
import { inject } from 'vue'
import XCellColumnRenderer from '../XTableServer/XCellColumnRenderer.vue'

const ctx = inject('xctable')

function onRequest (req) {
  const { page, rowsPerPage, sortBy, descending } = req.pagination
  ctx.setPagination({ page, rowsPerPage, sortBy, descending })
}

/*
| `@update:pagination` NO es opcional aunque la paginación sea del servidor: sin ningún
| listener, QTable ignora la prop `pagination` por completo y trabaja sobre la copia que
| tomó al montarse — cuando `rowsNumber` todavía valía 0, porque la respuesta no había
| llegado. El resultado era un pie que decía siempre "1-0 de 0" y controles de página
| muertos, con la tabla mostrando bien sus filas. Es el mismo motivo por el que
| XTableServer usa `v-model:pagination`.
*/
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
    @update:pagination="(value) => Object.assign(ctx.pagination, value)"
  >
    <!--
      Las celdas llegan FORMATEADAS desde el backend ({ type_input, value, ... }), no como
      valores planos: sin este slot QTable las pinta en blanco y la tabla se ve vacía
      aunque la respuesta traiga filas. Es el mismo renderer que usa XTableServer.
    -->
    <template #body-cell="props">
      <q-td :props="props" :class="props.row._row_class">
        <x-cell-column-renderer :cell="props.value" :row="props.row" @refresh="ctx.fetch" />
      </q-td>
    </template>

    <template #no-data>
      <div class="full-width text-center q-pa-xl text-grey-6">
        <q-icon :name="ic('empty')" size="2.5em" color="grey-4" />
        <div class="q-mt-sm">{{ ctx.config.noDataLabel }}</div>
      </div>
    </template>
  </q-table>
</template>

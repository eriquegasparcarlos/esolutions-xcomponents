<script setup>
/**
 * Provider del compound XTable (patrón headless / compound component).
 * Mantiene el estado (datos, filtros, paginación) y lo PROVIDE a sus bloques hijos
 * (XTableFilters, XTableToolbar, XTableGrid), que se posicionan libremente dentro
 * (p. ej. en los slots de ReportView). Emite `loaded` con la respuesta completa
 * (data + meta) → el consumidor arma KPIs sin consulta extra.
 *
 * Convive con el XTableServer monolítico: no lo reemplaza; es un modo alternativo.
 */
import { provide, onMounted, getCurrentInstance } from 'vue'
import { useXcTable } from './useXcTable.js'

const props = defineProps({
  resource: { type: String, required: true },
})
const emit = defineEmits(['loaded', 'action'])

// http client: el app registra `$api` como propiedad global (boot/axios). Desacopla
// el composable del paquete de cualquier import de `boot/*` del consumidor.
const { proxy } = getCurrentInstance()
const ctx = useXcTable(props.resource, (data) => emit('loaded', data), proxy.$api)
// Los headerButtons del backend emiten su acción al consumidor (misma semántica que XTableServer).
ctx.setActionHandler((payload) => emit('action', payload))
provide('xctable', ctx)

onMounted(() => ctx.init())

// Exponer para el consumidor (refrescar/exportar desde afuera si lo necesita).
defineExpose({ refresh: ctx.fetch, exportData: ctx.exportData, clearFilters: ctx.clearFilters })
</script>

<template>
  <slot />
</template>

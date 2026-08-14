# XcTable (compound)

Datatable **headless / compound** con paginación server-side. Es el mismo motor que `XTableServer`
(mismo contrato de API) pero **partido en bloques posicionables**: vos decidís dónde va la barra de
botones, los filtros, los KPIs y la tabla. Ideal para layouts tipo dashboard/reporte donde el orden
fijo del monolito no alcanza.

> **Nombre**: `Xc` = *compound*. No confundir con `XTable` / `XTableCard` / `XTableServer` (otros tres
> componentes del paquete).

## Piezas

| Pieza | Rol |
|-------|-----|
| `XcTable` | **Provider**. Mantiene el estado (datos, filtros, paginación) y lo comparte por `provide/inject`. Envuelve a los demás bloques. |
| `XcTableToolbar` | Botones del header: los `headerButtons` del backend + refrescar/exportar (con modal de columnas) + selector de columnas. |
| `XcTableFilters` | Barra de filtros. Renderiza los filtros del backend reusando `XInput`/`XSelect`/`XDatepicker`/`XDatepickerMonth`/`XTreeSelect`. |
| `XcTableGrid` | Solo la tabla (`q-table` server-side). |
| `useXcTable` | Composable con toda la lógica (habla con el backend). Normalmente no se usa directo; lo instancia `XcTable`. |

## Instalación

```vue
<script setup>
import XcTable from 'components/XcTable/XcTable.vue'
import XcTableToolbar from 'components/XcTable/XcTableToolbar.vue'
import XcTableFilters from 'components/XcTable/XcTableFilters.vue'
import XcTableGrid from 'components/XcTable/XcTableGrid.vue'
</script>
```

> **HTTP client**: `XcTable` toma el cliente HTTP de `proxy.$api` (propiedad global que el app registra
> en su boot de axios, ej. `app.config.globalProperties.$api = api`). No importa `boot/axios` — funciona
> en cualquier app que exponga `$api`.

## Contrato del backend

Igual que `XTableServer`. Para un `resource="app-api/reports/kardex"` el backend debe exponer:

| Método | Endpoint | Devuelve |
|--------|----------|----------|
| `GET`  | `{resource}/init-data-table` | `{ tableName, tableTitle, tableSubtitle, columns[], filters[], visibleColumns[], exportColumns[], pagination, headerButtons[] }` |
| `POST` | `{resource}/records` | `{ data[], meta: { total, summary? }, widgets? }` (body: `{ tableName, page, rowsPerPage, sortBy, descending, filters }`) |
| `POST` | `{resource}/export` | Blob Excel (opcional) |
| `POST` | `{resource}/update-visible-columns` | ok (opcional) |

En Laravel se genera con el trait `PaginationTenantTrait` de `esolutions/datatable` (`initTable` /
`getRecords` / `export` / `updateVisibleColumns`). Los filtros mandan su ancho responsive en `class`
(grid de 24 col, ej. `col-24 col-sm-6`).

## Props (`XcTable`)

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `resource` | `String` | *required* | Ruta base del recurso API |

## Eventos (`XcTable`)

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `loaded` | `data` (respuesta completa `records`: `{ data, meta, widgets }`) | Tras cada carga. Úsalo para armar **KPIs/gráficos sin consulta extra** (leé `data.meta.summary`). |
| `action` | `{ action, url, button }` | Cuando el usuario toca un `headerButton` del backend (excepto `refresh`/`export`, que se manejan solos). |

## Métodos expuestos (`XcTable`)

```javascript
const t = ref(null)
t.value.refresh()      // recarga con los filtros actuales
t.value.exportData()   // exporta a Excel
t.value.clearFilters() // limpia filtros y recarga
```

## Uso básico

```vue
<template>
  <xc-table resource="app-api/reports/kardex" @loaded="onLoaded">
    <!-- Colocá cada bloque DONDE QUIERAS (aquí dentro de XReportView) -->
    <x-report-view :breadcrumb="breadcrumb" title="Kardex" :kpis="kpis">
      <template #actions><xc-table-toolbar /></template>
      <template #filters><xc-table-filters /></template>
      <xc-table-grid />   <!-- la tabla -->
    </x-report-view>
  </xc-table>
</template>

<script setup>
import { ref } from 'vue'
import XReportView from 'components/XReportView/XReportView.vue'
import XcTable from 'components/XcTable/XcTable.vue'
import XcTableToolbar from 'components/XcTable/XcTableToolbar.vue'
import XcTableFilters from 'components/XcTable/XcTableFilters.vue'
import XcTableGrid from 'components/XcTable/XcTableGrid.vue'

const kpis = ref([])
// KPIs desde la MISMA respuesta (meta.summary), sin pedir datos otra vez:
function onLoaded (data) {
  const s = data?.meta?.summary
  kpis.value = s ? [{ label: 'Movimientos', value: s.movements }] : []
}
</script>
```

Los bloques se comunican solos por `inject('xctable')` — no hay que pasar props entre ellos: basta con
que estén **dentro** de `<xc-table>` (a cualquier profundidad).

## `XcTable` vs `XTableServer`

| | XTableServer | XcTable |
|---|---|---|
| Layout | Fijo (título+botones → filtros → tabla) | **Libre**: cada bloque donde quieras |
| Backend | Mismo contrato | Mismo contrato |
| KPIs/gráfico intercalados | No | **Sí** (evento `loaded` + bloques sueltos) |
| Cuándo usarlo | CRUD/listado estándar | Reportes/dashboards con KPIs y layout propio |

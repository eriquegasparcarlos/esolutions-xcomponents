# XReportView

Plantilla de **página de reporte** (estilo Alegra): cabecera con breadcrumb + título/subtítulo, fila de
botones de acción, barra de filtros, fila de KPIs, gráfico opcional y la tabla. Es puramente
**presentacional** — vos ponés los datos por props y slots. Pensado para combinarse con
[`XcTable`](../XcTable/README.md), pero funciona con cualquier tabla.

## Instalación

```vue
<script setup>
import XReportView from 'components/XReportView/XReportView.vue'
</script>
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `breadcrumb` | `Array` | `[]` | Migas: `[{ label, to? }]`. La última sin `to`. `to` navega con `router.push`. |
| `title` | `String` | `''` | Título. **Fallback**: si está dentro de un `<xc-table>`, usa `tableTitle` del backend. |
| `description` | `String` | `''` | Subtítulo. **Fallback**: `tableSubtitle` del backend. |
| `kpis` | `Array` | `[]` | Tarjetas KPI: `[{ label, value, hint?, accent? }]`. Vacío = no se muestra la fila. |
| `bare` | `Boolean` | `false` | Si `true`, el slot de tabla **no** se envuelve en tarjeta (para páginas con layout propio). |

> Título/subtítulo: si el componente está dentro de `<xc-table>`, toma `tableTitle`/`tableSubtitle` del
> `init-data-table` (inject); el prop es el respaldo. Si se usa suelto, manda el prop.

## Slots

| Slot | Descripción |
|------|-------------|
| `#actions` | Botones a la derecha del título (ej. `<xc-table-toolbar />`). |
| `#filters` | Barra de filtros (ej. `<xc-table-filters />`). Se envuelve en tarjeta blanca. |
| `#chart` | Gráfico opcional. Si se provee, se muestra una tarjeta de gráfico. |
| *default* | La tabla (`<xc-table-grid />`, `XTableServer`, u otra). |

## Uso básico

```vue
<template>
  <x-report-view
    :breadcrumb="[{ label: 'Reportes', to: { name: 'reports-hub' } }, { label: 'Ventas' }, { label: 'Cotizaciones' }]"
    title="Cotizaciones"
    description="Cotizaciones emitidas en el periodo."
    :kpis="kpis"
  >
    <template #actions><xc-table-toolbar /></template>
    <template #filters><xc-table-filters /></template>
    <template #chart>…gráfico opcional…</template>
    <xc-table-grid />
  </x-report-view>
</template>
```

Para el ejemplo completo con datos (KPIs desde `meta.summary`, filtros, export) ver
[`XcTable`](../XcTable/README.md).

## Formato de un KPI

```js
{
  label: 'Total (S/)',   // texto arriba
  value: 'S/ 1,162.80',  // valor grande
  accent: '#16a34a',     // color del valor (opcional)
  hint: 'Suma en soles', // tooltip (icono i) (opcional)
}
```

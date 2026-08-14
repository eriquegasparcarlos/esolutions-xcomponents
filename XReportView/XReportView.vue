<script setup>
/**
 * Plantilla REUTILIZABLE de vista de reporte (estilo Alegra).
 * Presentacional: cabecera + breadcrumb + acciones + barra de filtros + fila de
 * KPIs + gráfico + tabla. La lógica/datos los pone el consumidor por slots/props.
 *
 * Props:
 *   breadcrumb: [{ label, to? }]  — migas (la última sin `to`)
 *   title, description
 *   kpis: [{ label, value, hint?, accent? }]  — fila de tarjetas KPI
 * Slots:
 *   #actions  — botones a la derecha de la cabecera (Descargar, Actualizar…)
 *   #filters  — barra de filtros
 *   #chart    — gráfico (si se provee, se muestra la tarjeta de gráfico)
 *   default   — la tabla (XTableServer u otro)
 */
import { inject, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  breadcrumb: { type: Array, default: () => [] },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  kpis: { type: Array, default: () => [] },
  // bare: el slot de tabla NO se envuelve en tarjeta (para páginas que ya traen su
  // propio layout de cuerpo — filtros/KPIs/tabla propios).
  bare: { type: Boolean, default: false },
})

// Si estamos dentro de un compound XcTable, el título/subtítulo vienen del backend
// (init-data-table). Backend manda; el prop de la página es fallback. Null-safe para
// las páginas que usan ReportView sin compound (XTableServer u otro).
const ctx = inject('xctable', null)
const displayTitle = computed(() => ctx?.config.tableTitle || props.title)
const displayDescription = computed(() => ctx?.config.tableSubtitle || props.description)

const router = useRouter()
const go = (to) => { if (to) router.push(to) }
</script>

<template>
  <q-page class="rv-page">
    <!-- Breadcrumb -->
    <nav v-if="breadcrumb.length" class="rv-crumbs">
      <template v-for="(c, i) in breadcrumb" :key="i">
        <a v-if="c.to" class="rv-crumb rv-crumb--link" @click.prevent="go(c.to)">{{ c.label }}</a>
        <span v-else class="rv-crumb">{{ c.label }}</span>
        <span v-if="i < breadcrumb.length - 1" class="rv-crumb-sep">›</span>
      </template>
    </nav>

    <!-- Cabecera -->
    <header class="rv-head">
      <div class="rv-head__text">
        <h1 class="rv-title">{{ displayTitle }}</h1>
        <p v-if="displayDescription" class="rv-desc">{{ displayDescription }}</p>
      </div>
      <div class="rv-head__actions">
        <slot name="actions" />
      </div>
    </header>

    <!-- Barra de filtros (con tarjeta) -->
    <div v-if="$slots.filters" class="rv-filters">
      <slot name="filters" />
    </div>

    <!-- KPIs (fila completa, arriba del gráfico) -->
    <div v-if="kpis.length" class="rv-kpis">
      <div v-for="(k, i) in kpis" :key="i" class="rv-kpi">
        <div class="rv-kpi__label">
          {{ k.label }}
          <q-icon v-if="k.hint" name="info" size="14px" class="rv-kpi__hint">
            <q-tooltip>{{ k.hint }}</q-tooltip>
          </q-icon>
        </div>
        <div class="rv-kpi__value" :style="k.accent ? { color: k.accent } : null">{{ k.value }}</div>
      </div>
    </div>

    <!-- Gráfico (opcional) -->
    <section v-if="$slots.chart" class="rv-card rv-chart">
      <slot name="chart" />
    </section>

    <!-- Tabla (con tarjeta o "bare" según el consumidor) -->
    <section v-if="!bare" class="rv-card rv-table">
      <slot />
    </section>
    <slot v-else />
  </q-page>
</template>

<style scoped>
.rv-page { padding: 22px 22px; }

/* Breadcrumb */
.rv-crumbs { display: flex; align-items: center; gap: 8px; margin-bottom: 22px; font-size: 13px; flex-wrap: wrap; }
.rv-crumb { color: #64748b; }
.rv-crumb--link { color: #2563eb; cursor: pointer; }
.rv-crumb--link:hover { text-decoration: underline; }
.rv-crumb-sep { color: #cbd5e1; }

/* Cabecera */
/* 2 columnas: izquierda (título + subtítulo apilados), derecha (botones) */
.rv-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
.rv-head__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.rv-title { font-size: 23px; font-weight: 700; color: #0f172a; margin: 0; line-height: 1.2; }
.rv-desc { font-size: 14px; color: #64748b; margin: 0; max-width: 720px; line-height: 1.35; }
.rv-head__actions { display: flex; align-items: center; gap: 8px; padding-top: 2px; }

/* Filtros — en tarjeta blanca (mismo respiro interior que la tabla) */
/* Bloque (NO flex): el .row de XcTableFilters maqueta con filter.class (grid Quasar).
   El q-col-gutter-sm ya compensa con su margin negativo → inset simétrico. */
.rv-filters {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
  padding: 8px;
  margin-bottom: 16px;
}
/* Controles con fondo blanco (no transparentes) */
.rv-filters :deep(.q-field__control) { background: #fff; }

/* KPIs (fila completa) */
.rv-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}
.rv-kpi {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
  padding: 16px 18px;
}
.rv-kpi__label { font-size: 13px; color: #64748b; margin-bottom: 6px; display: flex; align-items: center; gap: 4px; }
.rv-kpi__hint { color: #94a3b8; cursor: help; }
.rv-kpi__value { font-size: 24px; font-weight: 700; color: #0f172a; line-height: 1.1; }

/* Tarjetas */
.rv-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; }
.rv-chart { padding: 18px 18px 8px; margin-bottom: 18px; }
.rv-table { padding: 8px; }
</style>

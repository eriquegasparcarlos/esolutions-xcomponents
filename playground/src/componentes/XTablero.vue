<script setup>
import { ref } from 'vue'
import Seccion from '../components/Seccion.vue'
import XStatCard from '@x/XStatCard/XStatCard.vue'
import XCallout from '@x/XCallout/XCallout.vue'
import XPeriodFilterInline from '@x/XPeriodFilter/XPeriodFilterInline.vue'

const periodo = ref({ value: 'between_dates', dateStart: '2026-09-01', dateEnd: '2026-09-29' })
const ultimoCambio = ref(null)
</script>

<template>
  <Seccion
    titulo="XStatCard · tarjeta de un número"
    nota="primary sigue la marca (--x-brand); null se pinta como —; loading = esqueleto"
    :cubre="['XStatCard']"
  >
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-3">
        <XStatCard
          icon="chart" tone="primary" title="Ventas de hoy"
          value="S/ 1,240.00" delta="12 %" delta-tone="positive" delta-icon="up"
          caption="18 comprobantes" help="Sin notas de crédito ni anulados."
        />
      </div>
      <div class="col-12 col-md-3">
        <XStatCard
          icon="user" tone="teal" title="Clientes nuevos"
          :value="7" delta="3 %" delta-tone="negative" delta-icon="down"
          caption="Frente a la semana pasada"
        />
      </div>
      <div class="col-12 col-md-3">
        <XStatCard icon="warning" tone="amber" title="Por vencer" :value="null" delta="5 de 7" caption="Sin dato aún" />
      </div>
      <div class="col-12 col-md-3">
        <XStatCard icon="calendar" tone="purple" title="Cargando" loading />
      </div>
    </div>
  </Seccion>

  <Seccion
    titulo="XCallout · avisos al estilo GitHub"
    nota="note / tip / important / warning / caution; un tipo desconocido cae a note"
    :cubre="['XCallout']"
  >
    <div style="display:flex; flex-direction:column; gap:10px">
      <XCallout type="note">Los comprobantes se envían a SUNAT al emitir.</XCallout>
      <XCallout type="tip" title="Buen ritmo">Esta semana ya llevas 10 ventas más que la pasada.</XCallout>
      <XCallout type="important">La serie F001 ya emitió comprobantes: no se puede borrar.</XCallout>
      <XCallout type="warning" dense>El certificado digital vence en 12 días.</XCallout>
      <XCallout type="caution">Anular no se puede deshacer.</XCallout>
      <XCallout type="inventado">Tipo mal escrito: cae a nota, no a verde.</XCallout>
    </div>
  </Seccion>

  <Seccion
    titulo="XPeriodFilterInline · filtro de período"
    nota="el mismo que usan XTableServer y XcTable; se acomoda al ancho de su columna"
    :cubre="['XPeriodFilterInline']"
  >
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <XPeriodFilterInline v-model="periodo" @change="(v) => (ultimoCambio = v)" />
      </div>
      <div class="col-12 col-md-3">
        <!-- Columna angosta: el modo baja a su fila y las dos fechas quedan juntas. -->
        <XPeriodFilterInline v-model="periodo" />
      </div>
      <div class="col-12 col-sm-auto">
        <!-- Columna ajustada al contenido: como XcTable cuando el filtro no trae clase. -->
        <XPeriodFilterInline v-model="periodo" />
      </div>
    </div>
    <pre style="font-size:12px">{{ ultimoCambio }}</pre>
  </Seccion>
</template>

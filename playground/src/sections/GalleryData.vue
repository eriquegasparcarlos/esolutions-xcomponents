<script setup>
import Seccion from '../components/Seccion.vue'
// XTableServer contra el MOCK: ejerce el contrato real (init-data-table +
// records), asi que paginacion, filtros, orden, loading, vacio y error se
// comportan igual que contra Laravel — sin backend ni red.
import XTableServer from '@x/XTableServer/XTableServer.vue'
</script>

<template>
  <Seccion titulo="Tabla con backend" nota="XTableServer + mock del contrato" :cubre="['XTableServer']">
    <p style="margin:-6px 0 14px; font-size:12px; color:#64748b">
      Probá paginar, ordenar por columna, buscar y filtrar por estado: todo lo
      resuelve el mock en JS. Con los chips del panel podés forzar
      <strong>vacio</strong>, <strong>error 500</strong>,
      <strong>respuesta lenta</strong> y <strong>10.000 filas</strong>.
    </p>
    <XTableServer resource="/playground" />
  </Seccion>
</template>

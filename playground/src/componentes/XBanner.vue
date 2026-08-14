<script setup>
import Seccion from '../components/Seccion.vue'
import XBanner from '@x/XBanner/XBanner.vue'

</script>

<template>
  <Seccion titulo="XBanner · tipos" nota="success / warning / error / information" :cubre="['XBanner']">
    <div style="display:flex; flex-direction:column; gap:10px">
      <XBanner type="success" label="Comprobante aceptado por SUNAT." />
      <XBanner type="warning" label="El certificado vence en 15 dias." />
      <XBanner type="error" label="Rechazado: el RUC del receptor no existe." />
      <XBanner type="information" label="Los tokens se aplican en runtime, sin recompilar Sass." />
    </div>
  </Seccion>
</template>

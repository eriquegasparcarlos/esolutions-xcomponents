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

  <Seccion
    titulo="XBanner · colores propios"
    nota="bg-color / text-color: paleta de Quasar o color CSS (Quasar no acepta hexa en sus clases bg-*)"
    :cubre="['XBanner']"
  >
    <div style="display:flex; flex-direction:column; gap:10px">
      <XBanner bg-color="grey-3" text-color="grey-9" label="Paleta de Quasar: grey-3 / grey-9" />
      <XBanner bg-color="#FFF8E1" text-color="#8D6E63" label="Hexadecimal: #FFF8E1 / #8D6E63" />
      <XBanner
        bg-color="var(--x-brand-light, #E3F2FD)"
        text-color="var(--x-brand, #1565C0)"
        label="Variable del tema: var(--x-brand)"
      />
      <XBanner type="warning" bg-color="grey-2" label="type + bg-color: pisa solo el fondo" />
    </div>
  </Seccion>
</template>

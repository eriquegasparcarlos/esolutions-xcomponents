<script setup>
import { ref } from 'vue'
import XCard from '@x/XCard/XCard.vue'
import XBadge from '@x/XBadge/XBadge.vue'
import XBanner from '@x/XBanner/XBanner.vue'
import XToggle from '@x/XToggle/XToggle.vue'

const t = ref(true)
</script>

<template>
  <section class="pg-section">
    <h3>Superficies <code>.x-card · --x-surface · --x-radius</code></h3>
    <div class="pg-demo">
      <XCard title="Comprobante" subtitle="F001-000123" bordered style="width:250px">
        <div style="font-size:13px">Emitido y aceptado por SUNAT.</div>
      </XCard>
      <XCard title="Sin borde" subtitle="flat" flat style="width:250px">
        <div style="font-size:13px">Variante <code>flat</code>.</div>
      </XCard>
    </div>
  </section>

  <section class="pg-section">
    <h3>Badges <code>.x-badge · variantes sm / md / lg / pill</code></h3>
    <div class="pg-demo">
      <div v-for="tipo in ['success', 'warning', 'danger', 'info']" :key="tipo" class="pg-tile">
        <XBadge :label="tipo" :type="tipo" />
        <code>{{ tipo }}</code>
      </div>
    </div>
    <div class="pg-demo" style="margin-top:12px">
      <div v-for="v in ['x-badge-sm', 'x-badge-md', 'x-badge-lg', 'x-badge-pill']" :key="v" class="pg-tile">
        <XBadge label="Aceptado" type="success" :class="v" />
        <code>.{{ v }}</code>
      </div>
    </div>
  </section>

  <section class="pg-section">
    <h3>Toggle <code>.x-toggle · 6 colores + 3 tamaños</code></h3>
    <div class="pg-demo">
      <div v-for="c in ['primary', 'secondary', 'success', 'error', 'warning', 'info']" :key="c" class="pg-tile">
        <XToggle v-model="t" :class="`x-toggle-${c}`" />
        <code>.x-toggle-{{ c }}</code>
      </div>
    </div>
    <div class="pg-demo" style="margin-top:12px">
      <div v-for="s in ['sm', 'md', 'lg']" :key="s" class="pg-tile">
        <XToggle v-model="t" :class="`x-toggle-${s}`" />
        <code>.x-toggle-{{ s }}</code>
      </div>
    </div>
  </section>

  <section class="pg-section">
    <h3>Banner <code>success / warning / error / information</code></h3>
    <div style="display:flex; flex-direction:column; gap:10px">
      <XBanner type="success" label="Comprobante aceptado por SUNAT." />
      <XBanner type="warning" label="El certificado vence en 15 dias." />
      <XBanner type="error" label="Rechazado: el RUC del receptor no existe." />
      <XBanner type="information" label="Los tokens se aplican en runtime, sin recompilar Sass." />
    </div>
  </section>
</template>

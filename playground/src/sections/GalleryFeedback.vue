<script setup>
import { ref } from 'vue'
import XCard from '@x/XCard/XCard.vue'
import XBadge from '@x/XBadge/XBadge.vue'
import XDialog from '@x/XDialog/XDialog.vue'
import XButton from '@x/XButton/XButton.vue'
import XDropdownMenu from '@x/XDropdownMenu/XDropdownMenu.vue'
import XDropdownItem from '@x/XDropdownMenu/XDropdownItem.vue'
import XDropdownDivider from '@x/XDropdownMenu/XDropdownDivider.vue'
import XBanner from '@x/XBanner/XBanner.vue'

const abierto = ref(false)
</script>

<template>
  <section class="pg-section">
    <h3>Superficies y estado <code>--x-surface · --x-border · --x-text</code></h3>
    <div class="pg-demo">
      <XCard title="Comprobante" subtitle="F001-000123" bordered style="width:250px">
        <div style="font-size:13px">Emitido y aceptado por SUNAT.</div>
      </XCard>

      <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:flex-start">
        <XBadge label="Aceptado" type="success" />
        <XBadge label="Pendiente" type="warning" />
        <XBadge label="Rechazado" type="danger" />
        <XBadge label="Info" type="info" />
      </div>
    </div>

    <div class="pg-demo" style="margin-top:14px">
      <!-- XBanner usa `label` (no `message`) y su tipo es `information` (no `info`) -->
      <XBanner type="information" label="Los tokens se aplican en runtime, sin recompilar Sass." />
    </div>
  </section>

  <section class="pg-section">
    <h3>Capas flotantes <code>--x-radius-md (dialogo) · --x-radius-lg (menu)</code></h3>
    <div class="pg-demo">
      <XButton label="Abrir dialogo" variant="primary" @click="abierto = true" />

      <XDropdownMenu>
        <template #trigger>
          <XButton label="Menu desplegable" variant="secondary" icon-right="fa-light fa-chevron-down" />
        </template>
        <XDropdownItem label="Ver detalle" icon="fa-light fa-eye" />
        <XDropdownItem label="Descargar XML" icon="fa-light fa-file-code" />
        <XDropdownDivider />
        <XDropdownItem label="Anular" icon="fa-light fa-trash" class="x-dropdown-item--danger" />
      </XDropdownMenu>
    </div>

    <XDialog v-model="abierto" title="Nuevo comprobante" width="460px" show-button-close
             @action-button-close="abierto = false">
      <template #content>
        <p style="margin:0 0 10px; font-size:13px">
          Este dialogo usa <code>--x-radius-md</code>. Move el control en el panel
          y mira las esquinas cambiar en vivo.
        </p>
      </template>
      <template #action-buttons>
        <XButton label="Cancelar" variant="secondary" @click="abierto = false" />
        <XButton label="Guardar" variant="primary" @click="abierto = false" />
      </template>
    </XDialog>
  </section>
</template>

<script setup>
import Seccion from '../components/Seccion.vue'
import { ref } from 'vue'
import XTracking from '@x/XTracking/XTracking.vue'
import XButtonToggle from '@x/XButtonToggle/XButtonToggle.vue'
import XOptionCard from '@x/XOptionCard/XOptionCard.vue'
import XOptionCardGroup from '@x/XOptionCard/XOptionCardGroup.vue'
import XTokenDisplay from '@x/XTokenDisplay/XTokenDisplay.vue'
import XVerifiedBadge from '@x/XVerifiedBadge/XVerifiedBadge.vue'
import XHelpTip from '@x/XHelpTip/XHelpTip.vue'
import XFormatPrice from '@x/XFormatPrice/XFormatPrice.vue'
import XSettingToggle from '@x/XSettingToggle/XSettingToggle.vue'
import XTableCard from '@x/XTableCard/XTableCard.vue'

const archivo = ref(null)
const vista = ref('lista')
const plan = ref('pro')
const inventariable = ref(true)

const historial = [
  { title: 'Comprobante emitido', created_at: '2026-08-14 09:12', status: true },
  { title: 'Enviado a SUNAT', created_at: '2026-08-14 09:13', status: true },
  { title: 'Rechazado por SUNAT', created_at: '2026-08-14 09:15', status: false },
  { title: 'Reenviado y aceptado', created_at: '2026-08-14 09:31', status: true },
]
</script>

<template>
  <Seccion titulo="XButtonToggle · XOptionCard · XSettingToggle" nota="grupo de botones · tarjetas de opcion · toggle con descripcion" :cubre="['XButtonToggle','XOptionCard','XSettingToggle']">
    <div class="pg-demo">
      <XButtonToggle v-model="vista" :options="[
        { label: 'Lista', value: 'lista' },
        { label: 'Cuadricula', value: 'grid' },
        { label: 'Tabla', value: 'tabla' },
      ]" />
    </div>
    <div class="pg-demo" style="margin-top:14px">
      <XOptionCardGroup v-model="plan">
        <XOptionCard value="free" label="Free" description="100 comprobantes/mes" />
        <XOptionCard value="pro" label="Pro" description="5.000 comprobantes/mes" />
        <XOptionCard value="max" label="Max" description="Ilimitado" />
      </XOptionCardGroup>
    </div>
    <div class="pg-demo" style="margin-top:14px">
      <XSettingToggle v-model="inventariable" label="Inventariable"
                      description="Apagalo para vender sin controlar stock."
                      feedback-off="No se validara stock al vender." boxed />
    </div>
  </Seccion>

  <Seccion titulo="XTokenDisplay · XVerifiedBadge · XFormatPrice · XHelpTip" nota="token enmascarado · verificado · precio · ayuda" :cubre="['XTokenDisplay','XVerifiedBadge','XFormatPrice','XHelpTip']">
    <div class="pg-demo">
      <div style="min-width:300px">
        <XTokenDisplay token="xmp_live_4f8a92bd7c1e5036af2b" label="Token de firma" />
      </div>
      <div style="display:flex; flex-direction:column; gap:8px">
        <XVerifiedBadge :verified="true" />
        <XVerifiedBadge :verified="false" />
      </div>
      <XFormatPrice label="Total" :price="1250.5" currency-type-symbol="S/" />
      <div style="display:flex; align-items:center; gap:6px; font-size:13px">
        Precio con IGV <XHelpTip text="El precio ya trae el IGV incluido." />
      </div>
    </div>
  </Seccion>

  <Seccion titulo="XTracking" nota=".x-tracking · 9 variables" :cubre="['XTracking']">
    <div style="max-width:460px">
      <XTracking :records="historial" />
    </div>
  </Seccion>

  <Seccion titulo="XTableCard" nota="tarjeta contenedora para tablas o resumenes" :cubre="['XTableCard']">
    <XTableCard title="Resumen del dia" subtitle="14 de agosto">
      <div style="font-size:13px">Contenido libre dentro de la tarjeta.</div>
    </XTableCard>
  </Seccion>
</template>

<script setup>
import { ref } from 'vue'
import Seccion from '../components/Seccion.vue'
import Demo from '../components/Demo.vue'
import XTokenDisplay from '@x/XTokenDisplay/XTokenDisplay.vue'
import XVerifiedBadge from '@x/XVerifiedBadge/XVerifiedBadge.vue'
import XFormatPrice from '@x/XFormatPrice/XFormatPrice.vue'
import XHelpTip from '@x/XHelpTip/XHelpTip.vue'
import XTracking from '@x/XTracking/XTracking.vue'
import XLoading from '@x/XLoading/XLoading.vue'
import XTableCard from '@x/XTableCard/XTableCard.vue'
import XButton from '@x/XButton/XButton.vue'

const cargando = ref(true)

const historial = [
  { title: 'Comprobante emitido', created_at: '2026-08-14 09:12', status: true },
  { title: 'Enviado a SUNAT', created_at: '2026-08-14 09:13', status: true },
  { title: 'Rechazado por SUNAT', created_at: '2026-08-14 09:15', status: false },
  { title: 'Reenviado y aceptado', created_at: '2026-08-14 09:31', status: true },
]

// XLoading acepta un spinner por prop booleana, no por string.
const SPINNERS = ['dots', 'bars', 'cube', 'gears', 'hourglass', 'puff', 'tail']
const TAMANIOS = ['sm', 'md', 'lg', 'xl']
</script>

<template>
  <Seccion titulo="XTokenDisplay" nota="enmascara un token y permite copiarlo" :cubre="['XTokenDisplay']">
    <Demo code="token · label" nota="oculto por defecto, con boton para revelar">
      <XTokenDisplay token="xmp_live_4f8a92bd7c1e5036af2b9c7d" label="Token de firma" style="min-width:340px" />
    </Demo>
    <Demo code="initially-visible" nota="arranca revelado">
      <XTokenDisplay token="xmp_live_4f8a92bd7c1e5036af2b9c7d" label="Visible" initially-visible style="min-width:340px" />
    </Demo>
    <Demo code="chunk-size" nota="agrupa los caracteres de a N">
      <XTokenDisplay token="4f8a92bd7c1e5036af2b9c7d" label="Bloques de 4" :chunk-size="4" style="min-width:340px" />
    </Demo>
    <Demo code="show-toggle false · copy-button false" nota="version de solo lectura">
      <XTokenDisplay token="xmp_live_4f8a92bd7c1e5036" label="Sin controles"
                     :show-toggle="false" :copy-button="false" style="min-width:340px" />
    </Demo>
  </Seccion>

  <Seccion titulo="XVerifiedBadge" nota="verified · labels · icon-only" :cubre="['XVerifiedBadge']">
    <Demo code="verified" nota="los dos estados" fila>
      <XVerifiedBadge :verified="true" />
      <XVerifiedBadge :verified="false" />
    </Demo>
    <Demo code="label-verified · label-not-verified" nota="textos propios" fila>
      <XVerifiedBadge :verified="true" label-verified="RUC validado" />
      <XVerifiedBadge :verified="false" label-not-verified="RUC sin validar" />
    </Demo>
    <Demo code="icon-only · icon-size" nota="para tablas y listas compactas" fila>
      <XVerifiedBadge :verified="true" icon-only />
      <XVerifiedBadge :verified="false" icon-only />
      <XVerifiedBadge :verified="true" icon-only icon-size="28px" />
    </Demo>
  </Seccion>

  <Seccion titulo="XFormatPrice" nota="price · currency-type-symbol · size · decimal" :cubre="['XFormatPrice']">
    <Demo code="label · price · currency-type-symbol" fila>
      <XFormatPrice label="Total" :price="1250.5" currency-type-symbol="S/" />
      <XFormatPrice label="En dolares" :price="342.75" currency-type-symbol="$" />
    </Demo>
    <Demo code="decimal" nota="cantidad de decimales" fila>
      <XFormatPrice label="Sin decimales" :price="1250.5" currency-type-symbol="S/" :decimal="0" />
      <XFormatPrice label="Con 3" :price="1250.5" currency-type-symbol="S/" :decimal="3" />
    </Demo>
    <Demo code="size · color" nota="para destacar el total de un ticket" fila>
      <XFormatPrice label="Grande" :price="1250.5" currency-type-symbol="S/" size="24px" />
      <XFormatPrice label="En verde" :price="1250.5" currency-type-symbol="S/" color="#0e8f5e" />
    </Demo>
    <Demo code="border · background · padding" nota="se puede encajonar" fila>
      <XFormatPrice label="Encajonado" :price="9990" currency-type-symbol="S/"
                    border="1px solid #e2e8f0" background="#f8fafc" padding="10px 14px" />
    </Demo>
  </Seccion>

  <Seccion titulo="XHelpTip" nota="text · icon · max-width · slot" :cubre="['XHelpTip']">
    <Demo code="text" nota="pasar el mouse por encima del icono" fila>
      <span style="font-size:13px">Precio con IGV <XHelpTip text="El precio ya trae el IGV incluido." /></span>
    </Demo>
    <Demo code="icon · size · color" fila>
      <span style="font-size:13px">Con otro icono
        <XHelpTip text="Usa cualquier icono." icon="fa-light fa-lightbulb" size="18px" color="warning" />
      </span>
    </Demo>
    <Demo code="slot por defecto" nota="permite contenido enriquecido, no solo texto" fila>
      <span style="font-size:13px">Enriquecido
        <XHelpTip><b>Nota:</b> solo aplica a ventas <i>gravadas</i>.</XHelpTip>
      </span>
    </Demo>
    <Demo code="max-width" nota="controla el ancho del globo" fila>
      <span style="font-size:13px">Texto largo
        <XHelpTip max-width="180px"
                  text="Un texto largo que se acomoda al ancho maximo definido por la prop." />
      </span>
    </Demo>
  </Seccion>

  <Seccion titulo="XTracking" nota="records · status · loading" :cubre="['XTracking']">
    <Demo code="records" nota="cada item lleva title, created_at y status booleano">
      <div style="max-width:460px; width:100%"><XTracking :records="historial" /></div>
    </Demo>
    <Demo code="loading" nota="mientras llega el historial">
      <div style="max-width:460px; width:100%"><XTracking :records="[]" loading /></div>
    </Demo>
    <Demo code="records vacio" nota="sin eventos">
      <div style="max-width:460px; width:100%"><XTracking :records="[]" /></div>
    </Demo>
  </Seccion>

  <Seccion titulo="XLoading · tipos de spinner" nota="dots · bars · cube · gears · hourglass · puff · tail" :cubre="['XLoading']">
    <Demo code="props booleanas" nota="cada tipo es su propia prop, no un string">
      <div v-for="sp in SPINNERS" :key="sp" class="pg-tile">
        <div style="position:relative; height:80px; width:80px">
          <XLoading :loading="cargando" v-bind="{ [sp]: true }" />
        </div>
        <code>{{ sp }}</code>
      </div>
    </Demo>
  </Seccion>

  <Seccion titulo="XLoading · tamaños y variantes" nota=".x-loading-sm/md/lg/xl · -transparent · -blur" :cubre="['XLoading']">
    <Demo code="clases de tamaño">
      <div v-for="s in TAMANIOS" :key="s" class="pg-tile">
        <div style="position:relative; height:90px; width:90px">
          <XLoading :loading="cargando" :class="`x-loading-${s}`" />
        </div>
        <code>.x-loading-{{ s }}</code>
      </div>
    </Demo>
    <Demo code="message · color · .x-loading-blur">
      <div class="pg-tile">
        <div style="position:relative; height:100px; width:170px">
          <XLoading :loading="cargando" message="Enviando a SUNAT…" />
        </div>
        <code>message</code>
      </div>
      <div class="pg-tile">
        <div style="position:relative; height:100px; width:120px; background:#f1f5f9">
          <XLoading :loading="cargando" class="x-loading-blur" />
        </div>
        <code>.x-loading-blur</code>
      </div>
      <div class="pg-tile">
        <div style="position:relative; height:100px; width:120px">
          <XLoading :loading="cargando" color="positive" />
        </div>
        <code>color</code>
      </div>
    </Demo>
    <Demo code="loading false" fila>
      <XButton :label="cargando ? 'Detener' : 'Reanudar'" variant="secondary" @click="cargando = !cargando" />
    </Demo>
  </Seccion>

  <Seccion titulo="XTableCard" nota="title · subtitle · icon · padding" :cubre="['XTableCard']">
    <Demo code="title · subtitle">
      <XTableCard title="Resumen del dia" subtitle="14 de agosto" style="width:100%">
        <div style="font-size:13px">Contenido libre: una tabla, KPIs o lo que sea.</div>
      </XTableCard>
    </Demo>
    <Demo code="icon · padding">
      <XTableCard title="Con icono" subtitle="y sin padding" icon="fa-light fa-table" padding="0" style="width:100%">
        <div style="font-size:13px; background:#f8fafc; padding:12px">Bloque al ras.</div>
      </XTableCard>
    </Demo>
  </Seccion>
</template>

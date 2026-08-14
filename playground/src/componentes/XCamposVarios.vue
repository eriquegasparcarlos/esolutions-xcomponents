<script setup>
import { ref } from 'vue'
import Seccion from '../components/Seccion.vue'
import Demo from '../components/Demo.vue'
import XDatepicker from '@x/XDatepicker/XDatepicker.vue'
import XDatepickerMonth from '@x/XDatepicker/XDatepickerMonth.vue'
import XInputColor from '@x/XInputColor/XInputColor.vue'
import XInputNumeric from '@x/XInputNumeric/XInputNumeric.vue'
import XFile from '@x/XFile/XFile.vue'
import XImageUpload from '@x/XImageUpload/XImageUpload.vue'

const fecha = ref('2026-08-14')
const mes = ref('2026-08')
const color = ref('#0e8f5e')
const n1 = ref(1250.5), n2 = ref(3), n3 = ref(18)
const arch = ref(null), archs = ref(null), img = ref(null)
</script>

<template>
  <Seccion titulo="XDatepicker" nota=".x-input-datepicker · -large" :cubre="['XDatepicker']">
    <Demo code="v-model" nota="formato de valor y de display configurables" fila>
      <XDatepicker v-model="fecha" label="Fecha de emision" style="min-width:240px" />
    </Demo>
    <Demo code=".x-input-datepicker-large" nota="variante de mayor tamaño" fila>
      <XDatepicker v-model="fecha" label="Fecha" class="x-input-datepicker-large" style="min-width:240px" />
    </Demo>
    <Demo code="clearable · readonly · error" fila>
      <XDatepicker v-model="fecha" label="Con limpiar" clearable style="min-width:200px" />
      <XDatepicker v-model="fecha" label="Solo lectura" readonly style="min-width:200px" />
      <XDatepicker v-model="fecha" label="Con error" error="Fecha invalida" style="min-width:200px" />
    </Demo>
    <Demo code="XDatepickerMonth" nota="selector de mes y año" fila>
      <XDatepickerMonth v-model="mes" label="Periodo" style="min-width:240px" />
    </Demo>
  </Seccion>

  <Seccion titulo="XInputNumeric" nota="prefix · suffix · controls · min/max/step" :cubre="['XInputNumeric']">
    <Demo code="prefix" fila>
      <XInputNumeric v-model="n1" label="Total" prefix="S/" style="min-width:220px" />
    </Demo>
    <Demo code="suffix" fila>
      <XInputNumeric v-model="n3" label="IGV" suffix="%" style="min-width:220px" />
    </Demo>
    <Demo code="controls · min · max · step" nota="botones de resta y suma con limites" fila>
      <XInputNumeric v-model="n2" label="Cantidad" controls :min="0" :max="99" :step="1" style="min-width:220px" />
    </Demo>
    <Demo code="disable · error" fila>
      <XInputNumeric v-model="n1" label="Deshabilitado" prefix="S/" disable style="min-width:200px" />
      <XInputNumeric v-model="n1" label="Con error" error="Monto invalido" style="min-width:200px" />
    </Demo>
  </Seccion>

  <Seccion titulo="XInputColor" nota="show-code · as-button" :cubre="['XInputColor']">
    <Demo code="v-model" nota="preview mas codigo hexadecimal" fila>
      <XInputColor v-model="color" label="Color" style="min-width:220px" />
    </Demo>
    <Demo code="show-code false" nota="solo el preview, sin el hex" fila>
      <XInputColor v-model="color" label="Color" :show-code="false" style="min-width:220px" />
    </Demo>
    <Demo code="as-button" nota="compacto, para toolbars" fila>
      <XInputColor v-model="color" as-button />
    </Demo>
  </Seccion>

  <Seccion titulo="XFile · XImageUpload" nota=".x-file-dropzone · -large · -multiple" :cubre="['XFile', 'XImageUpload']">
    <Demo code="label" fila>
      <XFile v-model="arch" label="Adjuntar XML" style="min-width:280px" />
    </Demo>
    <Demo code="multiple" fila>
      <XFile v-model="archs" label="Adjuntos" multiple style="min-width:280px" />
    </Demo>
    <Demo code="accept · clearable" nota="restringe extensiones y permite limpiar" fila>
      <XFile v-model="arch" label="Solo XML o PDF" accept=".xml,.pdf" clearable style="min-width:280px" />
    </Demo>
    <Demo code=".x-file-dropzone" nota="zona de arrastre">
      <div class="x-file-dropzone" style="min-width:320px">
        <XFile v-model="arch" label="Arrastra o selecciona" />
      </div>
    </Demo>
    <Demo code="XImageUpload" nota="preview de la imagen elegida" fila>
      <XImageUpload v-model="img" label="Logo" />
    </Demo>
  </Seccion>
</template>

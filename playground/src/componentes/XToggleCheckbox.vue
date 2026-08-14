<script setup>
import { ref } from 'vue'
import Seccion from '../components/Seccion.vue'
import Demo from '../components/Demo.vue'
import XToggle from '@x/XToggle/XToggle.vue'
import XCheckbox from '@x/XCheckbox/XCheckbox.vue'

const t = ref(true), t2 = ref(false), t3 = ref(null)
const c = ref(true), c2 = ref(false), c3 = ref(null)

const COLORES = ['primary', 'secondary', 'success', 'error', 'warning', 'info']
const TAMANIOS = ['sm', 'md', 'lg']
const COLORES_CHK = ['primary', 'positive', 'negative', 'warning']
</script>

<template>
  <Seccion titulo="XToggle · colores" nota="6 clases .x-toggle-*" :cubre="['XToggle']">
    <Demo v-for="col in COLORES" :key="col" :code="`.x-toggle-${col}`" fila>
      <XToggle v-model="t" :class="`x-toggle-${col}`" :label="col" />
    </Demo>
  </Seccion>

  <Seccion titulo="XToggle · tamaños y estados" nota="sm / md / lg · hint · disable" :cubre="['XToggle']">
    <Demo v-for="s in TAMANIOS" :key="s" :code="`.x-toggle-${s}`" fila>
      <XToggle v-model="t" :class="`x-toggle-${s}`" label="Controlar inventario" />
    </Demo>
    <Demo code="hint" nota="texto de ayuda bajo el control" fila>
      <XToggle v-model="t2" label="Notificaciones" hint="Te avisamos por correo." />
    </Demo>
    <Demo code="disable · indeterminado" fila>
      <XToggle v-model="t" label="Deshabilitado" disable />
      <XToggle v-model="t3" label="Indeterminado" />
    </Demo>
    <Demo code="tooltip-text" nota="aparece al pasar el mouse" fila>
      <XToggle v-model="t2" label="Con tooltip" tooltip-text="Aparece al pasar el mouse" />
    </Demo>
  </Seccion>

  <Seccion titulo="XCheckbox" nota="label · hint · color · estados" :cubre="['XCheckbox']">
    <Demo code="label" fila>
      <XCheckbox v-model="c" label="Acepto los terminos" />
    </Demo>
    <Demo code="hint" fila>
      <XCheckbox v-model="c2" label="Recordarme" hint="Se guarda en este dispositivo." />
    </Demo>
    <Demo code="color" nota="acepta colores de Quasar" fila>
      <XCheckbox v-for="col in COLORES_CHK" :key="col" v-model="c" :color="col" :label="col" />
    </Demo>
    <Demo code="disable · indeterminado" fila>
      <XCheckbox v-model="c" label="Deshabilitado" disable />
      <XCheckbox v-model="c3" label="Indeterminado" />
    </Demo>
    <Demo code="help" nota="monta un XHelpTip junto al label" fila>
      <XCheckbox v-model="c2" label="Aplicar IGV" help="Solo para ventas gravadas." />
    </Demo>
  </Seccion>
</template>

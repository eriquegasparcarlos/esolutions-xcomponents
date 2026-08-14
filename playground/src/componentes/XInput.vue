<script setup>
import { ref } from 'vue'
import Seccion from '../components/Seccion.vue'
import Demo from '../components/Demo.vue'
import XInput from '@x/XInput/XInput.vue'

const v = ref('Comercial Andina SAC')
const vacio = ref('')
const num = ref('')
const ancho = 'min-width:260px'
</script>

<template>
  <Seccion titulo="XInput · basico" nota=".x-input" :cubre="['XInput']">
    <Demo code="label" nota="el label va ENCIMA del campo (default del paquete)">
      <XInput v-model="v" label="Razon social" :style="ancho" />
    </Demo>
    <Demo code="is-classic" nota="label flotante DENTRO del campo, estilo Quasar clasico">
      <XInput v-model="vacio" label="Razon social" is-classic :style="ancho" />
    </Demo>
    <Demo code="placeholder">
      <XInput v-model="vacio" label="RUC" placeholder="20123456789" :style="ancho" />
    </Demo>
    <Demo code="help" nota="monta un XHelpTip junto al label">
      <XInput v-model="vacio" label="Precio" help="El precio ya incluye IGV." :style="ancho" />
    </Demo>
  </Seccion>

  <Seccion titulo="XInput · estados" nota="error · is-required · dense · disable · readonly" :cubre="['XInput']">
    <Demo code="error" nota="el mensaje se muestra bajo el campo">
      <XInput v-model="v" label="RUC" error="El RUC no tiene 11 digitos" :style="ancho" />
    </Demo>
    <Demo code="is-required" nota="agrega el asterisco al label">
      <XInput v-model="vacio" label="Razon social" is-required :style="ancho" />
    </Demo>
    <Demo code="dense" nota="alto compacto (default) vs normal">
      <XInput v-model="v" label="Dense" dense style="min-width:230px" />
      <XInput v-model="v" label="No dense" :dense="false" style="min-width:230px" />
    </Demo>
    <Demo code="disable · readonly">
      <XInput v-model="v" label="Deshabilitado" disable style="min-width:230px" />
      <XInput v-model="v" label="Solo lectura" readonly style="min-width:230px" />
    </Demo>
  </Seccion>

  <Seccion titulo="XInput · tipos y slots" nota="type · prepend / append" :cubre="['XInput']">
    <Demo code="type" nota="number · password · textarea (llegan por attrs al QInput)">
      <XInput v-model="num" label="Cantidad" type="number" style="min-width:200px" />
      <XInput v-model="vacio" label="Clave" type="password" style="min-width:200px" />
      <XInput v-model="vacio" label="Notas" type="textarea" style="min-width:240px" />
    </Demo>
    <Demo code="#prepend / #append" nota="8 slots: before, prepend, append, after, hint, error, counter, loading">
      <XInput v-model="vacio" label="Buscar" :style="ancho">
        <template #prepend><q-icon name="fa-light fa-magnifying-glass" size="16px" /></template>
      </XInput>
      <XInput v-model="num" label="Total" :style="ancho">
        <template #append><span style="font-size:12px;color:#64748b">PEN</span></template>
      </XInput>
    </Demo>
  </Seccion>
</template>

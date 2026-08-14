<script setup>
import { ref } from 'vue'
import XInput from '@x/XInput/XInput.vue'
import XSelect from '@x/XSelect/XSelect.vue'
import XToggle from '@x/XToggle/XToggle.vue'
import XCheckbox from '@x/XCheckbox/XCheckbox.vue'
import XButton from '@x/XButton/XButton.vue'
import XInputColor from '@x/XInputColor/XInputColor.vue'
import XInputNumeric from '@x/XInputNumeric/XInputNumeric.vue'
import XDatepicker from '@x/XDatepicker/XDatepicker.vue'

const texto = ref('Comercial Andina SAC')
const seleccion = ref('Aceptado')
const activo = ref(true)
const marcado = ref(true)
const color = ref('#0e8f5e')
const numero = ref(1250.5)
const fecha = ref('2026-08-14')
const opciones = ['Aceptado', 'Pendiente', 'Rechazado']
</script>

<template>
  <section class="pg-section">
    <h3>Formularios <code>--x-radius · --x-brand</code></h3>
    <div class="pg-demo">
      <XInput v-model="texto" label="Razon social" />
      <XSelect v-model="seleccion" label="Estado" :options="opciones" />
      <XInputNumeric v-model="numero" label="Total" />
      <XDatepicker v-model="fecha" label="Fecha de emision" />
      <XInputColor v-model="color" label="Color" />
    </div>
    <div class="pg-demo" style="margin-top:14px">
      <XToggle v-model="activo" label="Controlar inventario" />
      <XCheckbox v-model="marcado" label="Acepto los terminos" />
    </div>
  </section>

  <section class="pg-section">
    <h3>Botones <code>--x-radius · --x-brand · --x-duration</code></h3>
    <div class="pg-demo">
      <XButton label="Primario" variant="primary" />
      <XButton label="Secundario" variant="secondary" />
      <XButton label="Exito" variant="success" />
      <XButton label="Peligro" variant="danger" />
      <XButton label="Advertencia" variant="warning" />
      <XButton label="Info" variant="info" />
      <XButton label="Con icono" variant="primary" icon="fa-light fa-floppy-disk" />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import Seccion from '../components/Seccion.vue'
import XInput from '@x/XInput/XInput.vue'
import XSelect from '@x/XSelect/XSelect.vue'
import XToggle from '@x/XToggle/XToggle.vue'
import XCheckbox from '@x/XCheckbox/XCheckbox.vue'
import XButton from '@x/XButton/XButton.vue'
import XInputColor from '@x/XInputColor/XInputColor.vue'
import XInputNumeric from '@x/XInputNumeric/XInputNumeric.vue'
import XDatepicker from '@x/XDatepicker/XDatepicker.vue'

const texto = ref('Comercial Andina SAC')
const activo = ref(true)
const marcado = ref(true)
const color = ref('#0e8f5e')
const numero = ref(1250.5)
const fecha = ref('2026-08-14')

// XSelect espera OBJETOS: por defecto lee `id` como valor y `name` como label
// (props option-value / option-label). Pasarle un array de strings deja el
// desplegable con las filas en blanco.
const opciones = [
  { id: 'aceptado', name: 'Aceptado' },
  { id: 'pendiente', name: 'Pendiente' },
  { id: 'rechazado', name: 'Rechazado' },
]
const seleccion = ref('aceptado')

// Con option-value/option-label se puede usar cualquier forma de objeto.
const monedas = [
  { codigo: 'PEN', nombre: 'Soles (PEN)' },
  { codigo: 'USD', nombre: 'Dolares (USD)' },
]
const moneda = ref('PEN')

const VARIANTES = ['primary', 'secondary', 'success', 'danger', 'warning', 'info']

// XButton reenvia estos props al q-btn subyacente (ver su v-bind), asi que
// todo el catalogo visual de Quasar sigue disponible.
const ESTILOS = [
  { attr: 'flat' }, { attr: 'outline' }, { attr: 'rounded' },
  { attr: 'unelevated' }, { attr: 'push' }, { attr: 'dense' }, { attr: 'stretch' },
]
</script>

<template>
  <Seccion titulo="XButton · variantes de color" nota="prop variant" :cubre="['XButton']">
    <div class="pg-demo">
      <XButton v-for="v in VARIANTES" :key="v" :label="v" :variant="v" />
    </div>
  </Seccion>

  <Seccion titulo="XButton · estilos de Quasar" nota="XButton reenvia flat / outline / rounded / unelevated / push al q-btn"
           :cubre="['XButton']">
    <div class="pg-demo">
      <div v-for="e in ESTILOS" :key="e.attr" class="pg-tile">
        <XButton label="Guardar" variant="primary" v-bind="{ [e.attr]: true }" />
        <code>{{ e.attr }}</code>
      </div>
    </div>
  </Seccion>

  <Seccion titulo="XButton · tamaños y estado" nota="size · loading · disable" :cubre="['XButton']">
    <div class="pg-demo">
      <div v-for="s in ['xs', 'sm', 'md', 'lg', 'xl']" :key="s" class="pg-tile">
        <XButton label="Guardar" variant="primary" :size="s" />
        <code>size={{ s }}</code>
      </div>
    </div>
    <div class="pg-demo" style="margin-top:12px">
      <div class="pg-tile"><XButton label="Cargando" variant="primary" loading /><code>loading</code></div>
      <div class="pg-tile"><XButton label="Desactivado" variant="primary" disable /><code>disable</code></div>
      <div class="pg-tile"><XButton label="Ancho" variant="primary" class="full-width" /><code>full-width</code></div>
    </div>
  </Seccion>

  <Seccion titulo="XButton · iconos" nota="requiere FontAwesome Pro (fa-light)" :cubre="['XButton']">
    <div class="pg-demo">
      <div class="pg-tile"><XButton label="Guardar" variant="primary" icon="fa-light fa-floppy-disk" /><code>icon</code></div>
      <div class="pg-tile"><XButton label="Siguiente" variant="secondary" icon-right="fa-light fa-arrow-right" /><code>icon-right</code></div>
      <div class="pg-tile"><XButton icon="fa-light fa-trash" variant="danger" round /><code>round + icon</code></div>
      <div class="pg-tile"><XButton icon="fa-light fa-pen" variant="secondary" flat round /><code>flat round</code></div>
      <div class="pg-tile"><XButton icon="fa-solid fa-check" variant="success" circle /><code>circle</code></div>
      <div class="pg-tile"><XButton label="Con tooltip" variant="info" icon="fa-light fa-circle-info" tooltip="Texto de ayuda" /><code>tooltip</code></div>
      <div class="pg-tile"><XButton label="Notificaciones" variant="secondary" icon="fa-light fa-bell" badge="9" /><code>badge</code></div>
    </div>
    <p style="margin:12px 0 0; font-size:12px; color:#64748b">
      Los propios componentes traen <strong>29 iconos <code>fa-*</code> hardcodeados</strong>
      (24 son <code>fa-light</code>, exclusivo del plan <strong>Pro</strong>). Sin FontAwesome
      cargado se ven cuadros vacios: el X de cerrar de los dialogos, el + de XSelect,
      XFile, XTracking…
    </p>
  </Seccion>
</template>

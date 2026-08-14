<script setup>
import { ref } from 'vue'
import Seccion from '../components/Seccion.vue'
import Demo from '../components/Demo.vue'
import XButtonToggle from '@x/XButtonToggle/XButtonToggle.vue'
import XOptionCard from '@x/XOptionCard/XOptionCard.vue'
import XOptionCardGroup from '@x/XOptionCard/XOptionCardGroup.vue'
import XSettingToggle from '@x/XSettingToggle/XSettingToggle.vue'

const vista = ref('lista')
const vista2 = ref('grid')
const filtros = ref(['hoy'])
const iconos = ref('lista')
const moneda = ref('PEN')

const plan = ref('pro')
const plan2 = ref('free')
const envio = ref(null)

const inventariable = ref(true)
const notif = ref(false)
const auto = ref(true)

const VISTAS = [
  { label: 'Lista', value: 'lista' },
  { label: 'Cuadricula', value: 'grid' },
  { label: 'Tabla', value: 'tabla' },
]
const VISTAS_ICONO = [
  { icon: 'fa-light fa-list', value: 'lista' },
  { icon: 'fa-light fa-grid-2', value: 'grid' },
  { icon: 'fa-light fa-table', value: 'tabla' },
]
const PERIODOS = [
  { label: 'Hoy', value: 'hoy' },
  { label: 'Semana', value: 'semana' },
  { label: 'Mes', value: 'mes' },
]
</script>

<template>
  <Seccion titulo="XButtonToggle · basico" nota="options · option-label / option-value" :cubre="['XButtonToggle']">
    <Demo code="options" nota="grupo excluyente; el valor sale de option-value">
      <XButtonToggle v-model="vista" :options="VISTAS" />
    </Demo>
    <Demo code="icon-only" nota="solo iconos, para barras de herramientas">
      <XButtonToggle v-model="iconos" :options="VISTAS_ICONO" icon-only />
    </Demo>
    <Demo code="multiple · clearable" nota="permite varios y deseleccionar">
      <XButtonToggle v-model="filtros" :options="PERIODOS" multiple clearable />
    </Demo>
  </Seccion>

  <Seccion titulo="XButtonToggle · estilos" nota="flat · outline · push · unelevated · spread" :cubre="['XButtonToggle']">
    <Demo code="outline · flat · push">
      <div class="pg-tile"><XButtonToggle v-model="vista2" :options="VISTAS" outline /><code>outline</code></div>
      <div class="pg-tile"><XButtonToggle v-model="vista2" :options="VISTAS" flat /><code>flat</code></div>
      <div class="pg-tile"><XButtonToggle v-model="vista2" :options="VISTAS" push /><code>push</code></div>
    </Demo>
    <Demo code="toggle-color · color" nota="color del seleccionado y del resto">
      <XButtonToggle v-model="vista2" :options="VISTAS" toggle-color="positive" color="grey-3" text-color="dark" />
    </Demo>
    <Demo code="size · dense">
      <div class="pg-tile"><XButtonToggle v-model="vista2" :options="VISTAS" size="sm" /><code>size=sm</code></div>
      <div class="pg-tile"><XButtonToggle v-model="vista2" :options="VISTAS" dense /><code>dense</code></div>
      <div class="pg-tile"><XButtonToggle v-model="vista2" :options="VISTAS" size="lg" /><code>size=lg</code></div>
    </Demo>
    <Demo code="spread" nota="ocupa todo el ancho disponible">
      <div style="width:100%"><XButtonToggle v-model="vista2" :options="VISTAS" spread /></div>
    </Demo>
    <Demo code="disable · readonly">
      <div class="pg-tile"><XButtonToggle v-model="vista2" :options="VISTAS" disable /><code>disable</code></div>
      <div class="pg-tile"><XButtonToggle v-model="vista2" :options="VISTAS" readonly /><code>readonly</code></div>
    </Demo>
  </Seccion>

  <Seccion titulo="XOptionCard" nota="tarjetas de opcion, alternativa visual al radio" :cubre="['XOptionCard']">
    <Demo code="XOptionCardGroup + XOptionCard" nota="value / label / description">
      <div style="width:100%">
        <XOptionCardGroup v-model="plan">
          <XOptionCard value="free" label="Free" description="100 comprobantes al mes" />
          <XOptionCard value="pro" label="Pro" description="5.000 comprobantes al mes" />
          <XOptionCard value="max" label="Max" description="Sin limite" />
        </XOptionCardGroup>
      </div>
    </Demo>
    <Demo code="cols" nota="cuantas por fila">
      <div style="width:100%">
        <XOptionCardGroup v-model="plan2" :cols="2">
          <XOptionCard value="free" label="Free" description="Para probar" />
          <XOptionCard value="pro" label="Pro" description="Para producción" />
        </XOptionCardGroup>
      </div>
    </Demo>
    <Demo code="disable" nota="opcion no elegible">
      <div style="width:100%">
        <XOptionCardGroup v-model="envio">
          <XOptionCard value="normal" label="Envio normal" description="3 a 5 dias" />
          <XOptionCard value="express" label="Express" description="24 horas" />
          <XOptionCard value="retiro" label="Retiro en tienda" description="No disponible por ahora" disable />
        </XOptionCardGroup>
      </div>
    </Demo>
    <Demo code="sin description" nota="solo etiqueta, mas compacto">
      <div style="width:100%">
        <XOptionCardGroup v-model="moneda" :cols="3">
          <XOptionCard value="PEN" label="Soles" />
          <XOptionCard value="USD" label="Dolares" />
          <XOptionCard value="EUR" label="Euros" />
        </XOptionCardGroup>
      </div>
    </Demo>
  </Seccion>

  <Seccion titulo="XSettingToggle" nota="toggle con descripcion, para pantallas de ajustes" :cubre="['XSettingToggle']">
    <Demo code="label · description">
      <div style="width:100%; max-width:520px">
        <XSettingToggle v-model="inventariable" label="Inventariable"
                        description="Apagalo para vender sin controlar stock." />
      </div>
    </Demo>
    <Demo code="boxed" nota="encajonado, se separa del resto del formulario">
      <div style="width:100%; max-width:520px">
        <XSettingToggle v-model="notif" label="Notificaciones por correo"
                        description="Te avisamos cuando SUNAT responde." boxed />
      </div>
    </Demo>
    <Demo code="icon-on · icon-off · feedback-off" nota="el icono cambia con el estado y avisa la consecuencia">
      <div style="width:100%; max-width:520px">
        <XSettingToggle v-model="auto" label="Envio automatico a SUNAT"
                        description="Se envia apenas se emite el comprobante."
                        icon-on="fa-solid fa-paper-plane" icon-off="fa-light fa-paper-plane"
                        feedback-off="Vas a tener que enviarlos a mano." boxed />
      </div>
    </Demo>
    <Demo code="disable">
      <div style="width:100%; max-width:520px">
        <XSettingToggle :model-value="true" label="Plan Enterprise"
                        description="Solo se cambia desde facturacion." disable boxed />
      </div>
    </Demo>
  </Seccion>
</template>

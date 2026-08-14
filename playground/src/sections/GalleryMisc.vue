<script setup>
import Seccion from '../components/Seccion.vue'
import { ref } from 'vue'
import XButtonToggle from '@x/XButtonToggle/XButtonToggle.vue'
import XOptionCard from '@x/XOptionCard/XOptionCard.vue'
import XOptionCardGroup from '@x/XOptionCard/XOptionCardGroup.vue'
import XSettingToggle from '@x/XSettingToggle/XSettingToggle.vue'

const archivo = ref(null)
const vista = ref('lista')
const plan = ref('pro')
const inventariable = ref(true)

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

  </template>

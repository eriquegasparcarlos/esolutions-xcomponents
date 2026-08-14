<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import Seccion from '../components/Seccion.vue'
import Demo from '../components/Demo.vue'
import XSelect from '@x/XSelect/XSelect.vue'

const $q = useQuasar()
const avisar = () => $q.notify({ message: 'evento click-new', color: 'primary' })

// XSelect mapea opt[optionValue] / opt[optionLabel] — por defecto 'id' y 'name'.
// Con un array de STRINGS el desplegable sale en blanco y sin error en consola.
const estados = [
  { id: 'aceptado', name: 'Aceptado' },
  { id: 'pendiente', name: 'Pendiente' },
  { id: 'rechazado', name: 'Rechazado' },
]
const monedas = [
  { codigo: 'PEN', nombre: 'Soles (PEN)' },
  { codigo: 'USD', nombre: 'Dolares (USD)' },
  { codigo: 'EUR', nombre: 'Euros (EUR)' },
]
const largo = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1, name: `Cliente ${String(i + 1).padStart(3, '0')} SAC`,
}))

const a = ref('aceptado'), b = ref('PEN'), c = ref(null)
const d = ref('all'), e = ref(null), f = ref(null), g = ref([])
const ancho = 'min-width:260px'
</script>

<template>
  <Seccion titulo="XSelect · contrato de datos" nota="option-value / option-label" :cubre="['XSelect']">
    <Demo code="options" nota="forma por defecto: objetos con id y name">
      <XSelect v-model="a" label="Estado" :options="estados" :style="ancho" />
    </Demo>
    <Demo code="option-value · option-label" nota="para cualquier otra forma de objeto">
      <XSelect v-model="b" label="Moneda" :options="monedas"
               option-value="codigo" option-label="nombre" :style="ancho" />
    </Demo>
    <Demo code="include-all-option" nota="antepone la opcion Todos, con value = all">
      <XSelect v-model="d" label="Estado" :options="estados" include-all-option :style="ancho" />
    </Demo>
  </Seccion>

  <Seccion titulo="XSelect · busqueda" nota="filter-local · truncate-label" :cubre="['XSelect']">
    <Demo code="filter-local" nota="habilita escribir para filtrar (40 opciones)">
      <XSelect v-model="e" label="Cliente" :options="largo" filter-local style="min-width:300px" />
    </Demo>
    <Demo code="truncate-label · truncate-width" nota="corta etiquetas largas en vez de romper el layout">
      <XSelect v-model="e" label="Cliente" :options="largo" filter-local
               truncate-label :truncate-width="160" style="min-width:220px" />
    </Demo>
  </Seccion>

  <Seccion titulo="XSelect · agregar al vuelo" nota="show-add-button · show-add-new-option" :cubre="['XSelect']">
    <Demo code="show-add-button" nota="boton + al costado del campo; emite click-new">
      <XSelect v-model="c" label="Categoria" :options="estados" show-add-button
               :style="ancho" @click-new="avisar" />
    </Demo>
    <Demo code="show-add-new-option" nota="la opcion aparece DENTRO del desplegable">
      <XSelect v-model="f" label="Marca" :options="estados" show-add-new-option
               add-new-label="Crear marca nueva" :style="ancho" @click-new="avisar" />
    </Demo>
  </Seccion>

  <Seccion titulo="XSelect · estados" nota="error · disable · dense · multiple" :cubre="['XSelect']">
    <Demo code="error">
      <XSelect v-model="c" label="Estado" :options="estados" error="Elegi un estado" :style="ancho" />
    </Demo>
    <Demo code="disable · dense">
      <XSelect v-model="a" label="Deshabilitado" :options="estados" disable style="min-width:230px" />
      <XSelect v-model="a" label="No dense" :options="estados" :dense="false" style="min-width:230px" />
    </Demo>
    <Demo code="multiple · use-chips" nota="props nativos de QSelect, llegan por attrs">
      <XSelect v-model="g" label="Estados" :options="estados" multiple use-chips style="min-width:300px" />
    </Demo>
  </Seccion>
</template>

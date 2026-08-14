<script setup>
import Seccion from '../components/Seccion.vue'
import { ref } from 'vue'
import XDialog from '@x/XDialog/XDialog.vue'
import XButton from '@x/XButton/XButton.vue'
import XDropdownMenu from '@x/XDropdownMenu/XDropdownMenu.vue'
import XDropdownItem from '@x/XDropdownMenu/XDropdownItem.vue'
import XDropdownDivider from '@x/XDropdownMenu/XDropdownDivider.vue'
import XLoading from '@x/XLoading/XLoading.vue'
import XConfirmAction from '@x/XConfirmAction/XConfirmAction.vue'

const abierto = ref(false)
const lateral = ref(false)
const cargando = ref(true)
</script>

<template>
  <Seccion titulo="XDialog" nota=".x-dialog · --x-radius-md" :cubre="['XDialog']">
    <div class="pg-demo">
      <XButton label="Dialogo estandar" variant="primary" @click="abierto = true" />
      <XButton label="Dialogo lateral" variant="secondary" @click="lateral = true" />
    </div>

    <XDialog v-model="abierto" title="Nuevo comprobante" width="460px" show-button-close
             @action-button-close="abierto = false">
      <template #content>
        <p style="margin:0; font-size:13px">
          Usa <code>--x-dialog-border-radius</code> (derivado de <code>--x-radius-md</code>)
          y <code>--x-dialog-header-padding</code>. Ambos editables en el panel.
        </p>
      </template>
      <template #action-buttons>
        <XButton label="Cancelar" variant="secondary" @click="abierto = false" />
        <XButton label="Guardar" variant="primary" @click="abierto = false" />
      </template>
    </XDialog>

    <XDialog v-model="lateral" title="Panel lateral" width="380px" position="right"
             is-full-height show-button-close @action-button-close="lateral = false">
      <template #content>
        <p style="margin:0; font-size:13px">Variante <code>position="right"</code> + <code>is-full-height</code>.</p>
      </template>
    </XDialog>
  </Seccion>

  <Seccion titulo="XDropdownMenu" nota=".x-dropdown-menu · 16 variables" :cubre="['XDropdownMenu']">
    <div class="pg-demo">
      <!-- El slot #trigger expone `open`: hay que invocarlo en el @click -->
      <XDropdownMenu>
        <template #trigger="{ open }">
          <XButton label="Acciones" variant="secondary"
                   icon-right="fa-light fa-chevron-down" @click="open" />
        </template>
        <XDropdownItem label="Ver detalle" icon="fa-light fa-eye" />
        <XDropdownItem label="Descargar XML" icon="fa-light fa-file-code" />
        <XDropdownDivider />
        <XDropdownItem label="Anular" icon="fa-light fa-trash" variant="danger" />
      </XDropdownMenu>

      <XConfirmAction @confirm="() => {}">
        <template #default="{ ask }">
          <XButton label="Accion con confirmacion" variant="danger" @click="ask" />
        </template>
      </XConfirmAction>
    </div>
  </Seccion>

  <Seccion titulo="XLoading · tamaños" nota=".x-loading · variantes sm / md / lg / xl" :cubre="['XLoading']">
    <div class="pg-demo">
      <div v-for="s in ['sm', 'md', 'lg', 'xl']" :key="s" class="pg-tile">
        <div style="position:relative; height:90px">
          <XLoading :loading="cargando" :size="s" />
        </div>
        <code>{{ s }}</code>
      </div>
    </div>
    <div class="pg-demo" style="margin-top:8px">
      <XButton :label="cargando ? 'Detener' : 'Reanudar'" variant="secondary" @click="cargando = !cargando" />
    </div>
  </Seccion>
</template>

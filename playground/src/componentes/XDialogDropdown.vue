<script setup>
import { ref } from 'vue'
import Seccion from '../components/Seccion.vue'
import Demo from '../components/Demo.vue'
import XDialog from '@x/XDialog/XDialog.vue'
import XButton from '@x/XButton/XButton.vue'
import XDropdownMenu from '@x/XDropdownMenu/XDropdownMenu.vue'
import XDropdownItem from '@x/XDropdownMenu/XDropdownItem.vue'
import XDropdownDivider from '@x/XDropdownMenu/XDropdownDivider.vue'

const abierto = ref({})
const abrir = (k) => { abierto.value = { ...abierto.value, [k]: true } }
const cerrar = (k) => { abierto.value = { ...abierto.value, [k]: false } }

const POSICIONES = ['right', 'left', 'top', 'bottom']
</script>

<template>
  <Seccion titulo="XDialog · tamaño y cabecera" nota="width · small · show-button-close · flat-header" :cubre="['XDialog']">
    <Demo code="width · show-button-close" nota="cerrar intercepta con action-button-close" fila>
      <XButton label="Estandar 460px" variant="primary" @click="abrir('a')" />
      <XDialog :model-value="!!abierto.a" title="Nuevo comprobante" width="460px"
               show-button-close @action-button-close="cerrar('a')" @cancel="cerrar('a')">
        <template #content>
          <p style="margin:0; font-size:13px">Ancho fijo y boton X en la cabecera.</p>
        </template>
        <template #action-buttons>
          <XButton label="Cancelar" variant="secondary" flat @click="cerrar('a')" />
          <XButton label="Guardar" variant="primary" @click="cerrar('a')" />
        </template>
      </XDialog>
    </Demo>

    <Demo code="flat-header false" nota="cabecera con borde y fondo (el default es flat)" fila>
      <XButton label="Cabecera clasica" variant="secondary" @click="abrir('b')" />
      <XDialog :model-value="!!abierto.b" title="Cabecera con chrome" width="420px"
               :flat-header="false" show-button-close
               @action-button-close="cerrar('b')" @cancel="cerrar('b')">
        <template #content><p style="margin:0; font-size:13px">flat-header en false.</p></template>
      </XDialog>
    </Demo>

    <Demo code="#content-header" nota="franja extra bajo el titulo" fila>
      <XButton label="Con sub-cabecera" variant="secondary" @click="abrir('c')" />
      <XDialog :model-value="!!abierto.c" title="Con sub-cabecera" width="460px"
               show-button-close @action-button-close="cerrar('c')" @cancel="cerrar('c')">
        <template #content-header>
          <span style="font-size:12px; color:#64748b">3 registros seleccionados</span>
        </template>
        <template #content><p style="margin:0; font-size:13px">Contenido.</p></template>
      </XDialog>
    </Demo>

    <Demo code="loading" nota="overlay sobre todo el dialogo" fila>
      <XButton label="Con loading" variant="secondary" @click="abrir('d')" />
      <XDialog :model-value="!!abierto.d" title="Procesando" width="380px" loading
               show-button-close @action-button-close="cerrar('d')" @cancel="cerrar('d')">
        <template #content><p style="margin:0; font-size:13px">Enviando a SUNAT…</p></template>
      </XDialog>
    </Demo>
  </Seccion>

  <Seccion titulo="XDialog · posiciones" nota="position · is-full-height · full-screen" :cubre="['XDialog']">
    <Demo code="position" nota="acoplado a un borde de la pantalla" fila>
      <template v-for="p in POSICIONES" :key="p">
        <XButton :label="p" variant="secondary" @click="abrir(p)" />
        <XDialog :model-value="!!abierto[p]" :title="`Panel ${p}`" width="360px" :position="p"
                 :is-full-height="p === 'right' || p === 'left'"
                 show-button-close @action-button-close="cerrar(p)" @cancel="cerrar(p)">
          <template #content>
            <p style="margin:0; font-size:13px">position = {{ p }}</p>
          </template>
        </XDialog>
      </template>
    </Demo>
    <Demo code="full-screen" nota="ocupa toda la ventana" fila>
      <XButton label="Pantalla completa" variant="primary" @click="abrir('fs')" />
      <XDialog :model-value="!!abierto.fs" title="Pantalla completa" full-screen
               show-button-close @action-button-close="cerrar('fs')" @cancel="cerrar('fs')">
        <template #content><p style="margin:0; font-size:13px">full-screen.</p></template>
      </XDialog>
    </Demo>
    <Demo code="align-action-buttons" nota="between separa los botones a los extremos" fila>
      <XButton label="Botones separados" variant="secondary" @click="abrir('ab')" />
      <XDialog :model-value="!!abierto.ab" title="Acciones a los extremos" width="440px"
               align-action-buttons="between" show-button-close
               @action-button-close="cerrar('ab')" @cancel="cerrar('ab')">
        <template #content><p style="margin:0; font-size:13px">align-action-buttons = between.</p></template>
        <template #action-buttons>
          <XButton label="Eliminar" variant="danger" flat @click="cerrar('ab')" />
          <XButton label="Guardar" variant="primary" @click="cerrar('ab')" />
        </template>
      </XDialog>
    </Demo>
  </Seccion>

  <Seccion titulo="XDropdownMenu" nota="trigger · header · footer · align · items" :cubre="['XDropdownMenu']">
    <Demo code="#trigger" nota="el slot expone open; hay que invocarlo en el click" fila>
      <XDropdownMenu>
        <template #trigger="{ open }">
          <XButton label="Acciones" variant="secondary" icon-right="expand" @click="open" />
        </template>
        <XDropdownItem label="Ver detalle" icon="view" />
        <XDropdownItem label="Descargar XML" icon="file-code" />
        <XDropdownDivider />
        <XDropdownItem label="Anular" icon="delete" variant="danger" />
      </XDropdownMenu>
    </Demo>

    <Demo code="#header · #footer" nota="tipico menu de usuario" fila>
      <XDropdownMenu width="260px">
        <template #trigger="{ open }">
          <XButton label="Mi cuenta" variant="primary" icon="user" @click="open" />
        </template>
        <template #header>
          <div style="padding:4px 2px">
            <div style="font-weight:600; font-size:13px">Carlos Gaspar</div>
            <div style="font-size:11px; color:#667085">carlos@ejemplo.com</div>
          </div>
        </template>
        <XDropdownItem label="Perfil" icon="id-card" />
        <XDropdownItem label="Preferencias" icon="settings" />
        <XDropdownDivider />
        <XDropdownItem label="Cerrar sesion" icon="logout" variant="danger" />
      </XDropdownMenu>
    </Demo>

    <Demo code="align · width" nota="alineacion respecto del disparador" fila>
      <XDropdownMenu align="right" width="220px">
        <template #trigger="{ open }">
          <XButton label="Alineado a la derecha" variant="secondary" @click="open" />
        </template>
        <XDropdownItem label="Opcion 1" />
        <XDropdownItem label="Opcion 2" />
      </XDropdownMenu>
    </Demo>

    <Demo code="disable en items" nota="items inactivos y con enlace" fila>
      <XDropdownMenu>
        <template #trigger="{ open }">
          <XButton label="Con estados" variant="secondary" @click="open" />
        </template>
        <XDropdownItem label="Disponible" icon="success" />
        <XDropdownItem label="No disponible" icon="blocked" disable />
        <XDropdownDivider />
        <XDropdownItem label="Abrir docs" icon="book" href="#" target="_blank" />
      </XDropdownMenu>
    </Demo>
  </Seccion>
</template>

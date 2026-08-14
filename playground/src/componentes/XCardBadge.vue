<script setup>
import Seccion from '../components/Seccion.vue'
import Demo from '../components/Demo.vue'
import XCard from '@x/XCard/XCard.vue'
import XBadge from '@x/XBadge/XBadge.vue'
import XButton from '@x/XButton/XButton.vue'

// XBadge tiene mas variantes de las que se usan normalmente: ademas de los
// tipos semanticos hay estilos (solid / outlined / dot) y tamanios.
const TIPOS = ['primary', 'secondary', 'success', 'warning', 'danger', 'error', 'info', 'neutral', 'default']
const TAMANIOS = ['sm', 'md', 'lg']
const ESTILOS = ['solid', 'outlined', 'pill', 'dot']
</script>

<template>
  <Seccion titulo="XCard · estructura" nota="title · subtitle · icon · slots" :cubre="['XCard']">
    <Demo code="title · subtitle" fila>
      <XCard title="Comprobante" subtitle="F001-000123" style="width:260px">
        <div style="font-size:13px">Emitido y aceptado por SUNAT.</div>
      </XCard>
    </Demo>
    <Demo code="icon" nota="icono junto al titulo" fila>
      <XCard title="Con icono" subtitle="XCard" icon="fa-light fa-file-invoice" style="width:260px">
        <div style="font-size:13px">Contenido libre.</div>
      </XCard>
    </Demo>
    <Demo code="#header-buttons" nota="acciones a la derecha del titulo" fila>
      <XCard title="Resumen" subtitle="Agosto" style="width:300px">
        <template #header-buttons>
          <XButton icon="fa-light fa-ellipsis-vertical" flat round size="sm" />
        </template>
        <div style="font-size:13px">Con acciones en la cabecera.</div>
      </XCard>
    </Demo>
    <Demo code="#actions · actions-align" nota="pie de tarjeta" fila>
      <XCard title="Confirmar" style="width:300px">
        <div style="font-size:13px">¿Emitir el comprobante?</div>
        <template #actions>
          <XButton label="Cancelar" variant="secondary" flat />
          <XButton label="Emitir" variant="primary" />
        </template>
      </XCard>
    </Demo>
  </Seccion>

  <Seccion titulo="XCard · variantes" nota="bordered · flat · loading · padding" :cubre="['XCard']">
    <Demo code="bordered · flat" nota="con borde vs sin sombra ni borde" fila>
      <XCard title="Bordered" bordered style="width:220px">
        <div style="font-size:13px">Borde visible.</div>
      </XCard>
      <XCard title="Flat" flat style="width:220px">
        <div style="font-size:13px">Sin sombra.</div>
      </XCard>
    </Demo>
    <Demo code="loading" nota="overlay de carga sobre el contenido" fila>
      <XCard title="Cargando" loading style="width:260px; min-height:110px">
        <div style="font-size:13px">Contenido debajo del overlay.</div>
      </XCard>
    </Demo>
    <Demo code="content-padding" nota="contenido al ras, util para tablas" fila>
      <XCard title="Sin padding" content-padding="0" style="width:260px">
        <div style="font-size:13px; background:#f1f5f9; padding:10px">Bloque al ras.</div>
      </XCard>
    </Demo>
  </Seccion>

  <Seccion titulo="XBadge · tipos" nota="9 tipos semanticos" :cubre="['XBadge']">
    <Demo code="type" nota="cada tipo trae su par de colores">
      <div v-for="t in TIPOS" :key="t" class="pg-tile">
        <XBadge :label="t" :type="t" />
        <code>{{ t }}</code>
      </div>
    </Demo>
  </Seccion>

  <Seccion titulo="XBadge · estilos y tamaños" nota="solid / outlined / pill / dot × sm / md / lg" :cubre="['XBadge']">
    <Demo code="clases de estilo">
      <div v-for="e in ESTILOS" :key="e" class="pg-tile">
        <XBadge label="Aceptado" type="success" :class="`x-badge-${e}`" />
        <code>.x-badge-{{ e }}</code>
      </div>
    </Demo>
    <Demo code="clases de tamaño">
      <div v-for="s in TAMANIOS" :key="s" class="pg-tile">
        <XBadge label="Aceptado" type="success" :class="`x-badge-${s}`" />
        <code>.x-badge-{{ s }}</code>
      </div>
    </Demo>
    <Demo code="combinadas" nota="un estilo mas un tamaño">
      <div v-for="e in ESTILOS" :key="e" class="pg-tile">
        <XBadge label="Pendiente" type="warning" :class="`x-badge-${e} x-badge-lg`" />
        <code>.{{ e }} + .lg</code>
      </div>
    </Demo>
  </Seccion>

  <Seccion titulo="XBadge · iconos y color" nota="icon · icon-position · is-lighten-color" :cubre="['XBadge']">
    <Demo code="icon · icon-position">
      <div class="pg-tile">
        <XBadge label="Aceptado" type="success" icon="fa-solid fa-check" />
        <code>izquierda (default)</code>
      </div>
      <div class="pg-tile">
        <XBadge label="Pendiente" type="warning" icon="fa-light fa-clock" icon-position="right" />
        <code>icon-position=right</code>
      </div>
    </Demo>
    <Demo code="is-lighten-color" nota="fondo suave con texto del color">
      <div class="pg-tile"><XBadge label="Normal" type="info" /><code>sin</code></div>
      <div class="pg-tile"><XBadge label="Suave" type="info" is-lighten-color /><code>con</code></div>
    </Demo>
    <Demo code="color" nota="cualquier color de Quasar, ignorando el tipo">
      <div v-for="c in ['purple', 'teal', 'brown']" :key="c" class="pg-tile">
        <XBadge :label="c" :color="c" />
        <code>{{ c }}</code>
      </div>
    </Demo>
  </Seccion>
</template>

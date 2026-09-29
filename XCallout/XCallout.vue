<script setup>
/**
 * XCallout — aviso al estilo de las alertas de GitHub (Nota, Consejo, Importante,
 * Advertencia, Cuidado): barra de color a la izquierda, título con ícono y el texto
 * debajo. Para explicar un dato junto a él, sin el peso de un XBanner (que es un aviso de
 * pantalla).
 *
 *   <XCallout type="tip" title="Buen ritmo">Esta semana ya llevas…</XCallout>
 *   <XCallout type="warning" dense>…</XCallout>   (compacto, dentro de tarjetas)
 *
 * Un tipo desconocido cae a `note`: nunca pinta de verde un aviso cuyo tipo se escribió
 * mal (la misma regla que XBanner).
 *
 * Portado del fork de QuiroSys y adaptado al paquete: íconos por rol, títulos traducibles
 * con respaldo en español, y modo oscuro. El fondo tenue sale del MISMO color del tipo con
 * opacidad (pseudo-elemento), así que personalizar un tipo es cambiar UNA variable.
 */
import { computed } from 'vue'
import { ic } from '../icons/index.js'
import { useXT } from '../i18n/useXT.js'

defineOptions({ name: 'XCallout' })

const props = defineProps({
  // note | tip | important | warning | caution
  type: { type: String, default: 'note' },
  // Título; vacío = el del tipo (Nota, Consejo, Importante, Advertencia, Cuidado).
  title: { type: String, default: '' },
  // Ícono propio (rol del paquete o clase de cualquier set); vacío = el del tipo.
  icon: { type: String, default: '' },
  // Compacto: menos relleno y letra más chica, para usarlo dentro de tarjetas.
  dense: { type: Boolean, default: false },
})

const xt = useXT()

const TYPES = {
  note: { title: 'Nota', icon: 'info' },
  tip: { title: 'Consejo', icon: 'tip' },
  important: { title: 'Importante', icon: 'important' },
  warning: { title: 'Advertencia', icon: 'warning' },
  caution: { title: 'Cuidado', icon: 'danger' },
}

const kind = computed(() => (TYPES[props.type] ? props.type : 'note'))
const titleText = computed(() => props.title || xt(`components.callout.${kind.value}`, TYPES[kind.value].title))
const iconName = computed(() => ic(props.icon || TYPES[kind.value].icon))
</script>

<template>
  <div class="x-callout" :class="[`x-callout--${kind}`, { 'x-callout--dense': dense }]" role="note">
    <div class="x-callout__title">
      <q-icon :name="iconName" class="x-callout__icon" />
      <slot name="title">{{ titleText }}</slot>
    </div>
    <div class="x-callout__body">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/*
 * Los tonos son los de las alertas de GitHub, elegidos para que el TÍTULO (que va en el
 * color del tipo) pase contraste AA sobre fondo claro. Los semánticos del tema no sirven
 * para eso: el `warning` de Quasar es un amarillo (#F2C037) ilegible como texto.
 * Cada uno se puede pisar desde la app con su variable (--x-callout-warning, …).
 */
.x-callout {
  --x-callout-note: #0969da;
  --x-callout-tip: #1a7f37;
  --x-callout-important: #8250df;
  --x-callout-warning: #9a6700;
  --x-callout-caution: #cf222e;
  --x-callout-color: var(--x-callout-note);

  position: relative;
  isolation: isolate;
  padding: 8px 14px;
  border-left: 4px solid var(--x-callout-color);
  color: var(--x-text-body, #344054);

  // Fondo tenue del mismo color del tipo: opacidad sobre un pseudo-elemento, porque
  // `color-mix()` no existe en Safari 14 y un hex no admite alfa por variable.
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--x-callout-color);
    opacity: 0.07;
  }

  &--note { --x-callout-color: var(--x-callout-note); }
  &--tip { --x-callout-color: var(--x-callout-tip); }
  &--important { --x-callout-color: var(--x-callout-important); }
  &--warning { --x-callout-color: var(--x-callout-warning); }
  &--caution { --x-callout-color: var(--x-callout-caution); }
}

.x-callout__title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--x-callout-color);
}

.x-callout__icon {
  font-size: 16px;
}

.x-callout__body {
  font-size: 13px;
  line-height: 1.5;

  :deep(p) { margin: 0 0 4px; }
  :deep(p:last-child) { margin-bottom: 0; }
}

.x-callout--dense {
  padding: 6px 10px;

  .x-callout__title { font-size: 12px; margin-bottom: 2px; }
  .x-callout__icon { font-size: 14px; }
  .x-callout__body { font-size: 12px; }
}

</style>

<!--
| Modo oscuro, en un bloque SIN scope: en uno scoped, Vue reduce `:global(.body--dark)
| .x-callout` a `.body--dark` a secas y la regla terminaría aplicándose al body. Las clases
| llevan el prefijo del componente, así que no chocan con nada.
-->
<style lang="scss">
body.body--dark .x-callout {
  --x-callout-note: #4493f8;
  --x-callout-tip: #3fb950;
  --x-callout-important: #ab7df8;
  --x-callout-warning: #d29922;
  --x-callout-caution: #f85149;

  &::before { opacity: 0.12; }
}
</style>

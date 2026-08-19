<script setup>
import { ic } from '../icons/index.js'
/**
 * XHelpTip — ícono "?" de ayuda con tooltip informativo. Reemplaza descripciones
 * inline largas por un ícono discreto junto al label de un campo.
 *
 * Uso:
 *   <XHelpTip text="El precio ya trae el IGV incluido." />
 *   <XHelpTip>contenido por slot</XHelpTip>
 *
 * Los componentes de formulario (XInput, XSelect, XCheckbox) lo montan solos vía
 * su prop `help`; también se puede usar suelto.
 */
defineOptions({ name: 'XHelpTip' })

defineProps({
  text: { type: String, default: '' },
  icon: { type: String, default: 'help' },
  size: { type: String, default: '15px' },
  maxWidth: { type: String, default: '260px' },
})
</script>

<template>
  <q-icon
    :name="ic(icon)"
    :size="size"
    class="x-help-tip cursor-pointer"
    tabindex="0"
  >
    <q-tooltip
      anchor="top middle"
      self="bottom middle"
      :offset="[0, 6]"
      class="bg-grey-9 text-white"
    >
      <!-- El ancho máximo va en un div interno: el q-tooltip se teletransporta
           al body y no siempre reenvía su :style al contenido. -->
      <div class="x-help-tip__bubble" :style="{ maxWidth, whiteSpace: 'normal', lineHeight: 1.4 }">
        <slot>{{ text }}</slot>
      </div>
    </q-tooltip>
  </q-icon>
</template>

<style lang="scss" scoped>
.x-help-tip {
  color: #9ca3af;
  transition: color 0.15s ease;
  &:hover,
  &:focus-visible { color: var(--q-primary); }
}
.x-help-tip__bubble {
  font-size: 12px;
  line-height: 1.4;
  padding: 8px 10px;
  border-radius: 6px;
}
</style>

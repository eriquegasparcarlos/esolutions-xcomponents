<script setup>
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
  icon: { type: String, default: 'fa-regular fa-circle-question' },
  size: { type: String, default: '15px' },
  maxWidth: { type: String, default: '260px' },
})
</script>

<template>
  <q-icon
    :name="icon"
    :size="size"
    class="x-help-tip cursor-pointer"
    tabindex="0"
  >
    <q-tooltip
      anchor="top middle"
      self="bottom middle"
      :offset="[0, 6]"
      class="x-help-tip__bubble bg-grey-9 text-white"
      :style="{ maxWidth }"
    >
      <slot>{{ text }}</slot>
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

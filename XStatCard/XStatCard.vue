<script setup>
/**
 * XStatCard — tarjeta de UN número para tableros: ícono, título, valor grande, un chip de
 * contexto o de variación frente al período anterior, un texto chico y la ayuda "?" con la
 * definición del número.
 *
 *   <XStatCard
 *     icon="chart" tone="primary" title="Ventas de hoy"
 *     value="S/ 1,240.00" delta="12 %" delta-tone="positive" delta-icon="up"
 *     caption="18 comprobantes" help="Sin notas de crédito ni anulados."
 *   />
 *
 * Se arma sobre q-card flat bordered para verse igual que el resto de las tarjetas. El
 * valor null se pinta como "—": sin dato no es lo mismo que cero.
 *
 * Portado del fork de QuiroSys y adaptado al paquete: el tono `primary` sigue la marca del
 * tema (`--x-brand`), los textos usan los roles de texto de los tokens, las flechas son
 * íconos por rol y hay modo oscuro. Los fondos tenues salen del mismo color del tono con
 * opacidad, así que cada tono es UNA variable.
 */
import { ic } from '../icons/index.js'
import XHelpTip from '../XHelpTip/XHelpTip.vue'

defineOptions({ name: 'XStatCard' })

defineProps({
  title: { type: String, default: '' },
  value: { type: [String, Number], default: null },
  // Ícono de la baldosa: rol del paquete o clase de cualquier set.
  icon: { type: String, default: '' },
  // Tono del ícono: primary | purple | orange | green | red | amber | teal | grey
  tone: { type: String, default: 'primary' },
  // Chip junto al valor: una variación ("4 %") o un contexto ("5 de 7").
  delta: { type: String, default: '' },
  // positive | negative | warning | neutral
  deltaTone: { type: String, default: 'neutral' },
  // 'up' | 'down' | '' — flecha dentro del chip.
  deltaIcon: { type: String, default: '' },
  caption: { type: String, default: '' },
  help: { type: String, default: '' },
  loading: { type: Boolean, default: false },
})
</script>

<template>
  <q-card flat bordered class="x-stat-card">
    <q-card-section class="x-stat-card__body">
      <div class="x-stat-card__head">
        <span v-if="icon" class="x-stat-card__icon" :class="`x-stat-card__icon--${tone}`">
          <q-icon :name="ic(icon)" size="17px" />
        </span>
        <div class="x-stat-card__title">{{ title }}</div>
        <x-help-tip v-if="help" :text="help" class="x-stat-card__help" />
      </div>

      <template v-if="loading">
        <q-skeleton type="rect" width="45%" height="34px" class="q-mt-xs" />
        <q-skeleton type="text" width="85%" />
      </template>
      <template v-else>
        <div class="x-stat-card__value-row">
          <span class="x-stat-card__value">
            {{ value === null || value === undefined || value === '' ? '—' : value }}
          </span>
          <span
            v-if="delta"
            class="x-stat-card__delta"
            :class="`x-stat-card__delta--${deltaTone}`"
          >
            <q-icon
              v-if="deltaIcon"
              :name="ic(deltaIcon === 'down' ? 'trend-down' : 'trend-up')"
              size="12px"
            />
            {{ delta }}
          </span>
        </div>
        <div v-if="caption || $slots.default" class="x-stat-card__caption">
          <slot>{{ caption }}</slot>
        </div>
      </template>
    </q-card-section>
  </q-card>
</template>

<style lang="scss" scoped>
.x-stat-card {
  height: 100%;

  // Tonos del ícono. El texto va en el color pleno y el fondo es ese mismo color con
  // opacidad (ver `__icon::before`). Todos pasan AA como ícono sobre su propio fondo.
  --x-stat-primary: var(--x-brand, #1a56db);
  --x-stat-purple: #7b1fa2;
  --x-stat-orange: #c2410c;
  --x-stat-green: #15803d;
  --x-stat-red: #b91c1c;
  --x-stat-amber: #a16207;
  --x-stat-teal: #00796b;
  --x-stat-grey: var(--x-gray-600, #475467);
}

.x-stat-card__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.x-stat-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 36px;
}

.x-stat-card__icon {
  --x-stat-tone: var(--x-stat-primary);

  position: relative;
  isolation: isolate;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--x-stat-tone);

  // `color-mix()` no existe en Safari 14: el fondo tenue es el color con opacidad.
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    background: var(--x-stat-tone);
    opacity: 0.12;
  }

  &--primary { --x-stat-tone: var(--x-stat-primary); }
  &--purple { --x-stat-tone: var(--x-stat-purple); }
  &--orange { --x-stat-tone: var(--x-stat-orange); }
  &--green { --x-stat-tone: var(--x-stat-green); }
  &--red { --x-stat-tone: var(--x-stat-red); }
  &--amber { --x-stat-tone: var(--x-stat-amber); }
  &--teal { --x-stat-tone: var(--x-stat-teal); }
  &--grey { --x-stat-tone: var(--x-stat-grey); }
}

.x-stat-card__title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.25;
  color: var(--x-text-body, #344054);
}

.x-stat-card__help {
  margin-left: auto;
}

.x-stat-card__value-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 10px;
}

.x-stat-card__value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  color: var(--x-text, #1d2939);
}

.x-stat-card__delta {
  --x-stat-delta: var(--x-gray-600, #475467);

  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--x-stat-delta);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    background: var(--x-stat-delta);
    opacity: 0.12;
  }

  &--positive { --x-stat-delta: #15803d; }
  &--negative { --x-stat-delta: #b91c1c; }
  &--warning { --x-stat-delta: #92400e; }
  &--neutral { --x-stat-delta: var(--x-gray-600, #475467); }
}

.x-stat-card__caption {
  font-size: 13px;
  line-height: 1.4;
  color: var(--x-text-muted, #667085);
}

</style>

<!--
| Modo oscuro, en un bloque SIN scope: en uno scoped, Vue reduce `:global(.body--dark)
| .x-stat-card` a `.body--dark` a secas. Las clases llevan el prefijo del componente.
| Los mismos matices, más claros para leerse sobre la superficie oscura.
-->
<style lang="scss">
body.body--dark {
  .x-stat-card {
    --x-stat-purple: #ce93d8;
    --x-stat-orange: #fdba74;
    --x-stat-green: #86efac;
    --x-stat-red: #fca5a5;
    --x-stat-amber: #fcd34d;
    --x-stat-teal: #80cbc4;
    --x-stat-grey: var(--x-gray-300, #d0d5dd);
  }

  .x-stat-card__icon::before,
  .x-stat-card__delta::before {
    opacity: 0.18;
  }

  .x-stat-card .x-stat-card__delta--positive { --x-stat-delta: #86efac; }
  .x-stat-card .x-stat-card__delta--negative { --x-stat-delta: #fca5a5; }
  .x-stat-card .x-stat-card__delta--warning { --x-stat-delta: #fcd34d; }
  .x-stat-card .x-stat-card__delta--neutral { --x-stat-delta: var(--x-gray-300, #d0d5dd); }
}
</style>

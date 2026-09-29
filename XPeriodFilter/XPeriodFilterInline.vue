<script setup>
/**
 * XPeriodFilterInline — el filtro de período en línea, para tablas y reportes: un selector
 * con los modos y los campos de fecha o de mes que pide el modo elegido.
 *
 * v-model = el filtro con los nombres que lee el backend (FilterTrait::getFilterDate):
 *   { value, dateStart, dateEnd, monthStart, monthEnd }
 *   - value: 'month' | 'date' | 'between_months' | 'between_dates' | 'all'
 *   - dateStart / dateEnd: 'YYYY-MM-DD' · monthStart / monthEnd: 'YYYY-MM'
 *
 * Cada cambio del usuario emite UNA vez `update:modelValue` y `change` con los cinco
 * campos; los que no cambiaron van tal como llegaron (uno ausente sigue ausente). No emite
 * al montar: quien lo usa decide cuándo consultar.
 *
 * Se acomoda al ancho de SU columna, no al de la pantalla: cada campo tiene un ancho mínimo
 * (el de su texto más largo) y, si no entra al lado del otro, baja a la fila siguiente en
 * vez de cortar la fecha. Las dos fechas de un rango van AGRUPADAS, así que bajan juntas:
 * el modo queda arriba y el "desde / hasta" abajo, uno al lado del otro. Es la pieza que
 * comparten XTableServer y XcTable, que antes tenían cada uno su copia del mismo bloque.
 *
 * Portado del fork de QuiroSys y adaptado: etiquetas traducibles con respaldo en español,
 * la etiqueta de un modo que el servidor ya manda traducida se respeta, y SIN container
 * queries — el fork las usaba para lo mismo, pero `container-type` le quita al filtro su
 * ancho propio: en una columna que se ajusta al contenido (XcTable sin clase, o
 * `col-auto`) el filtro colapsaba a unos pocos píxeles.
 */
import { computed } from 'vue'
import XSelect from '../XSelect/XSelect.vue'
import XDatepicker from '../XDatepicker/XDatepicker.vue'
import XDatepickerMonth from '../XDatepicker/XDatepickerMonth.vue'
import { useXT } from '../i18n/useXT.js'
import { DEFAULT_PERIOD_MODES, PERIOD_FIELDS, PERIOD_MODE_LABELS } from './periodModes.js'

defineOptions({ name: 'XPeriodFilterInline' })

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  // Modos, en su orden: ids ('month', …) u objetos { id, name } como los manda el backend
  // (Filter::makePeriod). Sin modos: los cuatro de siempre.
  options: { type: Array, default: null },
  label: { type: String, default: '' },
  // Espaciado entre campos: el de la grilla donde va ('sm' en los filtros de las tablas,
  // 'md' en un formulario), para que queden alineados con los de arriba y abajo.
  gutter: { type: String, default: 'sm' },
  // En el teléfono, un campo por fila, como el resto de un formulario.
  stack: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'change'])

const xt = useXT()

const current = computed(() => Object.fromEntries(PERIOD_FIELDS.map((k) => [k, props.modelValue?.[k]])))

/*
| La etiqueta de cada modo: la que manda el servidor si ya viene traducida; si no (llega el
| id pelado, o solo el id), la del componente.
*/
const modeOptions = computed(() => (props.options?.length ? props.options : DEFAULT_PERIOD_MODES).map((o) => {
  const isObject = o !== null && typeof o === 'object'
  const id = isObject ? o.id : o
  const serverName = isObject && o.name && o.name !== id ? o.name : null
  return { id, name: serverName || xt(`components.periodModes.${id}`, PERIOD_MODE_LABELS[id] || id) }
}))

const mode = computed(() => current.value.value)
const isDateMode = computed(() => mode.value === 'date' || mode.value === 'between_dates')
const isMonthMode = computed(() => mode.value === 'month' || mode.value === 'between_months')

const labels = computed(() => ({
  mode: props.label || xt('components.period', 'Periodo'),
  date: xt('components.date', 'Fecha'),
  dateFrom: xt('components.dateFrom', 'Fecha desde'),
  dateTo: xt('components.dateTo', 'Fecha hasta'),
  month: xt('components.month', 'Mes'),
  monthFrom: xt('components.monthFrom', 'Mes desde'),
  monthTo: xt('components.monthTo', 'Mes hasta'),
}))

// Con un rango (dos campos), el modo baja a su propia fila cuando los tres no caben: así
// las dos fechas quedan juntas (ver los estilos).
// El espaciado de la grilla de Quasar, como `gap` del flex (sin los márgenes negativos de
// q-col-gutter, que se descuadran cuando el filtro va dentro de otra fila con gutter).
const GAPS = { none: '0px', xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '48px' }
const rootStyle = computed(() => ({ '--x-period-gap': GAPS[props.gutter] ?? GAPS.sm }))
const rootClass = computed(() => ['x-period-filter-inline', { 'x-period-filter-inline--stack': props.stack }])

function set (field, val) {
  const next = { ...current.value, [field]: val }
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<template>
  <div :class="rootClass" :style="rootStyle">
    <div v-if="modeOptions.length > 1" class="x-period-filter-inline__mode">
      <x-select
        :model-value="mode"
        :label="labels.mode"
        :options="modeOptions"
        @update:model-value="(v) => set('value', v)"
      />
    </div>

    <!-- Las fechas del modo, AGRUPADAS: si no entran al lado del modo bajan juntas. -->
    <div
      v-if="isDateMode || isMonthMode"
      class="x-period-filter-inline__range"
      :class="{ 'x-period-filter-inline__range--month': isMonthMode }"
    >
      <template v-if="isDateMode">
        <div class="x-period-filter-inline__field">
          <x-datepicker
            :model-value="current.dateStart"
            :label="mode === 'date' ? labels.date : labels.dateFrom"
            @update:model-value="(v) => set('dateStart', v)"
          />
        </div>
        <div v-if="mode === 'between_dates'" class="x-period-filter-inline__field">
          <x-datepicker
            :model-value="current.dateEnd"
            :label="labels.dateTo"
            @update:model-value="(v) => set('dateEnd', v)"
          />
        </div>
      </template>

      <template v-else>
        <div class="x-period-filter-inline__field">
          <x-datepicker-month
            :model-value="current.monthStart"
            :label="mode === 'month' ? labels.month : labels.monthFrom"
            @update:model-value="(v) => set('monthStart', v)"
          />
        </div>
        <div v-if="mode === 'between_months'" class="x-period-filter-inline__field">
          <x-datepicker-month
            :model-value="current.monthEnd"
            :label="labels.monthTo"
            @update:model-value="(v) => set('monthEnd', v)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/*
 * Anchos mínimos medidos en el fork con un campo denso de Quasar: modo 145 px ("Entre
 * fechas"), fecha 140 px (la fecha más ancha hasta 2040, "04/04/2040"), mes 120 px
 * ("04/2040"). Con eso un texto nunca se corta: lo que no entra baja de fila.
 *
 * Flex con `gap` y bases, no container queries: el filtro conserva su ancho propio, así
 * que también funciona en una columna que se ajusta al contenido.
 */
.x-period-filter-inline {
  display: flex;
  flex-wrap: wrap;
  gap: var(--x-period-gap, 8px);
  width: 100%;
}

.x-period-filter-inline__mode {
  flex: 1 1 145px;
  min-width: 145px;
}

// El grupo de fechas pide lugar para sus dos campos: si no entra al lado del modo, baja
// ENTERO a la fila siguiente y las dos fechas quedan juntas.
.x-period-filter-inline__range {
  display: flex;
  flex-wrap: wrap;
  flex: 2 1 280px;
  gap: var(--x-period-gap, 8px);
  min-width: 140px;
}

.x-period-filter-inline__field {
  flex: 1 1 140px;
  min-width: 140px;
}

.x-period-filter-inline__range--month {
  flex-basis: 240px;
  min-width: 120px;

  .x-period-filter-inline__field {
    flex-basis: 120px;
    min-width: 120px;
  }
}

// En el teléfono, un campo por fila (como el resto de un formulario), si se pidió.
@media (max-width: 599px) {
  .x-period-filter-inline--stack,
  .x-period-filter-inline--stack .x-period-filter-inline__range {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

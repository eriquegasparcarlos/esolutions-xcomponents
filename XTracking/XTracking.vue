<script setup>
defineOptions({
  name: 'XTracking',
})

/**
 * Timeline de seguimiento de un documento (sale, quotation, dispatch, ...).
 *
 * Componente PRESENTACIONAL: no hace fetch ni reordena. La app carga los
 * datos (composable useTracking o similar) y los pasa por props, ya en el
 * orden en que deben pintarse (convención: más reciente primero).
 *
 * Formato esperado de cada registro (TrackingCollection del backend):
 *  { title, description, user_name, status: bool, created_at }
 *
 * Diseño compacto: cabecera en una línea (título + fecha) y descripción
 * con el usuario en una segunda línea. Sin hover/ripple: es un log de
 * solo lectura, nada es clickeable.
 */

defineProps({
  records: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="x-tracking">
    <div v-if="loading" class="flex flex-center q-pa-lg">
      <q-spinner-dots size="32px" color="primary" />
    </div>

    <div v-else-if="records.length === 0" class="column flex-center q-pa-lg text-grey-6">
      <q-icon name="fa-light fa-timeline" size="36px" class="q-mb-sm" />
      <div class="text-body2">Sin eventos registrados.</div>
    </div>

    <q-timeline v-else color="secondary">
      <q-timeline-entry v-for="(track, index) in records"
                        :key="index"
                        :color="(track.status)?'positive':'negative'">
        <div class="x-tracking-head">
          <span class="x-tracking-title">{{ track.title }}</span>
          <span class="x-tracking-date">{{ track.created_at }}</span>
        </div>
        <div class="x-tracking-desc">
          {{ track.description }}<template v-if="track.user_name"> · {{ track.user_name }}</template>
        </div>
      </q-timeline-entry>
    </q-timeline>
  </div>
</template>

<script setup>
defineOptions({
  name: 'XTracking',
})

/**
 * Timeline de seguimiento de un documento (sale, quotation, dispatch, ...).
 *
 * Componente PRESENTACIONAL: no hace fetch. La app carga los datos
 * (composable useTracking o similar) y los pasa por props.
 *
 * Formato esperado de cada registro (TrackingCollection del backend):
 *  { title, description, user_name, status: bool, created_at }
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
  <div class="x-tracking" style="min-height: 100px;">
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
                        :title="track.title"
                        :subtitle="track.created_at"
                        :color="(track.status)?'positive':'negative'">
        <q-item dense v-ripple class="q-pa-none">
          <q-item-section>
            <q-item-label lines="1">{{ track.user_name }}</q-item-label>
            <q-item-label caption lines="3">
              {{ track.description }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-timeline-entry>
    </q-timeline>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref, watch, onMounted } from 'vue'

defineOptions({
  name: 'XTracking',
})

/**
 * Timeline de seguimiento de un documento (sale, quotation, dispatch, ...).
 *
 * Dos modos de uso:
 *  1) Self-fetch (recomendado): pasar `resource` + `recordId` — el componente
 *     consulta `GET /{resource}/tracking/{recordId}` al montarse y cuando
 *     cambia el recordId.
 *  2) Controlado: pasar `records` ya cargados (se usan si no hay
 *     resource/recordId).
 *
 * Formato esperado de cada registro (TrackingCollection del backend):
 *  { title, description, user_name, status: bool, created_at }
 */

const props = defineProps({
  records: {
    type: Array,
    default: () => []
  },
  resource: {
    type: String,
    default: null
  },
  recordId: {
    type: [Number, String],
    default: null
  }
})

const { proxy } = getCurrentInstance()

const loading = ref(false)
const fetchedRecords = ref(null) // null = aún no se hizo fetch

const rows = () => fetchedRecords.value ?? props.records

async function fetchTracking() {
  if (!props.resource || !props.recordId) return
  loading.value = true
  try {
    const { data } = await proxy.$api.get(`/${props.resource}/tracking/${props.recordId}`)
    // TrackingCollection responde {data: [...]} (ResourceCollection) o array plano
    fetchedRecords.value = Array.isArray(data) ? data : (data.data ?? [])
  } catch {
    fetchedRecords.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchTracking)
watch(() => props.recordId, fetchTracking)

defineExpose({ refresh: fetchTracking })
</script>

<template>
  <div class="x-tracking" style="min-height: 100px;">
    <div v-if="loading" class="flex flex-center q-pa-lg">
      <q-spinner-dots size="32px" color="primary" />
    </div>

    <div v-else-if="rows().length === 0" class="column flex-center q-pa-lg text-grey-6">
      <q-icon name="fa-light fa-timeline" size="36px" class="q-mb-sm" />
      <div class="text-body2">Sin eventos registrados.</div>
    </div>

    <q-timeline v-else color="secondary">
      <q-timeline-entry v-for="(track, index) in rows()"
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

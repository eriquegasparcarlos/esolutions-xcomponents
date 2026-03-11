<script setup>
defineOptions({
  name: 'XTracking',
})

const props = defineProps({
  records: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <q-timeline color="secondary" class="x-tracking" style="min-height: 100px;">
    <q-timeline-entry v-for="(track, index) in props.records"
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
</template>

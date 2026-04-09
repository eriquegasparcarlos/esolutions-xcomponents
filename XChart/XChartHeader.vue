<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'XChartHeader',
})

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  value: {
    type: String,
    default: '',
  },
  percentage: {
    type: String,
    default: '',
  },
  direction: {
    type: String,
    default: '', // 'up' | 'down'
  },
  color: {
    type: String,
    default: '', // 'positive' | 'negative'
  },
  icon: {
    type: String,
    default: '',
  },
  iconColor: {
    type: String,
    default: 'grey-4',
  },
})

const trendIcon = computed(() => {
  if (props.direction === 'up') return 'fal fa-arrow-up'
  if (props.direction === 'down') return 'fal fa-arrow-down'
  return ''
})

const trendColorClass = computed(() => {
  if (props.color === 'positive') return 'text-positive'
  if (props.color === 'negative') return 'text-negative'
  return ''
})
</script>

<template>
  <div class="x-chart-header row items-center full-width no-wrap">
    <!-- Left: icon | title + subtitle -->
    <div class="col row items-center no-wrap">
      <q-icon v-if="icon" :name="icon" size="20px" class="q-mr-sm flex-shrink-0"/>
      <div>
        <div class="text-h6">{{ title }}</div>
        <div v-if="subtitle" class="text-caption text-grey-5 q-mt-xs">{{ subtitle }}</div>
      </div>
    </div>

    <!-- Right: value + trend + actions -->
    <div class="col-auto row items-center no-wrap q-gutter-x-sm">
      <div v-if="value || percentage" class="row items-center q-gutter-x-xs">
        <span v-if="value" class="text-h6 text-weight-bold">{{ value }}</span>
        <q-badge
          v-if="percentage"
          :class="trendColorClass"
          class="x-chart-trend-badge"
          rounded
          outline
        >
          <q-icon v-if="trendIcon" :name="trendIcon" size="10px" class="q-mr-xs"/>
          {{ percentage }}
        </q-badge>
      </div>
      <slot name="actions"/>
    </div>
  </div>
</template>

<style scoped>
.x-chart-header {
  padding: 0;
}

.x-chart-trend-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
}
</style>

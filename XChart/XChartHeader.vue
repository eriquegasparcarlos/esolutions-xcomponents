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
  <div class="x-chart-header">
    <div class="row items-start justify-between no-wrap">
      <!-- Left: Icon + KPI + Title -->
      <div class="col row items-start no-wrap q-gutter-x-md">
        <!-- Optional icon -->
        <div v-if="icon" class="col-auto">
          <q-avatar
            :icon="icon"
            :color="iconColor"
            text-color="white"
            size="42px"
            font-size="20px"
          />
        </div>

        <div class="col">
          <div class="row items-center q-gutter-x-sm no-wrap">
            <div v-if="value" class="text-h5 text-weight-bold">
              {{ value }}
            </div>
            <q-badge
              v-if="percentage"
              :class="trendColorClass"
              class="x-chart-trend-badge"
              rounded
              outline
            >
              <q-icon
                v-if="trendIcon"
                :name="trendIcon"
                size="10px"
                class="q-mr-xs"
              />
              {{ percentage }}
            </q-badge>
          </div>
          <div v-if="title" class="text-caption text-grey-7 q-mt-xs">
            {{ title }}
          </div>
          <div v-if="subtitle" class="text-caption text-grey-5 q-mt-xs">
            {{ subtitle }}
          </div>
        </div>
      </div>

      <!-- Right: slot for actions -->
      <div class="col-auto row items-center no-wrap q-gutter-x-sm">
        <slot name="actions" />
      </div>
    </div>

    <!-- Extra slot for custom content below header -->
    <slot />
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

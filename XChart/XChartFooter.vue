<script setup>
defineOptions({
  name: 'XChartFooter',
})

defineProps({
  linkLabel: {
    type: String,
    default: '',
  },
  linkTo: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="x-chart-footer row items-center justify-between no-wrap">
    <!-- Left: slot for dropdown/filters -->
    <div class="col-auto">
      <slot />
    </div>

    <!-- Right: action link -->
    <div class="col-auto">
      <slot name="right">
        <router-link
          v-if="linkLabel && linkTo"
          :to="linkTo"
          class="x-chart-footer-link text-primary text-weight-medium"
        >
          {{ linkLabel }}
          <q-icon name="fal fa-chevron-right" size="12px" class="q-ml-xs" />
        </router-link>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.x-chart-footer-link {
  font-size: 13px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.x-chart-footer-link:hover {
  text-decoration: underline;
}
</style>

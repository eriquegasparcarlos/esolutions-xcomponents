<script setup>
defineProps({
  title: { type: String, default: '' },
  loading: { type: Boolean, default: false },
})
</script>
<template>
  <q-card flat bordered class="q-mb-md">
    <q-card-section v-if="title">
      <div class="text-subtitle1 text-weight-bold">{{ title }}</div>
    </q-card-section>
    <q-separator v-if="title" />
    <q-card-section>
      <q-inner-loading :showing="loading" />
      <slot />
    </q-card-section>
    <q-card-actions v-if="$slots.actions" align="right">
      <slot name="actions" />
    </q-card-actions>
  </q-card>
</template>

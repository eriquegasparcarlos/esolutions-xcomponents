<script setup>
import {computed, useSlots} from 'vue'

defineOptions({
  name: 'XCard',
})

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  flat: {
    type: Boolean,
    default: true,
  },
  fullHeight: {
    type: Boolean,
    default: false,
  },
  contentFlush: {
    type: Boolean,
    default: false,
  },
})

const slots = useSlots()
const hasHeaderButtons = computed(() => !!slots['header-buttons'])
const hasHeader = computed(() => props.title || props.icon || hasHeaderButtons.value)
</script>

<template>
  <q-card :flat="flat" class="x-card" :class="{ 'full-height': fullHeight }">
    <q-card-section v-if="hasHeader" class="x-card-section-title">
      <div class="title">
        <q-icon v-if="icon" :name="icon" class="q-mr-sm"/>
        {{ title }}
      </div>
      <div v-if="hasHeaderButtons">
        <slot name="header-buttons"/>
      </div>
    </q-card-section>
    <q-card-section class="x-form-section-content" :class="{ 'q-pa-none': contentFlush }">
      <slot/>
    </q-card-section>
  </q-card>
</template>

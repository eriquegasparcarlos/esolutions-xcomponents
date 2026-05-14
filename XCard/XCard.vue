<script setup>
import { computed, useSlots } from 'vue'
import XLoading from '../XLoading/XLoading.vue'

defineOptions({
  name: 'XCard',
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
  contentPadding: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingIcon: {
    type: String,
    default: '',
  },
})

const slots = useSlots()
const hasHeaderButtons = computed(() => !!slots['header-buttons'])
const hasHeader = computed(() => props.title || props.subtitle || props.icon || hasHeaderButtons.value)
</script>

<template>
  <q-card :flat="flat" class="x-card" :class="{ 'full-height': fullHeight }">
    <q-card-section v-if="hasHeader" class="q-py-none x-card-section-title">
      <div class="row items-center no-wrap col">
        <q-icon v-if="icon" :name="icon" size="20px" class="q-mr-md flex-shrink-0"/>
        <div>
          <div class="text-h6" style="margin-bottom: 0; line-height: 1.2">{{ title }}</div>
          <div v-if="subtitle" class="text-caption text-grey-5">{{ subtitle }}</div>
        </div>
      </div>
      <div v-if="hasHeaderButtons" class="flex-shrink-0">
        <slot name="header-buttons"/>
      </div>
    </q-card-section>
    <q-card-section class="x-form-section-content" :class="contentPadding ? 'q-pa-md' : 'q-pa-none'">
      <slot/>
    </q-card-section>
    <x-loading :loading="loading" :icon="loadingIcon"/>
  </q-card>
</template>

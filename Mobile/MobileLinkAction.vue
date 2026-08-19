<script setup>
import { ic } from '../icons/index.js'
defineProps(['description', 'icon', 'showLink'])
</script>

<template>
  <q-item clickable v-ripple
          @click="$emit('click')"
          v-if="showLink">
    <q-item-section avatar style="min-width: 36px;">
      <q-icon size="1.6em" :name="ic(icon)"></q-icon>
    </q-item-section>
    <q-item-section class="text-black text-weight-regular">{{ description }}</q-item-section>
  </q-item>
</template>

<script setup>
defineProps(['textLeft', 'textRight'])
</script>

<template>
  <q-item>
    <q-item-section class="text-black text-weight-bold">
      <div class="flex justify-between">
        <div v-if="textLeft">{{ textLeft }}</div>
        <div v-if="textRight" class="ellipsis" style="max-width: 150px;">{{ textRight }}</div>
      </div>
    </q-item-section>
  </q-item>
</template>



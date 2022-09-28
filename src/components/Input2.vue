<script setup lang="ts">
  import {ref} from "vue";

  const msg = ref("input2");

  defineProps<{count: number}>();
</script>

<template>
  <div className="border">
    <h1>{{ msg }}</h1>
    <input v-model="msg" />
    <p>count2: {{ count }}</p>
  </div>
</template>

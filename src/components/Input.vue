<script setup lang="ts">
  import {ref} from "vue";

  const msg = ref("input");

  defineProps<{count: number}>();
</script>

<template>
  <h1>{{ msg }}</h1>
  <input v-model="msg" />

  <p>{{ count }}</p>
</template>

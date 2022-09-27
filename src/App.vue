<script setup lang="ts">
  // This starter template is using Vue 3 <script setup> SFCs
  // Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
  import Input from "./components/Input.vue";

  import {ref} from "vue";

  const count = ref(1);
</script>

<template>
  <button type="button" @click="count++">count is {{ count }}</button>

  <keep-alive>
    <Input v-if="count % 2" />
  </keep-alive>
</template>

<style scoped></style>

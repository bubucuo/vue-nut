<script setup lang="ts">
  // This starter template is using Vue 3 <script setup> SFCs
  // Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
  import Input from "./components/Input.vue";
  import Input2 from "./components/Input2.vue";

  import {ref} from "vue";
  const count = ref(1);
</script>

<template>
  <button type="button" @click="count++">count is {{ count }}</button>

  <my-keep-alive max="2" include="Input" exclude="Input2">
    <component :is="Input" v-if="count % 2" :count="count" />
    <component :is="Input2" v-else :count="count" />
  </my-keep-alive>
</template>

<style scoped></style>

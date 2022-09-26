<script setup lang="ts">
  // This starter template is using Vue 3 <script setup> SFCs
  // Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
  import HelloWorld from "./components/HelloWorld.vue";
  import Input from "./components/Input.vue";

  // import MyKeepAlive from "./components/MyKeepAlive.vue";

  import {ref} from "vue";

  defineProps<{msg: string}>();

  const count = ref(1);
</script>

<template>
  <button type="button" @click="count++">count is {{ count }}</button>

  <!-- <component :is="activeComponent" /> -->

  <HelloWorld msg="oh" />

  <MyKeepAlive>
    <Input v-if="count % 2" />
  </MyKeepAlive>
</template>

<style scoped>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
  }
</style>

<script setup lang="ts">
  // This starter template is using Vue 3 <script setup> SFCs
  // Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
  import Input1 from "./components/Input1.vue";
  import Input2 from "./components/Input2.vue";
  import Input3 from "./components/Input3.vue";

  import {ref} from "vue";

  const count = ref(1);
</script>

<template>
  <button type="button" @click="count++">count is {{ count }}</button>

  <keep-alive max="2">
    <view>
      <component :is="Input1" v-if="count % 2" />
      <component :is="Input2" v-else />
      <component :is="Input3" />
    </view>
  </keep-alive>
</template>

<style scoped></style>

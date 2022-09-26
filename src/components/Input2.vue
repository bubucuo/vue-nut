<script setup>
  import {ref} from "vue";

  const msg = ref("default2");
</script>

<template>
  <h1>input2 {{ msg }}</h1>
  <input v-model="msg" />
</template>

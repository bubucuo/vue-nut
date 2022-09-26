<script setup>
  import {ref} from "vue";

  const msg = ref("default1");
</script>

<template>
  <h1>input1 {{ msg }}</h1>
  <input v-model="msg" />
</template>

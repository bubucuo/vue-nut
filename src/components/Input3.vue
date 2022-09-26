<script setup>
  import {ref} from "vue";

  const msg = ref("default3");
</script>

<template>
  <h1>input3 {{ msg }}</h1>
  <input v-model="msg" />
</template>

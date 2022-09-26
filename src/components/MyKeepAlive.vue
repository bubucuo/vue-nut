<script lang="ts">
  export type MatchPattern = string | RegExp | (string | RegExp)[];

  interface KeepAliveProps {
    include?: MatchPattern;
    exclude?: MatchPattern;
    max?: number | string;
  }

  type VNode = any;
  type CacheKey = string | number | symbol | ConcreteComponent;
  type Cache = Map<CacheKey, VNode>;
  type Keys = Set<CacheKey>;
</script>

<template>
  <h1>KeepAlive</h1>

  <p>{{ msg }}</p>
</template>

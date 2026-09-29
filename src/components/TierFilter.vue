<script setup>
import { FILTERS } from "@/data/sections";

const model = defineModel({ type: String, default: "all" });

const options = FILTERS.map((item) => ({ label: item.label, value: item.key }));
</script>

<template>
  <div class="filter-bar">
    <span class="filter-label">只看：</span>
    <el-segmented v-model="model" :options="options" aria-label="性价比筛选" />
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  done: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});

const percent = computed(() =>
  props.total ? Math.round((props.done / props.total) * 100) : 0
);

/** 金色进度、满进度转绿 */
function barColor(value) {
  return value >= 100 ? "#2e7d32" : "#b8860b";
}
</script>

<template>
  <div class="progress-line">
    <el-progress
      :percentage="percent"
      :stroke-width="10"
      :show-text="false"
      :color="barColor"
    />
    <span class="progress-text">{{ done }} / {{ total }}&nbsp;&nbsp;({{ percent }}%)</span>
  </div>
</template>

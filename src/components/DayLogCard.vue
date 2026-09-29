<script setup>
import { computed, ref } from "vue";
import { SECTION_MAP, TIERS, TIER_TAG_TYPES } from "@/data/sections";
import { formatDateLabel, formatRange } from "@/utils/period";

const props = defineProps({
  log: { type: Object, required: true },
});

const open = ref(false);

const title = computed(() =>
  props.log.cycle === "daily"
    ? formatDateLabel(props.log.periodKey)
    : `周 ${formatRange(props.log.range)}`
);

const cycleLabel = computed(() => (props.log.cycle === "daily" ? "每日" : "每周"));

const rateType = computed(() => (props.log.rate >= 100 ? "success" : "danger"));

const barColor = computed(() => (props.log.rate >= 100 ? "#2e7d32" : "#b8860b"));

const finishedItems = computed(() => props.log.items.filter((item) => item.done));
const missed = computed(() => props.log.items.filter((item) => !item.done));

const archivedLabel = computed(() => {
  if (!props.log.archivedAt) return "";
  const d = new Date(props.log.archivedAt);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
});

function sectionName(key) {
  return SECTION_MAP[key]?.name || key;
}
</script>

<template>
  <el-card class="stack log-card" shadow="never">
    <div class="log-head">
      <div>
        <strong>{{ title }}</strong>
        <span class="muted small" style="margin-left: 8px">
          {{ cycleLabel }} · 共 {{ log.total }} 项
        </span>
      </div>
      <span class="spacer"></span>
      <el-tag :type="rateType" effect="light">
        {{ log.doneCount }} / {{ log.total }} · {{ log.rate }}%
      </el-tag>
      <el-button size="small" @click="open = !open">
        {{ open ? "收起明细" : "查看明细" }}
      </el-button>
    </div>

    <el-progress
      :percentage="log.rate"
      :stroke-width="6"
      :show-text="false"
      :color="barColor"
      style="margin: 12px 0 0"
    />

    <div class="log-meta">
      <el-tag
        v-for="section in log.sections"
        :key="section.key"
        type="info"
        size="small"
        effect="plain"
      >
        {{ section.name }} {{ section.done }}/{{ section.total }}
      </el-tag>
      <el-tag v-if="log.gapAfter > 0" type="warning" size="small" effect="light">
        其后有 {{ log.gapAfter }} 期未打开工具、无记录
      </el-tag>
      <span v-if="archivedLabel" class="muted small mono">归档于 {{ archivedLabel }}</span>
    </div>

    <el-collapse-transition>
      <div v-show="open" class="detail">
        <div v-if="finishedItems.length" class="log-group">
          <div class="log-group-title done">已完成（{{ finishedItems.length }}）</div>
          <ul class="log-list">
            <li v-for="item in finishedItems" :key="item.id">
              <el-tag :type="TIER_TAG_TYPES[item.tier]" size="small" effect="plain">
                {{ TIERS[item.tier].stars }}
              </el-tag>
              <span>{{ item.title }}</span>
              <span class="muted small">· {{ sectionName(item.section) }}</span>
            </li>
          </ul>
        </div>

        <div v-if="missed.length" class="log-group">
          <div class="log-group-title missed">未完成（{{ missed.length }}）</div>
          <ul class="log-list">
            <li v-for="item in missed" :key="item.id">
              <el-tag :type="TIER_TAG_TYPES[item.tier]" size="small" effect="plain">
                {{ TIERS[item.tier].stars }}
              </el-tag>
              <span>{{ item.title }}</span>
              <span class="muted small">· {{ sectionName(item.section) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </el-collapse-transition>
  </el-card>
</template>

<style scoped>
.log-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.detail {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--line);
}
</style>

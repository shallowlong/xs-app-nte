<script setup>
import { computed, ref } from "vue";
import DayLogCard from "@/components/DayLogCard.vue";
import { useChecklistStore } from "@/stores/checklist";

const store = useChecklistStore();

const TABS = [
  { label: "每日", value: "daily" },
  { label: "每周（含都市闲趣）", value: "weekly" },
];

const tab = ref("daily");

const currentList = computed(() => store.logsByCycle[tab.value] || []);

const statCards = computed(() => [
  {
    key: "streak",
    label: "连续满分打卡",
    value: store.stats.streak,
    suffix: "期",
    hint: "每日完成率 100% 连续累计",
  },
  {
    key: "average",
    label: "近 30 期平均完成率",
    value: store.stats.averageRate,
    suffix: "%",
    hint: `共 ${store.stats.recentCount} 期记录`,
  },
  {
    key: "perfect",
    label: "满分周期数",
    value: store.stats.perfectDays,
    suffix: "期",
    hint: "每日 100% 完成的期数",
  },
  {
    key: "archived",
    label: "已归档周期",
    value: store.stats.dailyCount + store.stats.weeklyCount,
    suffix: "期",
    hint: `每日 ${store.stats.dailyCount} · 每周 ${store.stats.weeklyCount}`,
  },
]);

function onExport() {
  if (!store.logs.length) {
    window.alert("还没有历史日志可导出。");
    return;
  }
  store.exportLogs();
}

function onClearHistory() {
  const ok = window.confirm(
    "确定清空全部历史日志？此操作不可撤销。\n当前勾选进度不受影响。"
  );
  if (ok) store.clearHistory();
}
</script>

<template>
  <el-card class="stack" shadow="never">
    <div class="row">
      <h1 class="hero-title">历史回看<span class="sub">每个周期结束自动归档</span></h1>
      <span class="spacer"></span>
      <el-button @click="onExport">导出日志 JSON</el-button>
      <el-button type="danger" plain :disabled="!store.logs.length" @click="onClearHistory">
        清空历史
      </el-button>
    </div>

    <p class="meta" style="margin-top: 10px">
      归档规则：跨过「每日 05:00」或「周一 05:00」时，上一周期的完成情况会自动落盘；
      「一次性」分区不参与归档。记录保存在本机浏览器，不会上传。
    </p>
  </el-card>

  <el-row :gutter="14" class="stats-row">
    <el-col v-for="card in statCards" :key="card.key" :xs="12" :sm="12" :md="6">
      <el-card shadow="never" class="stat-card">
        <el-statistic :value="card.value">
          <template #title>{{ card.label }}</template>
          <template #suffix>{{ card.suffix }}</template>
        </el-statistic>
        <div class="stat-hint">{{ card.hint }}</div>
      </el-card>
    </el-col>
  </el-row>

  <div class="filter-bar">
    <span class="filter-label">查看：</span>
    <el-segmented v-model="tab" :options="TABS" aria-label="历史类型切换" />
    <span class="spacer"></span>
    <span class="meta">共 {{ currentList.length }} 期</span>
  </div>

  <el-card v-if="!currentList.length" class="stack" shadow="never">
    <el-empty description="还没有历史记录">
      <template #description>
        <div class="empty-text">
          历史日志会在周期切换（每日 05:00 / 周一 05:00）时自动归档，<br />
          跨过重置点后回到本页即可看到这一期的完成情况。
        </div>
      </template>
    </el-empty>
  </el-card>

  <template v-else>
    <DayLogCard v-for="log in currentList" :key="log.id" :log="log" />
  </template>
</template>

<style scoped>
.stats-row {
  margin-bottom: 4px;
}

.stats-row :deep(.el-col) {
  margin-bottom: 14px;
}

.stat-card :deep(.el-statistic__suffix) {
  color: var(--gold);
  font-size: 13px;
  font-weight: 600;
  margin-left: 2px;
}

.empty-text {
  font-size: 13px;
  line-height: 1.9;
  color: var(--ink-3);
}
</style>

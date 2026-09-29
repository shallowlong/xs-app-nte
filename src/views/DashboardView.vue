<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import CheckSection from "@/components/CheckSection.vue";
import ProgressBar from "@/components/ProgressBar.vue";
import SourceFooter from "@/components/SourceFooter.vue";
import TierFilter from "@/components/TierFilter.vue";
import VersionChanges from "@/components/VersionChanges.vue";
import { useChecklistStore } from "@/stores/checklist";
import { formatRange, formatRemaining, getNextResetAt } from "@/utils/period";

const store = useChecklistStore();

const filter = ref("all");
const now = ref(new Date());
let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 30 * 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const periods = computed(() =>
  store.currentPeriods.map((period) => ({
    ...period,
    label: period.cycle === "daily" ? "每日" : "每周",
    tagType: period.cycle === "daily" ? "success" : "primary",
    hint: period.cycle === "daily" ? "每日 05:00 重置" : "周一 05:00 重置 · 含都市闲趣",
    rangeLabel: formatRange(period.range),
    resetIn: formatRemaining(getNextResetAt(period.cycle, now.value), now.value),
  }))
);

function onToggle(id, done) {
  store.toggle(id, done);
}

function onClearCurrent() {
  const ok = window.confirm(
    "确定清空「每日 / 每周 / 都市闲趣」的当前勾选？\n一次性勾选与历史日志会保留。"
  );
  if (ok) store.clearCyclicProgress();
}

function onClearAll() {
  const ok = window.confirm(
    "确定清空全部分区的当前勾选（含一次性）？\n历史日志会保留。"
  );
  if (ok) store.clearAllProgress();
}
</script>

<template>
  <el-card class="stack" shadow="never">
    <div class="row">
      <h1 class="hero-title">异环 NTE · 方斯赚钱打卡表<span class="sub">性价比版</span></h1>
      <span class="spacer"></span>
      <span class="meta">进度与历史仅保存在本机浏览器</span>
    </div>

    <el-divider style="margin: 16px 0" />

    <div v-for="period in periods" :key="period.cycle" class="period-row">
      <el-tag :type="period.tagType" effect="dark" size="small" round>
        {{ period.label }}
      </el-tag>

      <div class="period-main">
        <ProgressBar :done="period.done" :total="period.total" />
      </div>

      <span class="period-meta">
        <span class="muted small">{{ period.hint }}</span>
        <span class="muted small">·</span>
        <span class="muted small">{{ period.rangeLabel }}</span>
        <el-tag type="info" size="small" effect="plain">距重置 {{ period.resetIn }}</el-tag>
      </span>
    </div>

    <div class="row" style="margin-top: 14px">
      <span class="muted small">进度条只统计「每日 / 每周」两个周期，一次性任务不计入。</span>
      <span class="spacer"></span>
      <el-button @click="onClearCurrent">清空当前周期勾选</el-button>
      <el-button type="danger" plain @click="onClearAll">清空全部勾选</el-button>
    </div>
  </el-card>

  <el-alert class="stack" type="warning" :closable="false" show-icon>
    <template #title>先看这四条，能省下的就是赚到的</template>
    <ul class="alert-list">
      <li><b>方斯别攒到上限</b> —— 满了就是浪费自然回复，赶紧花在升级上。</li>
      <li><b>低稀有度驱动块别囤</b> —— 卖掉换方斯，留着只占仓库。</li>
      <li><b>每周商店的折扣材料用方斯优先买</b>，别等涨价。</li>
      <li><b>后期升级动辄上百万</b> —— 都市大亨满级需累计约 3500 万方斯，从今天开始存。</li>
    </ul>
  </el-alert>

  <el-alert class="stack" type="info" :closable="false" show-icon>
    <template #title>两套体力别搞混（这是最容易亏的地方）</template>
    <ul class="alert-list">
      <li>
        <b>都市活力（City Stamina）</b>：只用于「都市闲趣」玩法。<b>每周一凌晨 05:00 整点回满</b>，周内不用完就是纯亏。上限随都市大亨等级提升：5 级 200 / 10 级 350 / 16 级 500 / 23 级 700。
      </li>
      <li>
        <b>本性像素（副本体力）</b>：用于异象地带副本。每 6 分钟回 1 点，上限 240，24h 回满，可超上限但自然回复会停。
      </li>
      <li>
        <b>关键倍率</b>：基础比例 <b>1 活力 = 1000 方斯</b>。都市大亨 <b>Lv 16</b> 解锁「活力上限 → 500 点 ＋ 活力消耗提高 200%」；1.3 版后界面不再显示翻倍值，<b>实际收益 = 界面显示 × 3</b>。冲大亨等级本身就是冲收益倍率。
      </li>
    </ul>
  </el-alert>

  <TierFilter v-model="filter" />

  <CheckSection
    v-for="section in store.sectionsWithItems"
    :key="section.key"
    :section="section"
    :filter="filter"
    @toggle="onToggle"
  />

  <VersionChanges />

  <SourceFooter />
</template>

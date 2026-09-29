<script setup>
import { CHANGE_TAG_TYPES, CURRENT_VERSION, VERSION_CHANGES } from "@/data/versionChanges";

function dotType(entry) {
  return entry.baseline || entry.version === CURRENT_VERSION ? "warning" : "primary";
}

function isHollow(entry) {
  return !(entry.baseline || entry.version === CURRENT_VERSION);
}
</script>

<template>
  <el-card class="stack" shadow="never">
    <template #header>
      <div class="panel-head">
        <el-tag type="primary" effect="dark" size="small" round>版本</el-tag>
        <span class="panel-title">
          方斯信息变更 · 开服至今（1.0 → {{ CURRENT_VERSION }}）
        </span>
        <span class="muted small">{{ VERSION_CHANGES.length }} 个版本</span>
      </div>
    </template>

    <p class="desc" style="margin: 0 0 14px">
      只收录与方斯直接相关的变更（收益 / 消耗 / 上限 / 机制 / 相关玩法与活动），区间为开服 2026-04-23 至当前版本
      {{ CURRENT_VERSION }}。未列出方斯条目的版本，表示未检索到相关调整。汇总依据为官方版本更新公告与社区整理，详见页脚「数据来源」。
    </p>

    <el-timeline>
      <el-timeline-item
        v-for="entry in VERSION_CHANGES"
        :key="entry.version"
        :timestamp="`v${entry.version} · ${entry.releasedAt}`"
        :type="dotType(entry)"
        :hollow="isHollow(entry)"
        placement="top"
      >
        <div class="version-head">
          <span class="version-name">{{ entry.name }}</span>
          <el-tag v-if="entry.baseline" type="info" size="small" effect="plain">开服基准</el-tag>
          <el-tag
            v-else-if="entry.version === CURRENT_VERSION"
            type="success"
            size="small"
            effect="plain"
          >
            当前版本
          </el-tag>
        </div>

        <p class="version-summary">{{ entry.summary }}</p>

        <div v-for="(item, index) in entry.items" :key="index" class="change-item">
          <el-tag :type="CHANGE_TAG_TYPES[item.type] || 'info'" size="small" effect="light">
            {{ item.type }}
          </el-tag>
          <span>{{ item.text }}</span>
        </div>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

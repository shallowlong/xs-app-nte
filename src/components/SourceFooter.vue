<script setup>
import {
  COLLECTED_AT,
  CONFLICTS,
  GAME_FACTS,
  REJECTED_CLAIMS,
  SOURCES,
} from "@/data/sources";
</script>

<template>
  <el-card class="stack" shadow="never">
    <template #header>
      <div class="panel-head">
        <el-tag type="info" effect="dark" size="small" round>来源</el-tag>
        <span class="panel-title">数据来源与信源冲突</span>
      </div>
    </template>

    <div class="source-block">
      <h4>数据来源</h4>
      <p class="meta" style="margin-bottom: 6px">
        采集日期 {{ COLLECTED_AT }} · 全部为公开攻略站与社区内容（非官方），游戏处于活跃更新期，数值可能已被调平。
      </p>
      <ul class="source-list">
        <li v-for="source in SOURCES" :key="source.name">
          <b>{{ source.name }}</b>
          <span class="source-type">{{ source.type }}</span>
          <span class="muted">{{ source.used }}</span>
        </li>
      </ul>
    </div>

    <div class="source-block">
      <h4>已知信源冲突（不擅自统一）</h4>
      <el-collapse>
        <el-collapse-item
          v-for="conflict in CONFLICTS"
          :key="conflict.id"
          :title="`${conflict.id}. ${conflict.title}`"
          :name="conflict.id"
        >
          <ul class="source-list">
            <li v-for="(line, index) in conflict.items" :key="index">{{ line }}</li>
          </ul>
          <p class="meta" style="margin-top: 6px">处理方式：{{ conflict.resolution }}</p>
        </el-collapse-item>
      </el-collapse>
    </div>

    <div v-if="REJECTED_CLAIMS.length" class="source-block">
      <h4>未获交叉验证、暂不采信</h4>
      <ul class="source-list">
        <li v-for="(line, index) in REJECTED_CLAIMS" :key="index">{{ line }}</li>
      </ul>
    </div>

    <div class="source-block">
      <h4>游戏基础信息</h4>
      <ul class="source-list">
        <li>名称：{{ GAME_FACTS.name }}</li>
        <li>开发：{{ GAME_FACTS.developer }}（{{ GAME_FACTS.engine }}）</li>
        <li>公测：{{ GAME_FACTS.releasedAt }}</li>
        <li>平台：{{ GAME_FACTS.platforms }}</li>
      </ul>
    </div>

    <p class="source-tail">
      本页面仅供自查打卡，数值以游戏内实际为准。进度与历史仅保存在本机浏览器，不会上传。
    </p>
  </el-card>
</template>

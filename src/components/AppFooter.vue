<script setup>
import { APP_NAME, APP_VERSION_LABEL } from "@/data/appMeta";
import { COPYRIGHT } from "@/data/copyright";
</script>

<template>
  <footer class="app-footer">
    <p class="app-version">
      <el-tag size="small" type="info" effect="plain">{{ APP_VERSION_LABEL }}</el-tag>
      <span class="muted small">{{ APP_NAME }}</span>
    </p>

    <p class="copyright">
      © {{ COPYRIGHT.years }}
      <strong>{{ COPYRIGHT.displayName }}</strong>
      <span class="sep">·</span>
      {{ COPYRIGHT.license }} License
      <span class="sep">·</span>
      <a :href="`mailto:${COPYRIGHT.email}`">{{ COPYRIGHT.email }}</a>
    </p>

    <p class="disclaimer">
      本工具为《异环》（Neverness to Everness）非官方玩家辅助工具，与游戏开发方、运营方无任何关联；
      游戏名称、内容与相关商标归其各自权利人所有。本工具为纯前端的数据整理与展示，不读写游戏客户端、不涉及任何侵入式操作。
    </p>
  </footer>
</template>

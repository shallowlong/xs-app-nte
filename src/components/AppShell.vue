<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import { useChecklistStore } from "@/stores/checklist";

const store = useChecklistStore();
const route = useRoute();

const activeIndex = computed(() => route.path);

let timer = null;

onMounted(() => {
  // 启动时对齐周期，之后每分钟检查一次（跨过 05:00 / 周一 05:00 时自动归档并重置）
  store.syncPeriod();
  timer = setInterval(() => store.syncPeriod(), 60 * 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="app">
    <header class="appbar">
      <div class="appbar-inner">
        <div class="brand">
          <span class="logo" aria-hidden="true">异</span>
          <span>
            方斯赚钱打卡表
            <small>异环 NTE · 非官方玩家工具</small>
          </span>
        </div>

        <el-menu
          :default-active="activeIndex"
          mode="horizontal"
          router
          :ellipsis="false"
          class="nav-menu"
        >
          <el-menu-item index="/">今日打卡</el-menu-item>
          <el-menu-item index="/history">历史回看</el-menu-item>
        </el-menu>
      </div>
    </header>

    <main class="wrap main">
      <slot />
      <AppFooter />
    </main>
  </div>
</template>

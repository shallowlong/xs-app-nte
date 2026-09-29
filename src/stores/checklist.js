import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import { CHECKLIST_ITEMS, ITEM_MAP } from "@/data/checklistItems";
import { CYCLES, SECTION_MAP, SECTIONS } from "@/data/sections";
import {
  countPeriodsBetween,
  getPeriodKey,
  getPeriodRange,
  getNextResetAt,
} from "@/utils/period";
import {
  createInitialState,
  downloadJSON,
  loadState,
  removeState,
  saveState,
} from "@/utils/storage";

function itemsOfCycle(cycle) {
  return CHECKLIST_ITEMS.filter((it) => SECTION_MAP[it.section].cycle === cycle);
}

function itemsOfSectionIn(sectionKey) {
  return CHECKLIST_ITEMS.filter((it) => it.section === sectionKey);
}

function sortLogsDesc(a, b) {
  return b.periodKey.localeCompare(a.periodKey) || b.archivedAt - a.archivedAt;
}

export const useChecklistStore = defineStore("checklist", () => {
  const state = ref(loadState());

  /* ---------------- 持久化 ---------------- */
  let saveTimer = null;
  watch(
    state,
    () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => saveState(state.value), 120);
    },
    { deep: true }
  );

  /* ---------------- 历史归档 ---------------- */
  /**
   * 把某个周期「刚刚结束时的状态」压成一条日志。
   * 同一周期重复归档时按 id 覆盖（以最后一次为准）。
   */
  function archiveCycle(cycle, periodKey, reason) {
    if (!periodKey) return;
    const cycleItems = itemsOfCycle(cycle);
    if (!cycleItems.length) return;

    const items = cycleItems.map((it) => {
      const entry = state.value.progress[it.id] || {};
      return {
        id: it.id,
        title: it.title,
        section: it.section,
        tier: it.tier,
        done: !!entry.done,
        at: entry.at || null,
      };
    });

    const doneCount = items.filter((i) => i.done).length;
    const total = items.length;
    const logId = `${cycle}:${periodKey}`;

    const log = {
      id: logId,
      cycle,
      periodKey,
      range: getPeriodRange(cycle, periodKey),
      archivedAt: Date.now(),
      reason,
      doneCount,
      total,
      rate: total ? Math.round((doneCount / total) * 100) : 0,
      gapAfter: 0,
      sections: SECTIONS.filter((s) => s.cycle === cycle).map((s) => {
        const list = items.filter((i) => i.section === s.key);
        return {
          key: s.key,
          name: s.name,
          tag: s.tag,
          done: list.filter((i) => i.done).length,
          total: list.length,
        };
      }),
      items,
    };

    state.value.logs = [...state.value.logs.filter((l) => l.id !== logId), log];
  }

  /**
   * 周期同步：跨过 05:00 / 周一 05:00 时，
   * 归档上一周期并清空该周期的勾选。返回是否有周期发生切换。
   */
  function syncPeriod(now = new Date()) {
    let switched = false;

    for (const cycle of CYCLES) {
      const currentKey = getPeriodKey(cycle, now);
      const previousKey = state.value.periodKeys[cycle] || null;
      if (previousKey === currentKey) continue;

      if (previousKey) {
        archiveCycle(cycle, previousKey, "auto");
        const skipped = countPeriodsBetween(cycle, previousKey, currentKey);
        const log = state.value.logs.find((l) => l.id === `${cycle}:${previousKey}`);
        if (log) log.gapAfter = skipped;
      }

      for (const item of itemsOfCycle(cycle)) {
        delete state.value.progress[item.id];
      }

      state.value.periodKeys[cycle] = currentKey;
      switched = true;
    }

    return switched;
  }

  /* ---------------- 勾选 ---------------- */
  function toggle(id, done) {
    if (!ITEM_MAP[id]) return;
    const current = state.value.progress[id];
    const nextDone = typeof done === "boolean" ? done : !current?.done;
    if (nextDone) {
      state.value.progress[id] = { done: true, at: Date.now() };
    } else {
      delete state.value.progress[id];
    }
  }

  function isDone(id) {
    return !!state.value.progress[id]?.done;
  }

  /* ---------------- 清理 ---------------- */
  /** 清空有重置周期分区的当前进度（一次性勾选与历史日志保留） */
  function clearCyclicProgress() {
    for (const cycle of CYCLES) {
      for (const item of itemsOfCycle(cycle)) {
        delete state.value.progress[item.id];
      }
    }
  }

  /** 清空全部分区的当前进度，历史日志保留 */
  function clearAllProgress() {
    state.value.progress = {};
  }

  function clearHistory() {
    state.value.logs = [];
  }

  /** 完全重置（进度 + 历史 + 周期键），用于「从头开始」 */
  function resetEverything() {
    removeState();
    state.value = createInitialState();
    syncPeriod();
  }

  /* ---------------- 只读视图 ---------------- */
  const sectionsWithItems = computed(() =>
    SECTIONS.map((section) => {
      const items = itemsOfSectionIn(section.key).map((it) => {
        const entry = state.value.progress[it.id];
        return { ...it, done: !!entry?.done, at: entry?.at || null };
      });
      return {
        ...section,
        items,
        done: items.filter((i) => i.done).length,
        total: items.length,
      };
    })
  );

  /** 当前两个周期的完成情况（仪表盘顶部的双进度条，一次性分区不计入） */
  const currentPeriods = computed(() =>
    CYCLES.map((cycle) => {
      const key = getPeriodKey(cycle);
      const list = itemsOfCycle(cycle);
      const done = list.filter((it) => isDone(it.id)).length;
      return {
        cycle,
        key,
        range: getPeriodRange(cycle, key),
        done,
        total: list.length,
        rate: list.length ? Math.round((done / list.length) * 100) : 0,
        nextResetAt: getNextResetAt(cycle),
      };
    })
  );

  const logs = computed(() => state.value.logs);

  const logsByCycle = computed(() => ({
    daily: state.value.logs.filter((l) => l.cycle === "daily").sort(sortLogsDesc),
    weekly: state.value.logs.filter((l) => l.cycle === "weekly").sort(sortLogsDesc),
  }));

  const stats = computed(() => {
    const daily = logsByCycle.value.daily;
    const weekly = logsByCycle.value.weekly;

    // 连续打卡：最新一期（含正在进行中的当期）向后连续 100% 的期数
    let streak = 0;
    const currentDaily = currentPeriods.value.find((p) => p.cycle === "daily");
    if (currentDaily && currentDaily.rate >= 100) streak = 1;
    for (const log of daily) {
      if (log.rate < 100 || log.gapAfter > 0) break;
      streak += 1;
    }

    const recent = daily.slice(0, 30);
    const averageRate = recent.length
      ? Math.round(recent.reduce((sum, l) => sum + l.rate, 0) / recent.length)
      : 0;

    const perfectDays = daily.filter((l) => l.rate >= 100).length;

    return {
      streak,
      averageRate,
      perfectDays,
      dailyCount: daily.length,
      weeklyCount: weekly.length,
      recentCount: recent.length,
    };
  });

  function exportLogs() {
    downloadJSON(`nte-checkin-logs-${Date.now()}.json`, {
      exportedAt: new Date().toISOString(),
      schema: state.value.schema,
      logs: state.value.logs,
    });
  }

  return {
    // state
    logs,
    // computed
    sectionsWithItems,
    currentPeriods,
    logsByCycle,
    stats,
    // actions
    isDone,
    toggle,
    syncPeriod,
    clearCyclicProgress,
    clearAllProgress,
    clearHistory,
    resetEverything,
    exportLogs,
  };
});

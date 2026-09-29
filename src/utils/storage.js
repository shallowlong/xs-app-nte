/**
 * localStorage 持久化封装（本项目无后端，所有数据留在浏览器本地）。
 * 带 schema 版本与容错迁移：解析失败一律回退到初始状态，不抛异常。
 */

const STORAGE_KEY = "nte-checklist-state-v1";

export const SCHEMA_VERSION = 1;

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function createInitialState() {
  const now = Date.now();
  return {
    schema: SCHEMA_VERSION,
    /** { [itemId]: { done: true, at: timestamp } }，未完成则不存该键 */
    progress: {},
    /** 各周期当前所处的周期键 */
    periodKeys: { daily: null, weekly: null },
    /** 历史日志（按周期归档的快照） */
    logs: [],
    createdAt: now,
    updatedAt: now,
  };
}

function migrate(raw) {
  const base = createInitialState();
  return {
    ...base,
    ...raw,
    schema: SCHEMA_VERSION,
    progress: isPlainObject(raw.progress) ? raw.progress : {},
    periodKeys: {
      ...base.periodKeys,
      ...(isPlainObject(raw.periodKeys) ? raw.periodKeys : {}),
    },
    logs: Array.isArray(raw.logs) ? raw.logs : [],
  };
}

export function loadState() {
  let raw = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn("[nte] 无法读取本地存储，已按空进度启动：", error);
    return createInitialState();
  }
  if (!raw) return createInitialState();
  try {
    const parsed = JSON.parse(raw);
    if (!isPlainObject(parsed)) return createInitialState();
    return migrate(parsed);
  } catch (error) {
    console.warn("[nte] 本地进度数据损坏，已重置：", error);
    return createInitialState();
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, updatedAt: Date.now() })
    );
  } catch (error) {
    console.warn("[nte] 进度保存失败（可能是隐私模式或空间不足）：", error);
  }
}

export function removeState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* 忽略：无存储权限时无需处理 */
  }
}

/** 触发浏览器下载（用于导出历史日志） */
export function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

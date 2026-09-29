/**
 * 打卡分区元数据。
 *
 * cycle 语义：
 *   "daily"  每日 05:00 切换周期
 *   "weekly" 每周一 05:00 切换周期
 *   "none"   不重置（一次性收入）
 *
 * 只有 cycle !== "none" 的分区会参与历史归档，也只有它们计入顶部进度条。
 */

export const SECTIONS = [
  {
    key: "hobby",
    name: "都市闲趣",
    tag: "都市闲趣",
    cycle: "weekly",
    title: "都市闲趣 · 效率排序（耗都市活力）",
    desc: "都市活力每周一 05:00 回满，周内用完即赚、不用完即纯亏。以下按「每点活力产出」由高到低排列，与「每周」分区同一周期。",
    notes: [],
  },
  {
    key: "daily",
    name: "每日",
    tag: "每日",
    cycle: "daily",
    title: "每日打卡区",
    desc: "每日 05:00 重置。建议顺序：先清不耗活力的部分（一咖舍 / 委托 / 花方斯），再安排活力消耗。",
    notes: [],
  },
  {
    key: "weekly",
    name: "每周",
    tag: "每周",
    cycle: "weekly",
    title: "每周打卡区 · 周一 05:00 重置后打满",
    desc: "都市活力与多数周常均在周一 05:00 重置，漏一期即亏一期。",
    notes: [],
  },
  {
    key: "once",
    name: "一次性",
    tag: "一次性",
    cycle: "none",
    title: "一次性清空区 · 做完就划掉，别回头",
    desc: "不参与周期重置，也不计入进度条与历史日志；勾选后长期保留，用于记录「早期现金注入」进度。",
    notes: [],
  },
];

export const SECTION_MAP = Object.fromEntries(SECTIONS.map((s) => [s.key, s]));

/** 有重置周期的分区（计入进度条、参与历史归档） */
export const CYCLIC_SECTIONS = SECTIONS.filter((s) => s.cycle !== "none");

/** 参与周期切换的 cycle 取值 */
export const CYCLES = ["daily", "weekly"];

export const TIERS = {
  a: { stars: "⭐⭐⭐", label: "必做", hint: "收益 / 时间比最高，不做就是亏" },
  b: { stars: "⭐⭐", label: "值得做", hint: "收益不错，有余力优先" },
  c: { stars: "⭐", label: "补充项", hint: "顺手做，别专门花时间" },
};

export const FILTERS = [
  { key: "all", label: "全部" },
  { key: "a", label: "⭐ 必做（高性价比）" },
  { key: "ab", label: "⭐ 及以上" },
];

/** 分区徽标 → Element `el-tag` 语义色 */
export const SECTION_TAG_TYPES = {
  hobby: "warning",
  daily: "success",
  weekly: "primary",
  once: "info",
};

/** 性价比分级 → Element `el-tag` 语义色 */
export const TIER_TAG_TYPES = {
  a: "warning",
  b: "success",
  c: "info",
};

/**
 * 周期计算工具。
 *
 * 游戏内的重置节奏：
 *   每日重置：05:00（UTC+8 服务器时间，本地时区近似）
 *   活力 / 周常重置：每周一 05:00
 *
 * 约定：05:00 之前的时刻归属「前一个业务日」，因此周一 03:00 仍算上一周。
 */

export const DAY_ROLLOVER_HOUR = 5;

const MS_MINUTE = 60 * 1000;
const MS_DAY = 24 * 60 * MS_MINUTE;

function pad2(n) {
  return String(n).padStart(2, "0");
}

/** Date → "YYYY-MM-DD" */
export function toDateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** "YYYY-MM-DD" → Date（本地 00:00） */
export function parseDateKey(key) {
  const [y, m, d] = String(key).split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** 业务日：05:00 之前算作前一天 */
export function getBusinessDate(now = new Date()) {
  const d = new Date(now.getTime());
  if (d.getHours() < DAY_ROLLOVER_HOUR) d.setDate(d.getDate() - 1);
  return d;
}

/** 每日周期键 */
export function getDayKey(now = new Date()) {
  return toDateKey(getBusinessDate(now));
}

/** 每周周期键（以周一 05:00 为界，返回该业务周的周一日期） */
export function getWeekKey(now = new Date()) {
  const d = getBusinessDate(now);
  const dow = d.getDay(); // 0 = 周日
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  return toDateKey(d);
}

/** 按 cycle 取当前周期键 */
export function getPeriodKey(cycle, now = new Date()) {
  if (cycle === "daily") return getDayKey(now);
  if (cycle === "weekly") return getWeekKey(now);
  return "once";
}

/** 周期覆盖的日期区间（含首尾），用于历史日志展示 */
export function getPeriodRange(cycle, periodKey) {
  if (cycle === "weekly") {
    const start = parseDateKey(periodKey);
    const end = new Date(start.getTime());
    end.setDate(end.getDate() + 6);
    return { start: toDateKey(start), end: toDateKey(end) };
  }
  return { start: periodKey, end: periodKey };
}

/** 下一次重置时刻（cycle 为 "none" 时返回 null） */
export function getNextResetAt(cycle, now = new Date()) {
  if (cycle === "daily") {
    const t = new Date(now.getTime());
    t.setHours(DAY_ROLLOVER_HOUR, 0, 0, 0);
    if (t.getTime() <= now.getTime()) t.setDate(t.getDate() + 1);
    return t;
  }
  if (cycle === "weekly") {
    const t = new Date(now.getTime());
    t.setHours(DAY_ROLLOVER_HOUR, 0, 0, 0);
    t.setDate(t.getDate() + (8 - t.getDay()) % 7);
    if (t.getTime() <= now.getTime()) t.setDate(t.getDate() + 7);
    return t;
  }
  return null;
}

/** 距目标时刻的友好描述 */
export function formatRemaining(target, now = new Date()) {
  if (!target) return "";
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return "即将重置";
  const totalMinutes = Math.floor(ms / MS_MINUTE);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days} 天 ${hours} 小时`;
  if (hours > 0) return `${hours} 小时 ${minutes} 分`;
  return `${minutes} 分钟`;
}

/** 从 fromKey 到 toKey 之间「被跳过」的周期数（不含两端） */
export function countPeriodsBetween(cycle, fromKey, toKey) {
  if (!fromKey || !toKey || fromKey === toKey) return 0;
  const unit = cycle === "weekly" ? 7 * MS_DAY : MS_DAY;
  const diff = Math.round((parseDateKey(toKey).getTime() - parseDateKey(fromKey).getTime()) / unit);
  return diff > 1 ? diff - 1 : 0;
}

/** "2026-09-29" → "9 月 29 日 · 周二" */
export function formatDateLabel(dateKey) {
  const d = parseDateKey(dateKey);
  const week = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日 · 周${week}`;
}

/** "YYYY-MM-DD" 短格式 → "9/29" */
export function formatDateShort(dateKey) {
  const d = parseDateKey(dateKey);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 周期区间描述 */
export function formatRange(range) {
  if (!range) return "";
  if (range.start === range.end) return formatDateLabel(range.start);
  return `${formatDateShort(range.start)} – ${formatDateLabel(range.end)}`;
}

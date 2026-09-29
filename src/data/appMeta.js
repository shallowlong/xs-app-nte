/**
 * 应用元信息。
 *
 * 版本号**不在代码里硬编码**：由 Vite 在构建时从 `package.json` 注入（见 `vite.config.js` 的 `define`）。
 * 递增版本请使用 `npm version <patch|minor|major>`（见 `AGENTS.md` §8）。
 */

const injected = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "";

/** 应用名（对外展示） */
export const APP_NAME = "异环 NTE · 方斯赚钱打卡表";

/** 当前版本号，如 "1.0.0"；未经构建（脱离 Vite 运行）时回退为 "dev" */
export const APP_VERSION = injected || "dev";

/** 带 v 前缀的展示形式，如 "v1.0.0" */
export const APP_VERSION_LABEL = injected ? `v${injected}` : "dev";

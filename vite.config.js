import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import { readFileSync } from "node:fs";

// 版本号单一事实来源：package.json（递增请用 `npm version`，见 AGENTS.md §8）
const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    // 构建时注入版本号，避免把整个 package.json 打进产物
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // Element Plus 采用「全量引入」（见 src/main.js）：换来零额外依赖与免注册的组件可用性，
    // 代价是产物约 1 MB（gzip 约 343 kB）。本项目为本地自用工具，该体积可接受。
    // 若日后需要瘦身：改用 unplugin-vue-components + ElementPlusResolver 按需引入（需新增 devDependency）。
    chunkSizeWarningLimit: 1200,
  },
  server: {
    port: 3100,
    host: true,
  },
});

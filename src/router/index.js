import { createRouter, createWebHashHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";

const BASE_TITLE = "异环 NTE · 方斯赚钱打卡表";

const routes = [
  {
    path: "/",
    name: "dashboard",
    component: DashboardView,
    meta: { title: "今日打卡" },
  },
  {
    path: "/history",
    name: "history",
    component: () => import("@/views/HistoryView.vue"),
    meta: { title: "历史回看" },
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

// 纯静态站点（可能部署在 GitHub Pages 等无 rewrite 的环境），使用 hash 模式最稳。
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.afterEach((to) => {
  document.title = to.meta?.title ? `${to.meta.title} · ${BASE_TITLE}` : BASE_TITLE;
});

export default router;

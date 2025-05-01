import { createRouter, createWebHistory } from "vue-router";
import Home from "./components/TheHome.vue";
import TheLogin from "./components/TheLogin.vue";
import AdminDashboard from "@/components/AdminDashboard.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: TheLogin },
  {
    path: "/admin",
    component: AdminDashboard,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (token && isTokenExpired(token)) {
    localStorage.removeItem("token");
  }

  if (to.meta.requiresAuth && !localStorage.getItem("token")) {
    return next("/login");
  }

  if (to.path === "/login" && localStorage.getItem("token")) {
    return next("/admin");
  }

  next();
});

export default router;

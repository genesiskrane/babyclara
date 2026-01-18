import { createWebHistory, createRouter } from "vue-router";
import { useWorkStationStore, useUserStore } from "../store";
import routes from "./routes";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const workstation = useWorkStationStore();
  const user = useUserStore();

  // ✅ Only run guard for non-auth routes
  const isAuthRoute = to.path.startsWith("/auth");

  // 1️⃣ Initialize workstation once
  if (!workstation.initialized) {
    try {
      console.log("Initializing workstation...");
      await workstation.init();
    } catch (err) {
      console.error("Workstation initialization failed:", err);
      return next(false);
    }
  }

  // 2️⃣ Redirect unauthenticated users only for protected routes
  if (!isAuthRoute && !user.isAuthenticated) {
    return next("/auth/signin"); // Redirect to signin
  }

  // 3️⃣ Proceed
  next();
});

export default router;

const routes = [
  { path: "/", redirect: "/home" },

  {
    path: "/home",
    component: () => import("../pages/Home.vue"),
    meta: { requiresAuth: true },
  },

  // Auth routes (public)
  {
    path: "/auth/signup",
    component: () => import("../pages/auth/SignUp.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/auth/signin",
    component: () => import("../pages/auth/SignIn.vue"),
    meta: { requiresAuth: false },
  },

  // 🚫 Global 404 (must be LAST)
  {
    path: "/:pathMatch(.*)*",
    component: () => import("../pages/404.vue"),
    meta: { requiresAuth: false },
  },
];

export default routes;

const routes = [
  { path: "/", redirect: "/home" },
  { path: "/home", component: () => import("../pages/Home.vue") },
  { path: "/auth/signup", component: () => import("../pages/auth/SignUp.vue") },
  { path: "/auth/signin", component: () => import("../pages/auth/SignIn.vue") },
];

export default routes;

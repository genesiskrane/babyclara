
const path = require("path");

const rootDir = process.cwd();
const configPath = path.join(rootDir, "babyclara.config.js");

function getWorkstation() {
  delete require.cache[require.resolve(configPath)];

  const config = require(configPath);
  const { name, framework } = config;

  return { name, framework };
}

module.exports = {
  getWorkstation,
};


const fs = require("fs");
const path = require("path");

const wsRequest = require("../ws");

/**
 * Convert string to kebab-case
 */
function kebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}

/* ======================================================
   SAVE ROUTES TO BACKEND
====================================================== */
async function saveRoutes(type, project) {
  const pagesPath = path.join(
    process.cwd(),
    `${type}s`,
    project,
    "src",
    "pages"
  );

  if (!fs.existsSync(pagesPath)) return;

  const routes = [];

  function walk(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!file.endsWith(".vue")) continue;

      const relative = path
        .relative(pagesPath, fullPath)
        .replace(/\\/g, "/")
        .replace(".vue", "");

      const segments = relative.split("/").map(kebabCase);
      const name = segments[segments.length - 1];
      const routePath = "/" + segments.join("/");

      if (routePath === "/404") continue;

      routes.push({
        _id: routePath,
        name,
        component: `pages/${relative}.vue`,
        redirect: null,
        parent: segments.length > 1 ? segments[segments.length - 2] : null,
        meta: {},
        projects: [project],
      });
    }
  }

  walk(pagesPath);

  if (!routes.length) return;
  await wsRequest("saveRoutes", { routes });
}

/* ======================================================
   FRONTEND ROUTER GENERATION
====================================================== */

function getVueFiles(pagesPath) {
  const files = [];

  function walk(dir) {
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) walk(fullPath);
      else if (file.endsWith(".vue")) files.push(fullPath);
    });
  }

  walk(pagesPath);
  return files;
}

function generateRoutes(files, pagesPath) {
  return files.map((fullPath) => {
    const relative = path
      .relative(pagesPath, fullPath)
      .replace(/\\/g, "/")
      .replace(".vue", "");

    const segments = relative.split("/").map(kebabCase);
    const name = segments[segments.length - 1];
    const routePath = "/" + segments.join("/");

    return {
      path: routePath === "/home" ? "/" : routePath,
      name,
      component: `() => import('@/pages/${relative}.vue')`,
    };
  });
}

function writeRouterFile(routes, routerPath) {
  const content = `import { createRouter, createWebHistory } from 'vue-router';

const routes = [
${routes
  .map(
    (r) => `  {
    path: '${r.path}',
    name: '${r.name}',
    component: ${r.component}
  }`
  )
  .join(",\n")}
];

export default createRouter({
  history: createWebHistory(),
  routes
});
`;

  fs.mkdirSync(path.dirname(routerPath), { recursive: true });
  fs.writeFileSync(routerPath, content, "utf8");
}

function createRouter(type, project) {
  const basePath = path.join(process.cwd(), `${type}s`, project, "src");
  const pagesPath = path.join(basePath, "pages");
  const routerPath = path.join(basePath, "router", "index.js");

  if (!fs.existsSync(pagesPath)) return;

  const vueFiles = getVueFiles(pagesPath);
  const routes = generateRoutes(vueFiles, pagesPath);

  writeRouterFile(routes, routerPath);
}

/* ======================================================
   PINIA STORE GENERATOR (WITH STATE DETECTION)
====================================================== */

/* -------- store action usage -------- */
function extractStoreUsage(content) {
  const found = new Set();

  const direct = /\bstore\.([a-zA-Z_$][\w$]*)\s*\(/g;
  const destructured = /\{\s*([^}]+)\s*\}\s*=\s*store/g;

  let match;

  while ((match = direct.exec(content))) found.add(match[1]);

  while ((match = destructured.exec(content))) {
    match[1]
      .split(",")
      .map((s) => s.trim())
      .forEach((fn) => found.add(fn));
  }

  return [...found];
}

/* -------- store state usage -------- */
function extractStoreStateUsage(content) {
  const found = new Set();

  const direct = /\bstore\.([a-zA-Z_$][\w$]*)\b(?!\s*\()/g;
  const destructured = /\{\s*([^}]+)\s*\}\s*=\s*store/g;

  let match;

  while ((match = direct.exec(content))) found.add(match[1]);

  while ((match = destructured.exec(content))) {
    match[1]
      .split(",")
      .map((s) => s.split(":")[0].trim())
      .forEach((k) => found.add(k));
  }

  return [...found];
}

/* -------- scan dirs -------- */
function scanDir(dir, result = { actions: new Set(), state: new Set() }) {
  if (!fs.existsSync(dir)) return result;

  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) scanDir(fullPath, result);
    else if (/\.(vue|js)$/.test(entry)) {
      const content = fs.readFileSync(fullPath, "utf8");

      extractStoreUsage(content).forEach((a) => result.actions.add(a));
      extractStoreStateUsage(content).forEach((s) => result.state.add(s));
    }
  }

  return result;
}

/* -------- fetch from DB -------- */
async function fetchStoreDefinitions(actions, state) {
  return wsRequest("getStoreDefinitions", { actions, state });
}

/* -------- helpers -------- */
function buildImports(defs) {
  const imports = new Set();
  defs.forEach((d) => (d.imports || []).forEach((i) => imports.add(i)));
  return [...imports].map((i) => `import ${i} from "${i}";`).join("\n");
}

function buildState(defs) {
  const state = {};
  defs.forEach((d) => d.state && Object.assign(state, d.state));
  return JSON.stringify(state, null, 2);
}

function splitDefs(defs) {
  return {
    actions: defs.filter((d) => d.type === "action"),
    getters: defs.filter((d) => d.type === "getter"),
  };
}

function generateStore(defs) {
  const imports = buildImports(defs);
  const state = buildState(defs);
  const { actions, getters } = splitDefs(defs);

  return `
import { defineStore } from "pinia";
${imports}

export const useStore = defineStore("store", {
  state: () => (${state}),

  getters: {
${getters.map((g) => "    " + g.body).join(",\n")}
  },

  actions: {
${actions.map((a) => "    " + a.body).join(",\n")}
  }
});
`.trim();
}

/* -------- main store creator -------- */
async function createStore(type, project) {
  const root = path.join(process.cwd(), `${type}s`, project, "src");
  const pagesDir = path.join(root, "pages");
  const componentsDir = path.join(root, "components");
  const storeDir = path.join(root, "store");

  const usage = scanDir(pagesDir);

  scanDir(componentsDir, usage);

  const actions = [...usage.actions];
  const state = [...usage.state];

  if (!actions.length && !state.length) return;

  const { data } = await fetchStoreDefinitions(actions, state);

  const defs = data;

  if (!defs.length) return;

  fs.mkdirSync(storeDir, { recursive: true });
  fs.writeFileSync(
    path.join(storeDir, "index.js"),
    generateStore(defs),
    "utf8"
  );
}

/* ======================================================
   EXPORTS
====================================================== */

module.exports = {
  saveRoutes,
  createRouter,
  createStore,
};

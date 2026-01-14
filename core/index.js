#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const open = (...args) => import("open").then((mod) => mod.default(...args));

const startGUI = require("./gui/server");
const connectWS = require("./ws/client");
const loadProjects = require("./projects/loader");

console.log("\n🚀 Starting BabyClara Workstation...\n");

const rootDir = process.cwd();
const configPath = path.join(rootDir, "babyclara.config.js");

if (!fs.existsSync(configPath)) {
  console.error("❌ babyclara.config.js not found.");
  process.exit(1);
}

const config = require(configPath);
const { workstationName, framework, projects } = config;

// Global context
global.__BABYCLARA__ = {
  rootDir,
  config,
  projects: {},
  auth: null,
  ws: null,
};

async function launchGUIWithParams() {
  // Start GUI server
  await startGUI();

  // Construct URL with query params
  const url = `http://localhost:5178/?workstationName=${encodeURIComponent(
    workstationName
  )}&framework=${encodeURIComponent(framework)}`;

  // Open default browser
  open(url);
}

async function boot() {
  console.log(
    `🧠 Workstation: ${workstationName} | Framework: ${framework || "vanilla"}`
  );

  // 1️⃣ Launch GUI
  await launchGUIWithParams();

  // 2️⃣ Connect WebSocket (unauthenticated)
  const ws = await connectWS();
  global.__BABYCLARA__.ws = ws;

  console.log("🔌 WebSocket connected (waiting for user authentication)");

  // 3️⃣ Wait for authentication from GUI
  ws.once("authenticated", async () => {
    console.log("🔐 User authenticated");

    global.__BABYCLARA__.auth = true;

    // 4️⃣ Load projects AFTER auth
    if (projects.length > 0) {
      console.log(`📂 Loading ${projects.length} project(s)...`);
      await loadProjects(projects);
    }

    console.log("✅ BabyClara ready");
  });
}

boot();

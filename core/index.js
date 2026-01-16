#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const open = (...args) => import("open").then((mod) => mod.default(...args));

const startGUI = require("./gui/server");
const connectWS = require("./ws/client");
const loadProjects = require("./projects/loader");
const { loadAuth } = require("./auth");

console.log("\n🚀 Starting BabyClara Workstation...\n");

const rootDir = process.cwd();
const configPath = path.join(rootDir, "babyclara.config.js");

if (!fs.existsSync(configPath)) {
  console.error("❌ babyclara.config.js not found.");
  process.exit(1);
}

const config = require(configPath);
const { workstationName, framework, projects = [] } = config;

// Global runtime context
global.__BABYCLARA__ = {
  rootDir,
  config,
  projects: {},
  auth: null,
  ws: null,
};

async function launchGUI() {
  await startGUI();
  const url = "http://localhost:5178/";
  await open(url);
}

async function boot() {
  console.log(
    `🧠 Workstation: ${workstationName} | Framework: ${framework || "vanilla"}`
  );

  // 1️⃣ Launch GUI
  await launchGUI();

  // 2️⃣ Connect WebSocket
  const ws = await connectWS();
  global.__BABYCLARA__.ws = ws;

  console.log("🔌 WebSocket connected");

  // 3️⃣ Try restoring auth
  const auth = loadAuth();

  if (auth?.accessToken) {
    console.log("🔑 Restoring session...");

    ws.send(
      JSON.stringify({
        type: "handshake",
        token: auth.accessToken,
        workstationName,
        framework,
      })
    );
  } else {
    console.log("🔐 No session found — waiting for login");
  }

  // 4️⃣ Auth success
  ws.once("authenticated", async () => {
    console.log("✅ User authenticated");

    global.__BABYCLARA__.auth = true;

    if (projects.length > 0) {
      console.log(`📂 Loading ${projects.length} project(s)...`);
      await loadProjects(projects);
    }

    console.log("🚀 BabyClara ready");
  });
}

boot();

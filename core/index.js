const path = require("path");
const fs = require("fs");

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

global.__BABYCLARA__ = {
  rootDir,
  config,
  projects: {},
  auth: null,
  ws: null,
};

async function boot() {
  console.log(`🧠 Workstation: ${workstationName}`);

  // 1️⃣ Start GUI
  await startGUI();

  // 2️⃣ Connect WebSocket (unauthenticated)
  const ws = await connectWS();
  global.__BABYCLARA__.ws = ws;

  // 3️⃣ Wait for authentication (from GUI)
  // ws.once("authenticated", async () => {
  //   console.log("🔐 User authenticated");

  //   global.__BABYCLARA__.auth = true;

  //   // 4️⃣ Load projects AFTER auth
  //   if (projects.length > 0) {
  //     await loadProjects(projects);
  //   }

  //   console.log("✅ BabyClara ready");
  // });
}

boot();

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { spawn } = require("child_process");

const targetDir = process.cwd();

/* -----------------------------
   Helpers
----------------------------- */

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

function installDeps(projectPath) {
  return new Promise((resolve, reject) => {
    console.log("\n📦 Installing dependencies...\n");

    const npm = spawn("npm", ["install"], {
      cwd: projectPath,
      stdio: "inherit",
      shell: true,
    });

    npm.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error("npm install failed"));
    });
  });
}

/* -----------------------------
   Generate Workstation
----------------------------- */

async function generate() {
  console.log("\n✨ Welcome to BabyClara ✨\n");

  /* Step 0 — CLI initialization */

  const defaultName = path.basename(targetDir) || "my-workstation";

  const nameInput = await ask(
    `Workstation name (default: ${defaultName}): `
  );

  const workstationName = nameInput || defaultName;

  console.log("\nChoose framework:");
  console.log("1) Vanilla (none)");
  console.log("2) React");
  console.log("3) Vue");

  const frameworkInput = await ask("Select (1-3) [1]: ");

  let framework = null;
  if (frameworkInput === "2") framework = "react";
  if (frameworkInput === "3") framework = "vue";

  /* Step 1 — Ensure package.json */

  const pkgPath = path.join(targetDir, "package.json");

  let pkg;
  if (fs.existsSync(pkgPath)) {
    pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  } else {
    pkg = {
      name: workstationName,
      private: true,
      scripts: {},
    };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log("📄 Created package.json");
  }

  /* Step 2 — Ensure start script */

  pkg.scripts = pkg.scripts || {};
  pkg.scripts.start = "node ./node_modules/babyclara/core/index.js";

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  /* Step 3 — Create babyclara.config.js */

  const configPath = path.join(targetDir, "babyclara.config.js");

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      `const projects = [];

module.exports = {
  workstationName: "${workstationName}",
  framework: ${framework ? `"${framework}"` : null},
  unocss: true,
  projects,
};
`
    );
    console.log("⚙️ Created babyclara.config.js");
  } else {
    console.log("⚙️ babyclara.config.js already exists — skipping");
  }

  /* Step 4 — Install dependencies */

  await installDeps(targetDir);

  console.log("\n✅ BabyClara workstation ready!");
  console.log("👉 Run: npm start\n");
}

module.exports = generate;

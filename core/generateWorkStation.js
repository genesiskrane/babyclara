import fs from "fs";
import path from "path";
import readline from "readline";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = process.cwd();

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

export async function generateWorkStation() {
  console.log("\nWelcome to BabyClara ✨\n");

  // Step 0 — CLI init
  const defaultName = path.basename(targetDir) || "babyclara-workstation";
  const nameInput = await ask(`Workstation name (default: ${defaultName}): `);
  const name = nameInput || defaultName;

  console.log("\nChoose framework:");
  console.log("1) Vanilla (none)");
  console.log("2) Vue");
  console.log("3) React");

  const frameworkInput = await ask("Select (1-3) [1]: ");

  let framework = null;
  if (frameworkInput === "2") framework = "vue";
  if (frameworkInput === "3") framework = "react";

  // package.json
  const pkgPath = path.join(targetDir, "package.json");

  const pkg = {
    name,
    private: true,
    type: "module",
    scripts: {
      start: "node ./node_modules/babyclara/core/index.js",
    },
    dependencies: {
      babyclara: "latest",
    },
  };

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log("✔ package.json created");

  // babyclara.config.js
  const configPath = path.join(targetDir, "babyclara.config.js");

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      `export default {
  name: "${name}",
  framework: ${framework ? `"${framework}"` : null},
};
`
    );
    console.log("✔ babyclara.config.js created");
  }

  // Install dependencies
  console.log("\n📦 Installing dependencies...");
  await installDeps(targetDir);

  console.log("\n✅ BabyClara workstation ready.");
  console.log("➡ Run: npm start\n");
}

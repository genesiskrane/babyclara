const fs = require("fs");
const path = require("path");

const targetDir = process.cwd();

const generate = () => {
  console.log("Generating BabyClara Workstation...");

  // Ensure package.json
  const pkgPath = path.join(targetDir, "package.json");

  let pkg;
  if (fs.existsSync(pkgPath)) {
    pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  } else {
    pkg = {
      name: "babyclara-workstation",
      private: true,
      scripts: {},
    };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log("Created package.json");
  }

  // Add start script
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.start = "node ./node_modules/babyclara/core/index.js";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  // Create babyclara.config.js
  const configPath = path.join(targetDir, "babyclara.config.js");
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      `const projects = [];

module.exports = {
  workstationName: "default",
  framework: null,
  unocss: true,
  projects,
};
`
    );
    console.log("Created babyclara.config.js");
  }

  console.log("✅ BabyClara workstation ready.");
};

module.exports = generate;

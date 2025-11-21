#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const foldersToCopy = [
    { from: "template", to: "." },
    { from: "data", to: "data" }
];

const targetDir = process.cwd();

// Recursive folder copy
function copyFolder(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);
    if (items.length === 0) return;

    items.forEach(item => {
        const from = path.join(src, item);
        const to = path.join(dest, item);

        if (fs.lstatSync(from).isDirectory()) {
            copyFolder(from, to);
        } else {
            fs.copyFileSync(from, to);
        }
    });
}

console.log("Generating Work Station...");

foldersToCopy.forEach(folder => {
    const src = path.join(__dirname, folder.from);
    const dest = path.join(targetDir, folder.to);
    copyFolder(src, dest);
});

// Install gkrane
console.log("Installing Dependencies...");
execSync("npm install gkrane chokidar", { cwd: targetDir, stdio: "inherit" });

// Modify package.json
const pkgPath = path.join(targetDir, "package.json");

if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

    pkg.scripts = pkg.scripts || {};

    // Add or override your scripts
    pkg.scripts.start =
        "npx chokidar '**/*' '!apps/**' '!games/**' -c 'node ./node_modules/gkrane/core/index.js'";

    pkg.scripts.dev =
        "node ./node_modules/gkrane/core/dev.js";

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    console.log("Updated package.json scripts successfully.");
} else {
    console.warn("⚠️ No package.json found — cannot add scripts.");
}

console.log("Done!");

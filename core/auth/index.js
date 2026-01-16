// core/auth/index.js
const fs = require("fs");
const path = require("path");
const os = require("os");

const AUTH_DIR = path.join(os.homedir(), ".babyclara");
const AUTH_FILE = path.join(AUTH_DIR, "auth.json");

function saveAuth(data) {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
  fs.writeFileSync(AUTH_FILE, JSON.stringify(data, null, 2));
}

function loadAuth() {
  if (!fs.existsSync(AUTH_FILE)) return null;
  return JSON.parse(fs.readFileSync(AUTH_FILE, "utf8"));
}

function clearAuth() {
  if (fs.existsSync(AUTH_FILE)) fs.unlinkSync(AUTH_FILE);
}

module.exports = { saveAuth, loadAuth, clearAuth };

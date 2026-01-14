const express = require("express");
const path = require("path");

async function startGUI() {
  const app = express();
  const PORT = process.env.BABYCLARA_GUI_PORT || 5178;

  const publicDir = path.join(__dirname, "dist");

  // 1️⃣ Serve static files first
  app.use(express.static(publicDir, {
    maxAge: "1d",
    index: false
  }));

  // 2️⃣ Catch-all route for Vue SPA (history mode)
  // Express 5 prefers a named param for wildcards
  app.get("/*splat", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  return new Promise((resolve) => {
    app.listen(PORT, () => {
      console.log(`🖥 BabyClara GUI running at http://localhost:${PORT}`);
      resolve();
    });
  });
}

if (require.main === module) {
  startGUI();
}

module.exports = startGUI;

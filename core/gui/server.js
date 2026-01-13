const express = require("express");

let server;

async function startGUI() {
  const app = express();

  const PORT = process.env.BABYCLARA_GUI_PORT || 5178;

  app.get("/", (req, res) => {
    res.send(`
      <html>
        <head>
          <title>BabyClara</title>
          <style>
            body {
              font-family: sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              background: #0f172a;
              color: #e5e7eb;
            }
          </style>
        </head>
        <body>
          <h1>🚀 BabyClara Workstation</h1>
        </body>
      </html>
    `);
  });

  return new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`🖥 GUI running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

module.exports = startGUI;

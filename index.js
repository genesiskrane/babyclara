#!/usr/bin/env node
import { generateWorkStation } from "./core/generateWorkStation.js";
import { startFileWatcher } from "./core/fileWatcher.js";
import { pubsub } from "./graphql/resolver/file.resolver.js";

import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";

import express from "express";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";

import { typeDefs, resolver } from "./graphql/index.js";

const open = (...args) => import("open").then((mod) => mod.default(...args));

console.log("\n🚀 Starting BabyClara Workstation...\n");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = process.cwd();

const configPath = path.join(rootDir, "babyclara.config.js");

if (!fs.existsSync(configPath)) {
  await generateWorkStation();
  process.exit(0);
}

const url = "http://localhost:5178/";

// ✅ ESM config import
const { default: config } = await import(pathToFileURL(configPath).href);

const { name: workstationName, framework, projects = [] } = config;

console.log(
  `🧠 Workstation: ${workstationName} | Framework: ${framework || "vanilla"}`
);

const app = express();
const PORT = process.env.BABYCLARA_GUI_PORT || 5178;
const publicDir = path.join(__dirname, "client");

app.use(
  express.static(publicDir, {
    maxAge: "1d",
    index: false,
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// 2️⃣ Catch-all route for Vue SPA (history mode)
// Express 5 prefers a named param for wildcards
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});
const httpServer = http.createServer(app);

const schema = makeExecutableSchema({ typeDefs, resolver });

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

useServer({ schema }, wsServer);

const apolloServer = new ApolloServer({ schema });
await apolloServer.start();

app.use("/graphql", express.json(), expressMiddleware(apolloServer));

startFileWatcher(pubsub, path.resolve(rootDir, "code"));

console.log("🚀 BabyClara ready");

httpServer.listen(PORT, () => {
  console.log(`🚀 GUI running at http://localhost:${PORT}`);
});

await open(url);

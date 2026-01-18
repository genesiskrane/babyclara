import chokidar from "chokidar";
import fs from "fs";

export const startFileWatcher = (pubsub, rootPath) => {
  const watcher = chokidar.watch(rootPath, {
    ignoreInitial: true,
  });

  watcher.on("all", async (event, path) => {
    let content = null;

    if (event === "add" || event === "change") {
      try {
        content = fs.readFileSync(path, "utf-8");
      } catch {}
    }

    pubsub.publish("FILE_CHANGED", {
      fileChanged: {
        path,
        event,
        content,
      },
    });
  });

  return watcher;
};

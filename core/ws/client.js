const WebSocket = require("ws");
const EventEmitter = require("events");

const WS_URL =
  process.env.BABYCLARA_WS_URL || "wss://great-unknown.onrender.com/babyclara";

class BabyClaraWS extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.authenticated = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      console.log("🔌 Connecting to BabyClara server...");

      this.ws = new WebSocket(WS_URL);

      this.ws.on("open", () => {
        console.log("🔗 WebSocket connected (unauthenticated)");
        resolve(this);
      });

      this.ws.on("message", (raw) => {
        let msg;
        try {
          msg = JSON.parse(raw.toString());
        } catch {
          return;
        }

        this.handleMessage(msg);
      });

      this.ws.on("close", () => {
        console.log("⚠️ WebSocket disconnected");
        this.authenticated = false;
      });

      this.ws.on("error", (err) => {
        console.error("❌ WebSocket error:", err.message);
        reject(err);
      });
    });
  }

  handleMessage(msg) {
    switch (msg.type) {
      case "auth:ok":
        this.authenticated = true;
        this.emit("authenticated", msg.user);
        break;

      case "auth:error":
        this.emit("auth:error", msg.message);
        break;

      default:
        this.emit("message", msg);
    }
  }

  authenticate(token) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    this.ws.send(
      JSON.stringify({
        type: "auth",
        token,
      })
    );
  }
}

async function connectWS() {
  const client = new BabyClaraWS();
  await client.connect();
  return client;
}

module.exports = connectWS;

const app = require("./app");
const config = require("./config/config");

const server = app.listen(config.port, () => {
  console.log(
    `Marketplace backend running on port ${config.port}`
  );
});

function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
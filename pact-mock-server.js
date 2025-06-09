#!/usr/bin/env node

import { createRequire } from "module";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const require = createRequire(import.meta.url);
const pact = require("@pact-foundation/pact-node");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🚀 Starting Pact Mock Server...");

const server = pact.createStub({
  pactUrls: [
    resolve(__dirname, "pacts/wms_order_management/wms_ui.json"),
    resolve(__dirname, "pacts/wms_inventory_management/wms_ui.json"),
  ],
  port: 30081,
  cors: true,
  logLevel: "INFO",
});

server
  .start()
  .then(() => {
    console.log(`✅ Pact Mock Server started successfully!`);
    console.log(`📍 Server running at: http://localhost:30081`);
    console.log(`📁 Serving contracts from:`);
    console.log(`   - wms_order_management/wms_ui.json`);
    console.log(`   - wms_inventory_management/wms_ui.json`);
    console.log(`\n🛑 Press Ctrl+C to stop the server`);

    // Shared shutdown handler
    const gracefulShutdown = () => {
      console.log("\n🛑 Shutting down Pact Mock Server...");
      server.stop().then(() => {
        console.log("✅ Server stopped successfully");
        process.exit(0);
      });
    };

    // Handle process termination signals
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  })
  .catch((error) => {
    console.error("❌ Failed to start Pact Mock Server:", error);
    process.exit(1);
  });

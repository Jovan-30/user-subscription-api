import http from "node:http";
import app from "./app.js";
import { PORT } from "./config/env.ts";
import connectToDatabse from "./database/mongodb.ts";
import { connectToRedis } from "./config/redis.config.ts";

async function startServer() {
  try {
    // Database Connections: ensure database has connected
    await connectToDatabse();
    await connectToRedis();

    // Server Instance: create the server instance
    const server: http.Server = http.createServer(app);

    // Server: listen to the server on the PORT
    server.listen(PORT, async () => {
      console.log(`Listening on PORT ${PORT}`);
    });
  } catch (error) {
    console.error(`Error creating the server: ${error}`);
    process.exit(1);
  }
}

startServer();

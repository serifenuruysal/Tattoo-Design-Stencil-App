import { Hono } from "https://deno.land/x/hono@v4.3.7/mod.ts";
import { cors } from "https://deno.land/x/hono@v4.3.7/middleware.ts";
import { logger } from "https://deno.land/x/hono@v4.3.7/middleware.ts";
import * as kv from "./kv_store.ts";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-3dd064b6/health", (c) => {
  return c.json({ status: "ok" });
});

Deno.serve(app.fetch);
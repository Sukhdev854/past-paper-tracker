import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { signUpUser, verifyToken, getUserByUsername } from "./auth.tsx";
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
app.get("/make-server-2e60b1bc/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-2e60b1bc/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, username } = body;

    if (!email || !password || !name || !username) {
      return c.json({ error: 'Email, password, name, and username are required' }, 400);
    }

    const result = await signUpUser(email, password, name, username);

    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    return c.json({ success: true, user: result.user });
  } catch (error) {
    console.error('Sign up endpoint error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get email by username endpoint (for login)
app.post("/make-server-2e60b1bc/get-email", async (c) => {
  try {
    const body = await c.req.json();
    const { username } = body;

    if (!username) {
      return c.json({ error: 'Username is required' }, 400);
    }

    const result = await getUserByUsername(username);

    if (!result.success) {
      return c.json({ error: result.error }, 404);
    }

    return c.json({ success: true, email: result.email });
  } catch (error) {
    console.error('Get email endpoint error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Verify token endpoint
app.post("/make-server-2e60b1bc/verify", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Authorization header required' }, 401);
    }

    const token = authHeader.split(' ')[1];
    const result = await verifyToken(token);

    if (!result.success) {
      return c.json({ error: result.error }, 401);
    }

    return c.json({ success: true, user: result.user });
  } catch (error) {
    console.error('Verify endpoint error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);
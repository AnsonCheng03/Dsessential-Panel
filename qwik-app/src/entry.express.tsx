import {
  createQwikCity,
  type PlatformNode,
} from "@builder.io/qwik-city/middleware/node";
import qwikCityPlan from "@qwik-city-plan";
import { manifest } from "@qwik-client-manifest";
import render from "./entry.ssr";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import * as fs from "fs";
import http from "http";
import https from "https";
import { createProxyMiddleware } from "http-proxy-middleware";
import cookieParser from "cookie-parser";

declare global {
  interface QwikCityPlatform extends PlatformNode {}
}

// Directories where the static assets are located
const distDir = join(fileURLToPath(import.meta.url), "..", "..", "dist");
const buildDir = join(distDir, "build");

// Create the Qwik City Node middleware
const { router, notFound } = createQwikCity({
  render,
  qwikCityPlan,
  manifest,
  getOrigin(req) {
    const protocol = req.headers["x-forwarded-proto"] ?? "https";
    const host = req.headers["x-forwarded-host"] ?? req.headers.host;
    return `${protocol}://${host}`;
  },
});

// Create the express server
const app = express();

// Middleware to parse cookies and JSON bodies
app.use(cookieParser());
app.use(express.json());

const validTokens = new Set<string>();

// Middleware to handle token generation and validation
app.use("/chatgpt", (req: Request, res: Response, next: NextFunction) => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    typeof forwarded === "string"
      ? forwarded.split(",")[0]
      : req.connection.remoteAddress;
  const clientIp = ip ? ip.split(":").pop() || "" : "";
  console.log(`Client IP: ${clientIp}`);

  if (req.method === "POST" && req.headers["x-internal-request"] === "true") {
    const { token } = req.body;
    console.log(`Received token: ${token} from IP: ${clientIp}`);
    if (token) {
      validTokens.add(token);
      console.log(`Token ${token} saved.`);
      return res.status(200).send("Token saved");
    }
    console.log("Invalid token request");
    return res.status(400).send("Invalid request");
  } else {
    const authToken = req.query.token as string;
    console.log(`Received auth token: ${authToken} from IP: ${clientIp}`);
    if (authToken && validTokens.has(authToken)) {
      validTokens.delete(authToken); // Remove token after it is used
      console.log(`Token ${authToken} validated and deleted.`);
      return next();
    }
    console.log(`Invalid auth token: ${authToken}`);
    return res.redirect("/");
  }
});

const chatgptProxyOptions = {
  target: "http://chatgpt-next-web:3000",
  changeOrigin: true,
  pathRewrite: (path: string): string => {
    console.log(`Proxying request to: ${path}`);
    // Remove the leading '/chatgpt' or '/_next' or '/serviceWorkerRegister.js'
    if (path.startsWith("/chatgpt")) {
      return path.replace(/^\/chatgpt/, "");
    }
  },
};

const nextProxyOptions = {
  target: "http://chatgpt-next-web:3000/_next",
  changeOrigin: true,
};

const serviceWorkerProxyOptions = {
  target: "http://chatgpt-next-web:3000/serviceWorkerRegister.js",
  changeOrigin: true,
};

// Apply proxy middleware
app.use("/chatgpt", createProxyMiddleware(chatgptProxyOptions));
app.use("/_next", createProxyMiddleware(nextProxyOptions));
app.use(
  "/serviceWorkerRegister.js",
  createProxyMiddleware(serviceWorkerProxyOptions)
);

// Static asset handlers
app.use(`/build`, express.static(buildDir, { immutable: true, maxAge: "1y" }));
app.use(express.static(distDir, { redirect: false }));

// Use Qwik City's page and endpoint request handler
app.use(router);

// Use Qwik City's 404 handler
app.use(notFound);

// enable https
const privateKey = fs.readFileSync(
  `${process.env.CERT_PATH}/RSA-privkey.pem`,
  "utf8"
);
const certificate = fs.readFileSync(
  `${process.env.CERT_PATH}/RSA-cert.pem`,
  "utf8"
);

const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(process.env.PORT ?? 3000, () => {
  console.log("HTTPS Server started");
});

http
  .createServer((req, res) => {
    res.writeHead(301, {
      Location: "https://" + req.headers["host"] + req.url,
    });
    res.end();
  })
  .listen(process.env.HTTP_PORT ?? 80, () => {
    console.log("HTTP Server started");
  });

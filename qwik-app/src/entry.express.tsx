import {
  createQwikCity,
  type PlatformNode,
} from "@builder.io/qwik-city/middleware/node";
import qwikCityPlan from "@qwik-city-plan";
import { manifest } from "@qwik-client-manifest";
import render from "./entry.ssr";
import express from "express";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import * as fs from "fs";
import http from "http";
import https from "https";
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

app.use((req, res, next) => {
  // Set CORS headers

  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://mirror.dsessential.com"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Set Content-Security-Policy header to allow both origins
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors 'self' https://nas.dsessential.com"
  );

  next();
});

// Middleware to parse cookies and JSON bodies
app.use(cookieParser());
app.use(express.json());

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

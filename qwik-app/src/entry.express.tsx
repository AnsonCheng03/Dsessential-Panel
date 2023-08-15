/*
 * WHAT IS THIS FILE?
 *
 * It's the entry point for the Express HTTP server when building for production.
 *
 * Learn more about Node.js server integrations here:
 * - https://qwik.builder.io/docs/deployments/node/
 *
 */
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
    // If deploying under a proxy, you may need to build the origin from the request headers
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Proto
    const protocol = req.headers["x-forwarded-proto"] ?? "http";
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Host
    const host = req.headers["x-forwarded-host"] ?? req.headers.host;
    return `${protocol}://${host}`;
  },
});

// Create the express server
// https://expressjs.com/
const app = express();

// Enable gzip compression
// app.use(compression());

// Static asset handlers
// https://expressjs.com/en/starter/static-files.html
app.use(`/build`, express.static(buildDir, { immutable: true, maxAge: "1y" }));
app.use(express.static(distDir, { redirect: false }));

// Use Qwik City's page and endpoint request handler
app.use(router);

// Use Qwik City's 404 handler
app.use(notFound);

// enable https
const privateKey = fs.readFileSync(`${process.env.CERT_PATH}/cert.key`, "utf8");
const certificate = fs.readFileSync(
  `${process.env.CERT_PATH}/cert.crt`,
  "utf8",
);

const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(process.env.PORT ?? 3000, () => {
  console.log("HTTPS Server started");
});

http
  .createServer(function (req, res) {
    res.writeHead(301, {
      Location: "https://" + req.headers["host"] + req.url,
    });
    res.end();
  })
  .listen(process.env.HTTP_PORT ?? 80, () => {
    console.log("HTTP Server started");
  });

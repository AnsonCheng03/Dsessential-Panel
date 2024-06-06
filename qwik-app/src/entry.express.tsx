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
const httpStatus = require("http-status-codes");

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
  if (req.method === "POST" && req.headers["x-internal-request"] === "true") {
    const { token } = req.body;
    if (token) {
      validTokens.add(token);
      return res.status(200).send("Token saved");
    }
    return res.status(400).send("Invalid request");
  } else {
    const authToken = req.query.token as string;
    if (authToken && validTokens.has(authToken)) {
      validTokens.delete(authToken); // Remove token after it is used
      return next();
    }
    return res.redirect("/");
  }
});

const fetchAndReturn = (url: string) => (req: Request, res: Response) => {
  http
    .get(url, (response) => {
      let data = "";

      // A chunk of data has been received.
      response.on("data", (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Send the result.
      response.on("end", () => {
        const contentType = url.endsWith(".js")
          ? "application/javascript"
          : "application/json";
        res.setHeader("Content-Type", contentType);
        res.send(data);
      });
    })
    .on("error", (err) => {
      res.status(500).send(`Error fetching ${url} (${err.message})`);
    });
};

const createProxyOptions = (targetPath: string) => ({
  target: `http://chatgpt-next-web:3000${targetPath}`,
  changeOrigin: true,
  preserveHeaderKeyCase: true,
  pathRewrite:
    targetPath === ""
      ? (path: string) => path.replace(/^\/chatgpt/, "")
      : undefined,
  agent: new http.Agent({ keepAlive: true }),
  plugins: [
    (proxyServer: any) => {
      proxyServer.on(
        "proxyReq",
        (proxyReq: http.ClientRequest, req: express.Request) => {
          if (!req.body) {
            return;
          }
          const contentType = req.get("content-type");
          if (contentType) {
            proxyReq.setHeader("content-type", contentType);
          }
          const contentLength = req.get("content-length");
          if (contentLength) {
            const bodyData = JSON.stringify(req.body);
            const bufferLength = Buffer.byteLength(bodyData);
            if (bufferLength != parseInt(contentLength)) {
              console.warn(
                `buffer length = ${bufferLength}, content length = ${contentLength}`
              );
              proxyReq.setHeader("content-length", bufferLength);
            }
            proxyReq.write(bodyData);
          }
        }
      );

      proxyServer.on(
        "proxyRes",
        (
          proxyRes: http.IncomingMessage,
          req: express.Request,
          res: express.Response
        ) => {
          res.status(proxyRes.statusCode ?? 500);
          for (const key of Object.keys(proxyRes.headers)) {
            let rawValue = proxyRes.headers[key];
            if (!Array.isArray(rawValue)) {
              rawValue = [rawValue as string];
            }
            for (const value of rawValue) {
              res.set(key, value);
            }
          }

          console.log("this is where you transform the response");

          let body = new Buffer("");
          const bodyPromise = new Promise(function (resolve, reject) {
            proxyRes.on("data", (data) => (body = Buffer.concat([body, data])));
            proxyRes.on("end", () => resolve(body.toString("utf8")));
            proxyRes.on("error", (err) => reject(err));
          });

          bodyPromise
            .then(() => res.end(body))
            .catch(() => res.status(httpStatus.INTERNAL_SERVER_ERROR).end());
        }
      );
    },
  ],
});

app.use("/chatgpt", createProxyMiddleware(createProxyOptions("")));
app.use("/_next", createProxyMiddleware(createProxyOptions("/_next")));
app.use("/api", (req, res, next) => {
  if (!req.path.startsWith("/auth")) {
    createProxyMiddleware(createProxyOptions("/api"))(req, res, next);
  } else {
    next();
  }
});
app.use(
  "/google-fonts",
  createProxyMiddleware(createProxyOptions("/google-fonts"))
);

app.use(
  "/serviceWorkerRegister.js",
  fetchAndReturn("http://chatgpt-next-web:3000/serviceWorkerRegister.js")
);
app.use(
  "/serviceWorker.js",
  fetchAndReturn("http://chatgpt-next-web:3000/serviceWorker.js")
);
app.use(
  "/prompts.json",
  fetchAndReturn("http://chatgpt-next-web:3000/prompts.json")
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

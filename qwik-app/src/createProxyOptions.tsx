import type express from "express";
import type http from "http";
import httpStatus from "http-status-codes";

export const createProxyOptions = (
  targetPath: string,
  pathRewriteFn?: (path: string) => string,
  cookieCheckToken?: string
) => ({
  target: targetPath,
  changeOrigin: true,
  preserveHeaderKeyCase: true,
  pathRewrite: pathRewriteFn,
  secure: false,
  plugins: [
    (proxyServer: any) => {
      proxyServer.on(
        "proxyReq",
        (proxyReq: http.ClientRequest, req: express.Request) => {
          // Check if cookie has specified token, if not, drop the request
          if (cookieCheckToken) {
            if (
              !req.headers.cookie ||
              !req.headers.cookie.includes(cookieCheckToken)
            ) {
              console.warn(
                "No session token found in request, url requesting:",
                req.url
              );
              proxyReq.destroy();
              return;
            }
          }

          Object.keys(req.headers).forEach((key) => {
            proxyReq.setHeader(key, req.headers[key] as string);
          });

          if (req.body) {
            const contentType = req.get("content-type");
            const contentLength = req.get("content-length");
            if (contentType) proxyReq.setHeader("content-type", contentType);
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
              console.log("Request body:", bodyData);
            }
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
          Object.entries(proxyRes.headers).forEach(([key, value]) => {
            res.set(key, value as string | string[]);
          });

          const contentType = proxyRes.headers["content-type"];
          const isBinary =
            contentType &&
            (contentType.includes("video/") || contentType.includes("application/octet-stream"));

          if (isBinary) {
            let totalSize = 0;
            let chunks: Buffer[] = [];
            
            proxyRes.on("data", (chunk) => {
              console.log("Received chunk of size:", chunk.length);
              totalSize += chunk.length;
              chunks.push(chunk);
              console.log("Total size so far:", totalSize);
            });

            proxyRes.on("end", () => {
              const completeBuffer = Buffer.concat(chunks);
              console.log("Total size received:", completeBuffer.length);
              res.end(completeBuffer);
            });
          } else {
            let body = Buffer.alloc(0);
            proxyRes.on("data", (data) => (body = Buffer.concat([body, data])));
            proxyRes.on("end", () => res.end(body.toString("utf8")));
          }

          proxyRes.on("error", (err: Error) => {
            console.error(`Error in proxy response: ${err.message}`);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
          });
        }
      );
    },
  ],
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as https from 'https';
import * as express from 'express';

function logRequests(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers: ', req.headers);
  next();
}

async function bootstrap() {
  console.log('Starting NestJS server...');
  const privateKey = fs.readFileSync(
    `${process.env.CERT_PATH}/cert.key`,
    'utf8',
  );
  const certificate = fs.readFileSync(
    `${process.env.CERT_PATH}/cert.crt`,
    'utf8',
  );
  const httpsOptions = { key: privateKey, cert: certificate };

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.use(logRequests);

  await app.init();

  https.createServer(httpsOptions, server).listen(3500);
  console.log('NestJS server started on port 3500 (https).');
}

bootstrap();

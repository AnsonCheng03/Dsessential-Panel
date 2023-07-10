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
  try {
    // throw new Error('Force fallback to http');
    const privateKey = fs.readFileSync('./cert/cert.key', 'utf8');
    const certificate = fs.readFileSync('./cert/cert.crt', 'utf8');
    const httpsOptions = { key: privateKey, cert: certificate };

    const server = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.use(logRequests);

    await app.init();

    https.createServer(httpsOptions, server).listen(3500);
    console.log('NestJS server started on port 3500 (https).');
  } catch (err) {
    console.error('Start https server failed: ', err);

    const app = await NestFactory.create(AppModule);
    app.use(logRequests);
    await app.listen(3500);

    console.log('Fallback: NestJS server started on port 3500 (http).');
  }
}

bootstrap();

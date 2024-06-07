import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as https from 'https';
import * as express from 'express';

// function logRequests(
//   req: express.Request,
//   res: express.Response,
//   next: express.NextFunction,
// ) {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//   console.log('Headers: ', req.headers);
//   next();
// }

async function bootstrap() {
  console.log('Starting NestJS server...');
  const privateKey = fs.readFileSync(
    `${process.env.CERT_PATH}/RSA-privkey.pem`,
    'utf8',
  );
  const certificate = fs.readFileSync(
    `${process.env.CERT_PATH}/RSA-cert.pem`,
    'utf8',
  );
  const httpsOptions = { key: privateKey, cert: certificate };

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  if (process.env.LOG_REQUEST === 'true') {
    console.log('Logging requests...');
    // app.use(logRequests);
  }
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.init();

  https.createServer(httpsOptions, server).listen(3500);
  console.log('NestJS server started on port 3500 (https).');
}

bootstrap();

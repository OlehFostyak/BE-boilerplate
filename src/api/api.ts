 import 'src/services/env/env.service';
import fastify from 'fastify';
import autoload from '@fastify/autoload';
import path from 'path';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { getUUIDService } from 'src/services/uuid/uuid.service';
import { errorHandler } from './errors/error.handler';
import crypto from 'crypto';
import { getRepos } from 'src/repos';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import autoTagging from './plugins/auto-tagging.plugin';
import requestId from './plugins/request-id.plugin';
import responseTime from './plugins/response-time.plugin';
import healthCheck from './plugins/health-check.plugin';
import routePrinter from './plugins/route-printer.plugin';
import authPlugin from './plugins/auth.plugin';
import { setupSwagger } from './plugins/swagger.plugin';
import { getLoggerOptions } from './plugins/logger.plugin';
import { getDb, dbHealthCheck } from 'src/services/drizzle/drizzle.service';

async function run() {
  const server = fastify({
    // get from reverse proxy
    // or using genReqId
    genReqId: () => crypto.randomUUID(),
    // if reverse proxy has x-request-id use if for request id
    requestIdHeader: 'x-request-id',
    trustProxy: true,
    logger: getLoggerOptions(),
    exposeHeadRoutes: false
  });

  // global node js error handlers
  process.on('uncaughtException', (err) => {
    server.log.error(err);
    process.exit(1);
  });
  process.on('unhandledRejection', (err) => {
    server.log.error(err);
    process.exit(1);
  });

  server.register(helmet);
  server.register(cors, {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  });

  // TODO check why in docker build it fails without "!"
  if (['local', 'staging'].includes(process.env.NODE_ENV!)) {
    await setupSwagger(server, process.env.SWAGGER_USER, process.env.SWAGGER_PWD);
  }

  // set error handler
  server.setErrorHandler(errorHandler);

  // set not found handler
  server.setNotFoundHandler((_1, r) => {
    return r.status(404).send(404);
  });

  // set zod req/res validator and serializer
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  // load context
  server.decorate('uuid', getUUIDService());
  // server.decorate(
  //   'identityService',
  //   getAWSCognitoService(process.env.AWS_REGION)
  // );
  server.decorate(
    'db',
    getDb({
      host: process.env.PGHOST || '',
      port: parseInt(process.env.PGPORT || ''),
      db: process.env.PGDATABASE || '',
      user: process.env.PGUSERNAME || '',
      pwd: process.env.PGPASSWORD || '',
      logsEnabled: process.env.NODE_ENV == 'local'
    })
  );
  server.decorate('repos', getRepos(server.db));

  server.register(autoTagging);

  // load plugins
  server.register(responseTime);
  server.register(healthCheck, {
    healthChecksPromises: [
      () => dbHealthCheck(server.db)
    ],
    path: '/api/health'
  });
  server.register(requestId);
  server.register(routePrinter, {
    skip: ['/api/documentation'],
    logLevel: 'silent'
  });
  
  // Register authentication plugin
  server.register(authPlugin);

  // load routes
  server.register(autoload, {
    dir: path.join(__dirname, 'routes'),
    dirNameRoutePrefix: true,
    options: {
      prefix: '/api'
    }
  });

  await server.ready();
  await server.listen({
    port: parseInt(process.env.PORT || ''),
    host: process.env.HOST || ''
  });
}

run();
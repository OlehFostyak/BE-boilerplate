import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { HealthMetrics, HealthMetricsSchema } from 'src/types/HealthMetrics';
import z from 'zod';

const healthCheckResponseSchema = z.array(HealthMetricsSchema.omit({ errorMessage: true }));

interface Options {
  healthChecksPromises: [() => Promise<HealthMetrics>] | [];
  path: string;
}

const plugin: FastifyPluginAsync<Options> = async function (fastify, opts) {
  fastify.get(opts.path, { 
    logLevel: 'silent',
    config: {
      skipAuthHook: true // Skip authentication for health check
    }
  }, async (_req, reply) => {
    const healthChecks = await Promise.all(opts.healthChecksPromises.map((check) => check()));
    const statusCode = healthChecks.some((healthCheck) => !healthCheck.isOk) ? 500 : 200;
    reply.status(statusCode).send(healthCheckResponseSchema.parse(healthChecks));
  });
};

export default fp(plugin, '5.x');
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const HEADER_NAME = 'x-response-time';

declare module 'fastify' {
  interface FastifyRequest {
    starTimeMS: number;
  }
}

const plugin: FastifyPluginAsync = async function (fastify) {
  fastify.addHook('onRequest', async (request) => {
     
    request.starTimeMS = Date.now();
  });

  fastify.addHook('onSend', async (request, reply) => {
    const responseTime = Date.now() - request.starTimeMS;
    reply.header(HEADER_NAME, `${responseTime}`);
  });
};

export default fp(plugin, '5.x');
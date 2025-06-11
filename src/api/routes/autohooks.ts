import { FastifyPluginAsync } from 'fastify';
import { testHook } from 'src/api/hooks/test.hook';

const hooks: FastifyPluginAsync = async function (fastify) {
  fastify.addHook('preHandler', testHook);
};

export default hooks;
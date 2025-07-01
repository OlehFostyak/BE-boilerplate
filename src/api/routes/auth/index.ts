import { FastifyPluginAsync } from 'fastify';
import authRoutes from './auth.route';

const routes: FastifyPluginAsync = async (fastify) => {
  // Register auth routes
  fastify.register(authRoutes);
};

export default routes;

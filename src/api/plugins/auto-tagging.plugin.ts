import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const plugin: FastifyPluginAsync = async function (fastify) {
  fastify.addHook('onRoute', (routeOptions) => {
    if (routeOptions.url) {
      // First try to match `/api/admin/{tag}/...`
      let pathMatch = routeOptions.url.match(/^\/api\/admin\/([^\/]+)/);
      // If no match is found, try to match `/api/{tag}/...`
      if (!pathMatch) {
        pathMatch = routeOptions.url.match(/^\/api\/([^\/]+)/);
      }
      // Use the first capturing group as the tag, or 'default' if no matches are found
      const tag = pathMatch ? pathMatch[1] : 'default';

      // Add or modify the existing tags
      if (!routeOptions.schema) {
        routeOptions.schema = {};
      }

      const existingTags = routeOptions.schema.tags || [];

      routeOptions.schema.tags = [...existingTags, tag];
    }
  });
};

export default fp(plugin, '5.x');
import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { CreatePostReqSchema } from 'src/api/routes/schemas/posts/CreatePostReqSchema';
import { GetPostByIdRespSchema } from 'src/api/routes/schemas/posts/GetPostByIdRespSchema';
import { GetPostsRespSchema } from 'src/api/routes/schemas/posts/GetPostsRespSchema';
import { PaginationQuerySchema } from 'src/api/routes/schemas/PaginationSchema';
import { getPaginatedResponse } from 'src/api/utils/pagination';
import { createPost } from 'src/controllers/post/create-post';
import { getPosts } from 'src/controllers/post/get-posts';

const createPostRoute = {
  schema: {
    response: {
      200: GetPostByIdRespSchema
    },
    body: CreatePostReqSchema
  }
};

const getPostsRoute = {
  schema: {
    response: {
      200: GetPostsRespSchema
    },
    querystring: PaginationQuerySchema
  }
};

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  fastify.post('/', createPostRoute, async (req) => createPost({
    postRepo: fastify.repos.postRepo,
    data: req.body
  }));

  fastify.get('/', getPostsRoute, async (req) => {
    const { limit, offset } = req.query;
    const { posts, total } = await getPosts({
      postRepo: fastify.repos.postRepo,
      limit,
      offset
    });

    return getPaginatedResponse(posts, total, limit, offset);
  });
};

export default routes;
import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { CreatePostReqSchema } from '../schemas/CreatePostReqSchema';
import { GetPostByIdRespSchema } from '../schemas/GetPostByIdRespSchema';
import { GetPostsRespSchema } from '../schemas/GetPostsRespSchema';
import { createPost } from 'src/controllers/post/create-post';
import { getPosts } from 'src/controllers/post/get-posts';

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  fastify.post('/', {
    schema: {
      response: {
        200: GetPostByIdRespSchema
      },
      body: CreatePostReqSchema
    }
  }, async req => {
    const post = await createPost({
      postRepo: fastify.repos.postRepo,
      data: req.body
    });
    return post;
  });

  fastify.get('/', {
    schema: {
      response: {
        200: GetPostsRespSchema
      }
    }
  }, async () => {
    const posts = await getPosts({
      postRepo: fastify.repos.postRepo
    });
    return posts;
  });
};

export default routes;
import { z } from 'zod';
import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { GetPostByIdRespSchema } from 'src/api/routes/schemas/posts/GetPostByIdRespSchema';
import { UpdatePostReqSchema } from 'src/api/routes/schemas/posts/UpdatePostReqSchema';
import { getPostById } from 'src/controllers/post/get-post-by-id';
import { updatePostById } from 'src/controllers/post/update-post-by-id';
import { deletePostById } from 'src/controllers/post/delete-post-by-id';

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  fastify.get('/', {
    schema: {
      params: z.object({
        postId: z.string().uuid()
      }),
      response: {
        200: GetPostByIdRespSchema
      }
    }
  }, async req => {
    const post = await getPostById({
      postRepo: fastify.repos.postRepo,
      postId: req.params.postId
    });
    return post;
  });

  fastify.patch('/', {
    schema: {
      params: z.object({
        postId: z.string().uuid()
      }),
      response: {
        200: GetPostByIdRespSchema
      },
      body: UpdatePostReqSchema
    }
  }, async req => {
    const post = await updatePostById({
      postRepo: fastify.repos.postRepo,
      postId: req.params.postId,
      data: req.body
    });
    return post;
  });

  fastify.delete('/', {
    schema: {
      params: z.object({
        postId: z.string().uuid()
      })
    }
  }, async req => {
    await deletePostById({
      postRepo: fastify.repos.postRepo,
      postId: req.params.postId
    });
    return {};
  });
};

export default routes;
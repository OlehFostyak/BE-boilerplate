import { z } from 'zod';
import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { GetPostByIdRespSchema } from 'src/api/routes/schemas/posts/GetPostByIdRespSchema';
import { UpdatePostReqSchema } from 'src/api/routes/schemas/posts/UpdatePostReqSchema';
import { getPostById } from 'src/controllers/post/get-post-by-id';
import { updatePostById } from 'src/controllers/post/update-post-by-id';
import { deletePostById } from 'src/controllers/post/delete-post-by-id';
import { UserRole } from 'src/types/users/User';

const getPostByIdRoute = {
  schema: {
    params: z.object({
      postId: z.string().uuid()
    }),
    response: {
      200: GetPostByIdRespSchema
    }
  }
};

const updatePostByIdRoute = {
  schema: {
    params: z.object({
      postId: z.string().uuid()
    }),
    response: {
      200: GetPostByIdRespSchema
    },
    body: UpdatePostReqSchema
  }
};

const deletePostByIdRoute = {
  schema: {
    params: z.object({
      postId: z.string().uuid()
    })
  }
};

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  fastify.get('/', getPostByIdRoute, async req => getPostById({
    postRepo: fastify.repos.postRepo,
    postId: req.params.postId
  }));

  fastify.patch('/', updatePostByIdRoute, async req => updatePostById({
    postRepo: fastify.repos.postRepo,
    postId: req.params.postId,
    data: req.body,
    userId: req.userId as string,
    userRole: req.userRole as UserRole
  }));

  fastify.delete('/', deletePostByIdRoute, async req => deletePostById({
    postRepo: fastify.repos.postRepo,
    postId: req.params.postId,
    userId: req.userId as string,
    userRole: req.userRole as UserRole
  }));
};

export default routes;
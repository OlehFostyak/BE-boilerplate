import { z } from 'zod';
import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { CreateCommentReqSchema } from 'src/api/routes/schemas/comments/CreateCommentReqSchema';
import { GetCommentByIdRespSchema } from 'src/api/routes/schemas/comments/GetCommentByIdRespSchema';
import { GetCommentsRespSchema } from 'src/api/routes/schemas/comments/GetCommentsRespSchema';
import { UpdateCommentReqSchema } from 'src/api/routes/schemas/comments/UpdateCommentReqSchema';
import { createComment } from 'src/controllers/comments/create-comment';
import { getComments } from 'src/controllers/comments/get-comments';
import { updateCommentById } from 'src/controllers/comments/update-comment-by-id';
import { deleteCommentById } from 'src/controllers/comments/delete-comment-by-id';
import { UserRole } from 'src/types/users/User';

const createCommentRoute = {
  schema: {
    params: z.object({
      postId: z.string().uuid()
    }),
    response: {
      200: GetCommentByIdRespSchema
    },
    body: CreateCommentReqSchema
  }
};

const getCommentsRoute = {
  schema: {
    params: z.object({
      postId: z.string().uuid()
    }),
    response: {
      200: GetCommentsRespSchema
    }
  }
};

const updateCommentByIdRoute = {
  schema: {
    params: z.object({
      commentId: z.string().uuid()
    }),
    response: {
      200: GetCommentByIdRespSchema
    },
    body: UpdateCommentReqSchema
  }
};

const deleteCommentByIdRoute = {
  schema: {
    params: z.object({
      commentId: z.string().uuid(),
      postId: z.string().uuid()
    })
  }
};

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  fastify.post('/', createCommentRoute, async req => createComment({
    commentRepo: fastify.repos.commentRepo,
    data: { ...req.body, postId: req.params.postId, userId: req.userId as string }
  }));

  fastify.get('/', getCommentsRoute, async (req) => {
    return getComments({
      commentRepo: fastify.repos.commentRepo,
      postId: req.params.postId
    });
  });

  fastify.patch('/:commentId', updateCommentByIdRoute, async (req) => {
    return updateCommentById({
      commentRepo: fastify.repos.commentRepo,
      commentId: req.params.commentId,
      data: req.body,
      userId: req.userId as string,
      userRole: req.userRole as UserRole
    });
  });

  fastify.delete('/:commentId', deleteCommentByIdRoute, async (req) => {
    // Get post owner ID first to check if the user is the post owner
    const post = await fastify.repos.postRepo.getPostById(req.params.postId);
    const postOwnerId = post?.user?.id;
    
    return deleteCommentById({
      commentRepo: fastify.repos.commentRepo,
      commentId: req.params.commentId,
      userId: req.userId as string,
      userRole: req.userRole as UserRole,
      postOwnerId
    });
  });
};

export default routes;
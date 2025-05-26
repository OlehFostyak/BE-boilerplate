import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { CreateCommentReqSchema } from '../../../schemas/CreateCommentReqSchema';
import { GetCommentByIdRespSchema } from '../../../schemas/GetCommentByIdRespSchema';
import { GetCommentsRespSchema } from '../../../schemas/GetCommentsRespSchema';
import { UpdateCommentReqSchema } from '../../../schemas/UpdateCommentReqSchema';
import { createComment } from 'src/controllers/comments/create-comment';
import { getComments } from 'src/controllers/comments/get-comments';
import { updateCommentById } from 'src/controllers/comments/update-comment-by-id';
import { deleteCommentById } from 'src/controllers/comments/delete-comment-by-id';

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  fastify.post('/', {
    schema: {
      params: z.object({
        postId: z.string().uuid()
      }),
      response: {
        200: GetCommentByIdRespSchema
      },
      body: CreateCommentReqSchema
    }
  }, async req => {
    const comment = await createComment({
      commentRepo: fastify.repos.commentRepo,
      data: { ...req.body, postId: req.params.postId }
    });
    console.log('comment', comment);
    return comment;
  });

  fastify.get('/', {
    schema: {
      params: z.object({
        postId: z.string().uuid()
      }),
      response: {
        200: GetCommentsRespSchema
      }
    }
  }, async req => {
    const comments = await getComments({
      commentRepo: fastify.repos.commentRepo,
      postId: req.params.postId
    });
    return comments;
  });

  fastify.patch('/:commentId', {
    schema: {
      params: z.object({
        commentId: z.string()
      }),
      response: {
        200: GetCommentByIdRespSchema
      },
      body: UpdateCommentReqSchema
    }
  }, async req => {
    const comment = await updateCommentById({
      commentRepo: fastify.repos.commentRepo,
      commentId: req.params.commentId,
      data: req.body
    });
    return comment;
  });

  fastify.delete('/:commentId', {
    schema: {
      params: z.object({
        commentId: z.string()
      }),
      response: {
        200: GetCommentByIdRespSchema
      }
    }
  }, async req => {
    const comment = await deleteCommentById({
      commentRepo: fastify.repos.commentRepo,
      commentId: req.params.commentId
    });
    return comment;
  });
};

export default routes;
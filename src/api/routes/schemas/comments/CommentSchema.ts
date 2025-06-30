import { z } from 'zod';
import { GetCommentByIdRespSchema } from 'src/api/routes/schemas/comments/GetCommentByIdRespSchema';
import { CreateCommentReqSchema } from 'src/api/routes/schemas/comments/CreateCommentReqSchema';
import { UpdateCommentReqSchema } from 'src/api/routes/schemas/comments/UpdateCommentReqSchema';
import { GetCommentsRespSchema } from 'src/api/routes/schemas/comments/GetCommentsRespSchema';

export const createCommentSchema = {
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
  
  export const getCommentsSchema = {
    schema: {
      params: z.object({
        postId: z.string().uuid()
      }),
      response: {
        200: GetCommentsRespSchema
      }
    }
  };
  
  export const updateCommentByIdSchema = {
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
  
  export const deleteCommentByIdSchema = {
    schema: {
      params: z.object({
        commentId: z.string().uuid(),
        postId: z.string().uuid()
      })
    }
  };
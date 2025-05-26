import { z } from 'zod';
import { GetCommentByIdRespSchema } from './GetCommentByIdRespSchema';

export const GetCommentsRespSchema = z.array(GetCommentByIdRespSchema);

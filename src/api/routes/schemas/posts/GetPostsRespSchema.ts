import { z } from 'zod';
import { GetPostByIdRespSchema } from './GetPostByIdRespSchema';

export const GetPostsRespSchema = z.array(GetPostByIdRespSchema);

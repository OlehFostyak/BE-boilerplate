import { z } from 'zod';
import { PostSchema } from 'src/types/posts/Post';

// Використовуємо PostSchema для узгодженості з новою структурою
export const GetPostByIdRespSchema = PostSchema;
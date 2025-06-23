import { z } from 'zod';
import { CommentSchema } from 'src/types/comments/Comment';

// Використовуємо CommentSchema для узгодженості з новою структурою
export const GetCommentByIdRespSchema = CommentSchema;
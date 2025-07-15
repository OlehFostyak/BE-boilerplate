import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  cognitoId: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['admin', 'user']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type UserSchemaType = z.infer<typeof UserSchema>;

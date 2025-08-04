import { z } from 'zod';
import { createSuccessResponseSchema } from '../common/ResponseSchema';
import { PaginatedResponseSchema } from '../PaginationSchema';

export const ArchiveUserReqSchema = z.object({
  userId: z.string().uuid('Invalid user ID format')
});

export const ArchiveUserRespSchema = createSuccessResponseSchema(
  z.object({
    success: z.literal(true),
    archivedId: z.string().uuid()
  })
);

export const RestoreUserReqSchema = z.object({
  archivedUserId: z.string().uuid('Invalid archived user ID format')
});

export const RestoreUserRespSchema = createSuccessResponseSchema(
  z.object({
    success: z.literal(true),
    restoredUserId: z.string().uuid()
  })
);

const ArchivedUserSchema = z.object({
  id: z.string().uuid(),
  originalUserId: z.string().uuid(),
  userData: z.object({
    id: z.string().uuid(),
    cognitoId: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.string(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable()
  }),
  archivedAt: z.date(),
  archivedBy: z.string().uuid()
});

export const GetArchivedUsersRespSchema = PaginatedResponseSchema(ArchivedUserSchema);

export const ArchivedUserSearchSchema = z.object({
  search: z.string().optional()
});

export type ArchiveUserReq = z.infer<typeof ArchiveUserReqSchema>;
export type ArchiveUserResp = z.infer<typeof ArchiveUserRespSchema>;
export type RestoreUserReq = z.infer<typeof RestoreUserReqSchema>;
export type RestoreUserResp = z.infer<typeof RestoreUserRespSchema>;
export type GetArchivedUsersResp = z.infer<typeof GetArchivedUsersRespSchema>;
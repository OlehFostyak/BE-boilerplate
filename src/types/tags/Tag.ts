import { z } from 'zod';
import { TagSortField } from 'src/api/routes/schemas/tags/TagsSortSchema';
import { SortOrder } from 'src/api/routes/schemas/SortSchema';

export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  description: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  postsCount: z.number().int().nonnegative()
});

export type Tag = z.infer<typeof TagSchema>;

export const CreateTagDataSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().nullable().optional()
});

export type CreateTagData = z.infer<typeof CreateTagDataSchema>;

export const UpdateTagDataSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().nullable().optional()
});

export type UpdateTagData = z.infer<typeof UpdateTagDataSchema>;

export interface GetTagsParams {
  limit: number;
  offset: number;
  search?: string;
  sortBy: TagSortField;
  sortOrder?: SortOrder;
}

export interface GetTagsResult {
  tags: Tag[];
  total: number;
}

export interface CreateTagParams {
  tagRepo: {
    createTag: (data: CreateTagData) => Promise<Tag>;
  };
  data: CreateTagData;
}

export interface UpdateTagParams {
  tagRepo: {
    updateTagById: (id: string, data: UpdateTagData) => Promise<Tag | null>;
  };
  id: string;
  data: UpdateTagData;
}

export interface DeleteTagParams {
  tagRepo: {
    deleteTagById: (id: string) => Promise<Tag | null>;
  };
  id: string;
}

export interface GetTagsControllerParams {
  tagRepo: {
    getTags: (params: GetTagsParams) => Promise<GetTagsResult>;
  };
  limit: number;
  offset: number;
  search?: string;
  sortBy: TagSortField;
  sortOrder?: SortOrder;
}

export interface GetTagByIdParams {
  tagRepo: {
    getTagById: (id: string) => Promise<Tag | null>;
  };
  id: string;
}

import { Tag, CreateTagData, UpdateTagData, GetTagsParams, GetTagsResult } from './Tag';

export interface ITagRepo {
  getTags(params: GetTagsParams): Promise<GetTagsResult>;
  getTagById(id: string): Promise<Tag | null>;
  createTag(data: CreateTagData): Promise<Tag>;
  updateTagById(id: string, data: UpdateTagData): Promise<Tag | null>;
  deleteTagById(id: string): Promise<Tag | null>;
  getTagsByIds(ids: string[]): Promise<Tag[]>;
  addTagsToPost(postId: string, tagIds: string[]): Promise<Tag[]>;
  removeTagsFromPost(postId: string): Promise<void>;
  getTagsByPostId(postId: string): Promise<Tag[]>;
}

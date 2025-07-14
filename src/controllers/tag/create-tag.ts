import { CreateTagParams } from 'src/types/tags/Tag';

export async function createTag(params: CreateTagParams) {
  const tag = await params.tagRepo.createTag(params.data);

  return tag;
}

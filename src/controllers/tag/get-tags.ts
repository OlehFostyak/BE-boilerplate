import { GetTagsControllerParams } from 'src/types/tags/Tag';

export async function getTags(params: GetTagsControllerParams) {
  return params.tagRepo.getTags({
    limit: params.limit,
    offset: params.offset,
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder
  });
}

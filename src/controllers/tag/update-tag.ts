import { UpdateTagParams } from 'src/types/tags/Tag';
import { HttpError } from 'src/api/errors/HttpError';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';

export async function updateTag(params: UpdateTagParams) {
  const tag = await params.tagRepo.updateTagById(params.id, params.data);

  if (!tag) {
    throw new HttpError({
      statusCode: 404,
      message: 'Tag not found',
      errorCode: EErrorCodes.NOT_FOUND
    });
  }

  return tag;
}

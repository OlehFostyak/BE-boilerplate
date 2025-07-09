import { GetTagByIdParams } from 'src/types/tags/Tag';
import { HttpError } from 'src/api/errors/HttpError';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';

export async function getTagById(params: GetTagByIdParams) {
  const tag = await params.tagRepo.getTagById(params.id);

  if (!tag) {
    throw new HttpError({
      statusCode: 404,
      message: 'Tag not found',
      errorCode: EErrorCodes.NOT_FOUND
    });
  }

  return tag;
}

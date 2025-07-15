import { HttpError } from 'src/api/errors/HttpError';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';
import { IArchiveRepo } from 'src/types/archive/IArchiveRepo';

interface DeleteArchivedPostParams {
  archiveRepo: IArchiveRepo;
  archivedPostId: string;
}

export async function deleteArchivedPost({
  archiveRepo,
  archivedPostId
}: DeleteArchivedPostParams) {
  const deletedPost = await archiveRepo.deleteArchivedPostById(archivedPostId);
  
  if (!deletedPost) {
    throw new HttpError({
      statusCode: 404,
      errorCode: EErrorCodes.NOT_FOUND
    });
  }
  
  return { success: true };
}

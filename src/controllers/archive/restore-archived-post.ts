import { HttpError } from 'src/api/errors/HttpError';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';
import { IArchiveRepo } from 'src/types/archive/IArchiveRepo';

interface RestoreArchivedPostParams {
  archiveRepo: IArchiveRepo;
  archivedPostId: string;
}

export async function restoreArchivedPost({
  archiveRepo,
  archivedPostId
}: RestoreArchivedPostParams) {
  const restoredPostId = await archiveRepo.restorePostById(archivedPostId);
  
  if (!restoredPostId) {
    throw new HttpError({
      statusCode: 404,
      errorCode: EErrorCodes.NOT_FOUND
    });
  }
  
  return { success: true, postId: restoredPostId };
}

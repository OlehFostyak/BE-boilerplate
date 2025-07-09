import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { getPostRepo } from './post.repo';
import { getCommentRepo } from './comment.repo';
import { getUserRepo } from './user.repo';
import { getTagRepo } from './tag.repo';

export function getRepos(db: NodePgDatabase) {
  return {
    postRepo: getPostRepo(db),
    commentRepo: getCommentRepo(db),
    userRepo: getUserRepo(db),
    tagRepo: getTagRepo(db)
  };
}

export type IRepos = ReturnType<typeof getRepos>;
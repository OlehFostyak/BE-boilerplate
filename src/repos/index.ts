import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { getEntityRepo } from './entity.repo';
import { getPostRepo } from './post.repo';
import { getCommentRepo } from './comment.repo';

export function getRepos(db: NodePgDatabase) {
  return {
    entityRepo: getEntityRepo(db),
    postRepo: getPostRepo(db),
    commentRepo: getCommentRepo(db)
  };
}

export type IRepos = ReturnType<typeof getRepos>;
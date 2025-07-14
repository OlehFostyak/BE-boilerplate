import { eq, count, getTableColumns, or, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ITagRepo } from 'src/types/tags/ITagRepo';
import { GetTagsResult, TagSchema } from 'src/types/tags/Tag';
import { tagTable, postTagTable } from 'src/services/drizzle/schema';
import { TagSortField } from 'src/api/routes/schemas/tags/TagsSortSchema';
import { createSortBuilder } from 'src/services/drizzle/utils/sorting';
import { SortOrder } from 'src/api/routes/schemas/SortSchema';

function searchTags(search: string | undefined) {
  if (!search) {
    return undefined;
  }

  return or(
    sql`similarity(${tagTable.name}::text, ${search}::text) > 0.3`,
    sql`similarity(${tagTable.description}::text, ${search}::text) > 0.3`
  );
}

function sortTags(sortBy: TagSortField, sortOrder?: SortOrder) {
  const sortFunction = createSortBuilder<TagSortField>({
    name: (direction) => direction(tagTable.name),
    createdAt: (direction) => direction(tagTable.createdAt),
    postsCount: (direction) => direction(count(postTagTable.id))
  });

  return sortFunction(sortBy, sortOrder);
}

export function getTagRepo(db: NodePgDatabase): ITagRepo {
  return {
    async getTags({
      limit,
      offset,
      search,
      sortBy,
      sortOrder
    }): Promise<GetTagsResult> {
      const [{ total }] = await db
        .select({ total: count() })
        .from(tagTable)
        .where(searchTags(search));

      const tags = await db
        .select({
          ...getTableColumns(tagTable),
          postsCount: count(postTagTable.id)
        })
        .from(tagTable)
        .leftJoin(postTagTable, eq(postTagTable.tagId, tagTable.id))
        .where(searchTags(search))
        .groupBy(tagTable.id)
        .orderBy(sortTags(sortBy, sortOrder))
        .limit(limit)
        .offset(offset);

      return {
        tags: tags.map(tag => TagSchema.parse(tag)),
        total
      };
    },

    async getTagById(id) {
      const tag = await db
        .select({
          ...getTableColumns(tagTable),
          postsCount: count(postTagTable.id)
        })
        .from(tagTable)
        .leftJoin(postTagTable, eq(postTagTable.tagId, tagTable.id))
        .where(eq(tagTable.id, id))
        .groupBy(tagTable.id);
      
      return tag.length > 0 ? TagSchema.parse(tag[0]) : null;
    },

    async createTag(data) {
      const tag = await db.insert(tagTable).values(data).returning();
      return TagSchema.parse({ ...tag[0], postsCount: 0 });
    },

    async updateTagById(id, data) {
      await db
        .update(tagTable)
        .set(data)
        .where(eq(tagTable.id, id));
      
      const result = await db
        .select({
          ...getTableColumns(tagTable),
          postsCount: count(postTagTable.id)
        })
        .from(tagTable)
        .leftJoin(postTagTable, eq(postTagTable.tagId, tagTable.id))
        .where(eq(tagTable.id, id))
        .groupBy(tagTable.id);
      
      return result.length > 0 ? TagSchema.parse(result[0]) : null;
    },

    async deleteTagById(id) {
      // Get tag before deleting
      const tag = await db
        .select({
          ...getTableColumns(tagTable),
          postsCount: count(postTagTable.id)
        })
        .from(tagTable)
        .leftJoin(postTagTable, eq(postTagTable.tagId, tagTable.id))
        .where(eq(tagTable.id, id))
        .groupBy(tagTable.id);
      
      if (tag.length === 0) {
        return null;
      }
      
      await db.delete(tagTable).where(eq(tagTable.id, id));
      
      return TagSchema.parse(tag[0]);
    },

    async getTagsByIds(ids) {
      if (!ids || ids.length === 0) {
        return [];
      }

      const tags = await db
        .select({
          ...getTableColumns(tagTable),
          postsCount: count(postTagTable.id)
        })
        .from(tagTable)
        .leftJoin(postTagTable, eq(postTagTable.tagId, tagTable.id))
        .where(sql`${tagTable.id} IN ${ids}`)
        .groupBy(tagTable.id);

      return tags.map(tag => TagSchema.parse(tag));
    },

    async addTagsToPost(postId, tagIds) {
      if (!tagIds || tagIds.length === 0) {
        return [];
      }

      const values = tagIds.map(tagId => ({
        postId,
        tagId
      }));

      await db.insert(postTagTable).values(values);

      return this.getTagsByIds(tagIds);
    },

    async removeTagsFromPost(postId) {
      await db
        .delete(postTagTable)
        .where(eq(postTagTable.postId, postId));
    },

    async getTagsByPostId(postId) {
      const tags = await db
        .select({
          ...getTableColumns(tagTable),
          postsCount: count(postTagTable.id).as('postsCount')
        })
        .from(tagTable)
        .innerJoin(postTagTable, eq(postTagTable.tagId, tagTable.id))
        .where(eq(postTagTable.postId, postId))
        .groupBy(tagTable.id);

      return tags.map(tag => TagSchema.parse(tag));
    }
  };
}

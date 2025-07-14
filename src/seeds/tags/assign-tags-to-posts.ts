import { createReadlineInterface, getNumberInput, getDbConnection, executeSeed } from '../seed-utils';
import { postTable, tagTable, postTagTable } from 'src/services/drizzle/schema';
import { eq, sql } from 'drizzle-orm';

async function getInput(): Promise<{ minTags: number; maxTags: number }> {
  const rl = createReadlineInterface();

  try {
    const minTags = await getNumberInput(rl, 'Enter the minimum number of tags per post: ');
    const maxTags = await getNumberInput(rl, 'Enter the maximum number of tags per post: ');
    return { minTags, maxTags };
  } finally {
    rl.close();
  }
}

async function assignTagsToPosts(minTags: number, maxTags: number) {
  console.log(`Starting to assign ${minTags}-${maxTags} tags to each post...`);
  
  const db = getDbConnection();
  
  // Get all posts and tags
  const posts = await db.select().from(postTable);
  const tags = await db.select().from(tagTable);
  
  if (posts.length === 0) {
    console.log('No posts found. Please run seed:posts first.');
    return;
  }
  
  if (tags.length === 0) {
    console.log('No tags found. Please run seed:tags first.');
    return;
  }
  
  console.log(`Found ${posts.length} posts and ${tags.length} tags.`);
  
  // Clear existing post-tag relationships to avoid duplicates
  await db.delete(postTagTable);
  
  // Create post-tag relationships
  const postTagRelations = [];
  
  for (const post of posts) {
    // Determine how many tags to assign to this post
    const tagCount = Math.floor(Math.random() * (maxTags - minTags + 1)) + minTags;
    
    // Get random tags for this post
    const shuffledTags = [...tags].sort(() => 0.5 - Math.random());
    const selectedTags = shuffledTags.slice(0, Math.min(tagCount, tags.length));
    
    for (const tag of selectedTags) {
      postTagRelations.push({
        postId: post.id,
        tagId: tag.id
      });
    }
  }
  
  if (postTagRelations.length > 0) {
    await db.insert(postTagTable).values(postTagRelations);
    console.log(`Successfully assigned ${postTagRelations.length} tags to posts.`);
  } else {
    console.log('No tag assignments were created.');
  }
  
  // Count tags per post for verification
  const postTagCounts = await db
    .select({
      postId: postTagTable.postId,
      tagCount: sql<number>`count(${postTagTable.tagId})`
    })
    .from(postTagTable)
    .groupBy(postTagTable.postId);
  
  console.log(`Posts with tags: ${postTagCounts.length}`);
  
  return { assignedRelations: postTagRelations.length, postsWithTags: postTagCounts.length };
}

executeSeed(async () => {
  const { minTags, maxTags } = await getInput();
  return assignTagsToPosts(minTags, maxTags);
});

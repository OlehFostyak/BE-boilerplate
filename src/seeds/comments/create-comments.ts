import { fakerEN as faker } from '@faker-js/faker';
import { createReadlineInterface, getNumberInput, question, getDbConnection, executeSeed } from '../seed-utils';
import { commentTable } from 'src/services/drizzle/schema';

interface CommentSeedInput {
  postId: string;
  numberOfComments: number;
}

async function getInput(): Promise<CommentSeedInput> {
  const rl = createReadlineInterface();
  try {
    const postId = await question(rl, 'Enter the post ID: ');
    if (!postId) {
      throw new Error('Post ID is required');
    }

    const numberOfComments = await getNumberInput(rl, 'Enter the number of comments to create: ');
    return { postId, numberOfComments };
  } finally {
    rl.close();
  }
}

async function createComments(postId: string, numberOfComments: number) {
  console.log(`Starting to create ${numberOfComments} comments for post ${postId}...`);

  const db = getDbConnection();
  const commentsData = Array.from({ length: numberOfComments }, () => ({
    text: faker.hacker.phrase(),
    postId
  }));

  const comments = await db.insert(commentTable).values(commentsData);
  console.log(`Successfully created ${numberOfComments} comments in a single query!`);

  return comments;
}

executeSeed(async () => {
  const { postId, numberOfComments } = await getInput();
  return createComments(postId, numberOfComments);
});

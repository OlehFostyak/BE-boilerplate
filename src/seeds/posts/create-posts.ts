import { fakerEN as faker } from '@faker-js/faker';
import { createReadlineInterface, getNumberInput, getDbConnection, executeSeed } from '../seed-utils';
import { postTable } from 'src/services/drizzle/schema';

async function getInput(): Promise<number> {
  const rl = createReadlineInterface();

  try {
    const count = await getNumberInput(rl, 'Enter the number of posts to create: ');
    return count;
  } finally {
    rl.close();
  }
}

async function createPosts(numberOfPosts: number) {
  console.log(`Starting to create ${numberOfPosts} posts...`);
  
  const db = getDbConnection();
  const postsData = Array.from({ length: numberOfPosts }, () => ({
    title: faker.company.catchPhrase(),
    description: faker.commerce.productDescription()
  }));

  const posts = await db.insert(postTable).values(postsData);
  console.log(`Successfully created ${numberOfPosts} posts in a single query!`);

  return posts;
}

executeSeed(async () => {
  const numberOfPosts = await getInput();
  return createPosts(numberOfPosts);
});

import { fakerEN as faker } from '@faker-js/faker';
import axios from 'axios';
import { API_URL, createReadlineInterface, getNumberInput } from '../seed-utils';

async function getPostInput(): Promise<number> {
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
  
  try {
    const posts = await Promise.all(
      Array.from({ length: numberOfPosts }, async () => {
        const postData = {
          title: faker.company.catchPhrase(),
          description: faker.commerce.productDescription()
        };

        const response = await axios.post(`${API_URL}/posts`, postData);
        return response.data;
      })
    );
    
    console.log(`Successfully created ${posts.length} posts!`);

    return posts;
  } catch (error) {
    console.error('Error creating posts:', error);
    throw error;
  }
}

// Execute the seeding
getPostInput()
  .then(async (count) => {
    await createPosts(count);
    console.log('Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });

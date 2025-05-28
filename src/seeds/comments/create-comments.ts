import { fakerEN as faker } from '@faker-js/faker';
import axios from 'axios';
import { API_URL, createReadlineInterface, getNumberInput, question } from '../seed-utils';

interface CommentSeedInput {
  postId: string;
  numberOfComments: number;
}

async function getCommentInput(): Promise<CommentSeedInput> {
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

  try {
    const comments = await Promise.all(
      Array.from({ length: numberOfComments }, async () => {
        const commentData = {
          text: faker.hacker.phrase()
        };

        const response = await axios.post(`${API_URL}/posts/${postId}/comments`, commentData);
        return response.data;
      })
    );

    console.log(`Successfully created ${comments.length} comments!`);

    return comments;
  } catch (error) {
    console.error('Error creating comments:', error);
    throw error;
  }
}

// Execute the seeding
getCommentInput()
  .then(async ({ postId, numberOfComments }) => {
    await createComments(postId, numberOfComments);
    console.log('Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });

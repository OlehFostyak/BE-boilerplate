import { fakerEN as faker } from '@faker-js/faker';
import axios from 'axios';
import 'dotenv/config';

const API_URL = `http://${process.env.HOST}:${process.env.PORT}/api`;

// Configuration
const numberOfComments = 1; // you can change this number
const postId = ''; // you'll need to set this to an existing post ID

async function createComments() {
  if (!postId) {
    throw new Error('Please set a postId before running this script');
  }

  try {
    console.log(`Starting to create ${numberOfComments} comments for post ${postId}...`);
    
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
createComments()
  .then(() => {
    console.log('Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });

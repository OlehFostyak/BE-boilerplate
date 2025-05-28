import { fakerEN as faker } from '@faker-js/faker';
import axios from 'axios';
import 'dotenv/config';

const API_URL = `http://${process.env.HOST}:${process.env.PORT}/api`;

// Configuration
const numberOfPosts = 1; // you can change this number to create different amounts of posts

async function createPosts() {
  try {
    console.log(`Starting to create ${numberOfPosts} posts...`);
    
    const posts = await Promise.all(
      Array.from({ length: numberOfPosts }, async () => {
        const postData = {
          title: faker.company.catchPhrase(),
          description: `${faker.commerce.productDescription()}\n\n${faker.company.buzzPhrase()}`
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
createPosts()
  .then(() => {
    console.log('Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });

import { fakerEN as faker } from '@faker-js/faker';
import { createReadlineInterface, getNumberInput, getDbConnection, executeSeed } from '../seed-utils';
import { tagTable } from 'src/services/drizzle/schema';

async function getInput(): Promise<number> {
  const rl = createReadlineInterface();

  try {
    const count = await getNumberInput(rl, 'Enter the number of tags to create: ');
    return count;
  } finally {
    rl.close();
  }
}

async function createTags(numberOfTags: number) {
  console.log(`Starting to create ${numberOfTags} tags...`);
  
  const db = getDbConnection();
  
  // Generate unique tag names using faker
  const tagNames = new Set<string>();
  while (tagNames.size < numberOfTags) {
    // Use various faker methods to generate diverse tag names
    const generators = [
      () => faker.word.adjective(),
      () => faker.word.noun(),
      () => faker.commerce.department(),
      () => faker.commerce.productAdjective(),
      () => faker.hacker.noun(),
      () => faker.music.genre()
    ];
    
    const randomGenerator = generators[Math.floor(Math.random() * generators.length)];
    tagNames.add(randomGenerator());
  }
  
  const tagsData = Array.from(tagNames).map(name => ({
    name,
    description: faker.lorem.sentence()
  }));

  const tags = await db.insert(tagTable).values(tagsData);
  console.log(`Successfully created ${tagsData.length} tags in a single query!`);

  return tags;
}

executeSeed(async () => {
  const numberOfTags = await getInput();
  return createTags(numberOfTags);
});

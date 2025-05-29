import 'dotenv/config';
import readline from 'readline';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { getDb } from 'src/services/drizzle/drizzle.service';

export function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

export function question(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

export async function getNumberInput(rl: readline.Interface, prompt: string): Promise<number> {
  const numberStr = await question(rl, prompt);
  const number = parseInt(numberStr, 10);
  
  if (isNaN(number) || number < 1) {
    throw new Error('Please enter a valid number greater than 0');
  }
  
  return number;
}

export function getDbConnection(): NodePgDatabase {
  return getDb({
    port: parseInt(process.env.PGPORT!),
    host: process.env.PGHOST!,
    pwd: process.env.PGPASSWORD!,
    user: process.env.PGUSERNAME!,
    db: process.env.PGDATABASE!,
    logsEnabled: true
  });
}

export async function executeSeed<T>(seedFn: () => Promise<T>): Promise<void> {
  try {
    await seedFn();
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

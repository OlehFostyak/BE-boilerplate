import readline from 'readline';
import 'dotenv/config';

export const API_URL = `http://${process.env.HOST}:${process.env.PORT}/api`;

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

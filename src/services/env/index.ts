import 'dotenv/config';
import { EnvSchema, Env } from '../../types/EnvSchema';

// Parse and validate environment variables
const parsedEnv = EnvSchema.parse(process.env);

// Export the validated environment variables
export const env: Env = parsedEnv;

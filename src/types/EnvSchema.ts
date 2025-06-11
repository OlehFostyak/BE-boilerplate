import { z } from 'zod';

// DONT USE transform here
// because we are not overwriting process.env
export const EnvSchema = z.object({
  TZ: z.string().optional(),
  NODE_ENV: z.enum(['local', 'staging', 'production']),
  PORT: z.string(),
  HOST: z.string(),
  PGHOST: z.string(),
  PGPORT: z.string(),
  PGUSERNAME: z.string(),
  PGPASSWORD: z.string(),
  PGDATABASE: z.string(),
  SWAGGER_USER: z.string(),
  SWAGGER_PWD: z.string().min(10),
  
  // AWS Configuration
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  
  // AWS Cognito Configuration
  AWS_COGNITO_USER_POOL_ID: z.string(),
  AWS_COGNITO_CLIENT_ID: z.string()
});

export type Env = z.infer<typeof EnvSchema>;
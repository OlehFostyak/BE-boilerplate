/**
 * KMS client configuration
 */
import { KMSClient } from '@aws-sdk/client-kms';

// Environment variables for KMS configuration
const kmsConfig = {
  region: process.env.AWS_REGION,
  keyId: process.env.AWS_KMS_KEY_ID
};

// Create KMS client instance
export const kmsClient = new KMSClient({
  region: kmsConfig.region
});

export { kmsConfig };

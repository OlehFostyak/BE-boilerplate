/**
 * KMS signature generation and verification
 */
import { GenerateMacCommand, VerifyMacCommand, MacAlgorithmSpec } from '@aws-sdk/client-kms';
import { kmsClient, kmsConfig } from './client';
import crypto from 'crypto';

/**
 * Interface for data to be signed
 */
export interface SignatureData {
  email: string;
  expireAt?: string; // Optional ISO date string
}

/**
 * Generate HMAC signature for invite data
 * @param data Data to sign
 * @returns Base64 encoded signature
 */
export async function generateSignature(email: string): Promise<{ signature: string; expireAt: string }> {
  try {
    // Generate expiration date if not provided (24 hours from now)
    const expireAt = (() => {
      const date = new Date();
      date.setHours(date.getHours() + 24); // Expire in 24 hours
      return date.toISOString();
    })();
    
    // Create string to sign (email + expireAt)
    const message = `${email}:${expireAt}`;
    
    console.log('message', message);
    console.log('kmsConfig', kmsConfig);
    
    // Check if KMS key ID is available
    if (!kmsConfig.keyId) {
      console.warn('AWS_KMS_KEY_ID not set, using fallback local HMAC');
      // Use local crypto for development/testing
      const hmac = crypto.createHmac('sha256', 'dev-secret-key');
      hmac.update(message);
      const signature = hmac.digest('base64');
      return { signature, expireAt };
    }
    
    // Convert message to Uint8Array
    const messageBytes = new TextEncoder().encode(message);
    
    // Generate MAC using KMS
    const command = new GenerateMacCommand({
      KeyId: kmsConfig.keyId,
      Message: messageBytes,
      MacAlgorithm: MacAlgorithmSpec.HMAC_SHA_512
    });

    console.log('command', command);
    
    const response = await kmsClient.send(command);

    console.log('response', response);
    
    if (!response.Mac) {
      throw new Error('Failed to generate signature: No MAC returned');
    }
    
    // Convert MAC to Base64 string
    const signature = Buffer.from(response.Mac).toString('base64');
    return { signature, expireAt };
  } catch (error) {
    console.error('Error generating signature:', error);
    throw new Error('Failed to generate signature');
  }
}

/**
 * Verify HMAC signature for invite data
 * @param data Data that was signed
 * @param signature Base64 encoded signature to verify
 * @returns Boolean indicating if signature is valid
 */
export async function verifySignature(data: SignatureData, signature: string): Promise<boolean> {
  try {
    // Create string that was signed (email + expireAt)
    const message = `${data.email}:${data.expireAt}`;
    
    // Check if KMS key ID is available
    if (!kmsConfig.keyId) {
      console.warn('AWS_KMS_KEY_ID not set, using fallback local HMAC');
      // Use local crypto for development/testing
      const hmac = crypto.createHmac('sha256', 'dev-secret-key');
      hmac.update(message);
      const expectedSignature = hmac.digest('base64');
      return expectedSignature === signature;
    }
    
    // Convert message to Uint8Array
    const messageBytes = new TextEncoder().encode(message);
    
    // Convert signature from Base64 to Uint8Array
    const signatureBytes = Buffer.from(signature, 'base64');
    
    // Verify MAC using KMS
    const command = new VerifyMacCommand({
      KeyId: kmsConfig.keyId,
      Message: messageBytes,
      Mac: signatureBytes,
      MacAlgorithm: MacAlgorithmSpec.HMAC_SHA_512
    });
    
    const response = await kmsClient.send(command);
    
    return response.MacValid === true;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

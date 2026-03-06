import * as crypto from "crypto";

/**
 * Decrypt a password that was encrypted on the client side using AES-GCM
 * @param {string} encryptedData - Base64-encoded encrypted data (iv + encrypted password)
 * @returns {string} - Decrypted plain text password
 */
export function decryptPassword(encryptedData: string): string {
  // Get decryption key from environment variable (must match client key)
  const keyString = process.env.PASSWORD_ENCRYPTION_KEY || 'default-encryption-key-32-chars-long!!';
  
  // Convert key string to Buffer (must be 32 bytes for AES-256)
  const key = Buffer.from(keyString.padEnd(32, '0').slice(0, 32));

  // Decode base64 to get combined IV + encrypted data
  const combined = Buffer.from(encryptedData, 'base64');

  // Extract IV (first 12 bytes) and encrypted data (rest)
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

  // Get auth tag (last 16 bytes of encrypted data for GCM)
  const authTag = encrypted.slice(-16);
  const ciphertext = encrypted.slice(0, -16);

  // Set auth tag
  decipher.setAuthTag(authTag);

  // Decrypt
  let decrypted = decipher.update(ciphertext, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Check if a string is encrypted (base64 format that could be encrypted data)
 * This is a simple heuristic - encrypted data will be base64 and longer than typical passwords
 */
export function isEncryptedPassword(str: string): boolean {
  // Check if it's base64 and has reasonable length for encrypted data (at least 24 chars for IV + some data)
  try {
    const decoded = Buffer.from(str, 'base64');
    return decoded.length >= 24 && /^[A-Za-z0-9+/=]+$/.test(str);
  } catch {
    return false;
  }
}

import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_SECRET || 'mySuperSecretAESKey2026';

/**
 * Encrypt plain text using AES encryption
 * @param {string} text Plain text message or caption
 * @param {string} key Optional secret key override
 * @returns {string} Encrypted AES ciphertext string (starts with U2FsdGVkX1...)
 */
export const encryptMessage = (text, key = SECRET_KEY) => {
  if (!text || typeof text !== 'string') return text;
  if (text.startsWith('U2FsdGVkX1')) return text;
  try {
    const ciphertext = CryptoJS.AES.encrypt(text, key).toString();
    return ciphertext;
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
};

/**
 * Decrypt AES ciphertext back to plain text
 * @param {string} ciphertext Encrypted AES string
 * @param {string} key Optional secret key override
 * @returns {string} Decrypted plain text or original string if unencrypted/legacy
 */
export const decryptMessage = (ciphertext, key = SECRET_KEY) => {
  if (!ciphertext || typeof ciphertext !== 'string') return ciphertext;
  
  if (!ciphertext.startsWith('U2FsdGVkX1')) {
    return ciphertext;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (!originalText) {
      return ciphertext;
    }
    return originalText;
  } catch (error) {
    console.error('Decryption error:', error);
    return ciphertext;
  }
};

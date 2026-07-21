const CryptoJS = require('crypto-js');

const SECRET_KEY = process.env.ENCRYPTION_SECRET || 'mySuperSecretAESKey2026';

/**
 * Encrypt plain text using AES encryption
 * @param {string} text Plain text message or caption
 * @param {string} key Optional secret key override
 * @returns {string} Encrypted AES ciphertext string
 */
const encryptMessage = (text, key = SECRET_KEY) => {
  if (!text || typeof text !== 'string') return text;
  // If already encrypted, do not double-encrypt
  if (text.startsWith('U2FsdGVkX1')) return text;
  try {
    return CryptoJS.AES.encrypt(text, key).toString();
  } catch (error) {
    console.error('Backend encryption error:', error);
    return text;
  }
};

/**
 * Decrypt AES ciphertext back to plain text
 * @param {string} ciphertext Encrypted AES string
 * @param {string} key Optional secret key override
 * @returns {string} Decrypted plain text or original string if unencrypted/legacy
 */
const decryptMessage = (ciphertext, key = SECRET_KEY) => {
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
    console.error('Backend decryption error:', error);
    return ciphertext;
  }
};

module.exports = {
  encryptMessage,
  decryptMessage
};

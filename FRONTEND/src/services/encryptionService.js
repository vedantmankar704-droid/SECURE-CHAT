// ArrayBuffer to Base64 (safely avoiding stack overflow)
export const bufferToBase64 = (buf) => {
  const bytes = new Uint8Array(buf);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Base64 to ArrayBuffer
export const base64ToBuffer = (str) => {
  const binary = atob(str);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Generate RSA-OAEP 2048-bit Key Pair for key exchange
export const generateRSAKeyPair = async () => {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );
    return keyPair;
  } catch (err) {
    console.error('Failed to generate RSA key pair:', err);
    throw err;
  }
};

// Export public key to Base64 SPKI string (for MongoDB)
export const exportPublicKey = async (publicKey) => {
  try {
    const exported = await window.crypto.subtle.exportKey('spki', publicKey);
    return bufferToBase64(exported);
  } catch (err) {
    console.error('Failed to export public key:', err);
    throw err;
  }
};

// Import public key from Base64 SPKI string
export const importPublicKey = async (spkiBase64) => {
  try {
    const buf = base64ToBuffer(spkiBase64);
    return await window.crypto.subtle.importKey(
      'spki',
      buf,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['encrypt']
    );
  } catch (err) {
    console.error('Failed to import public key:', err);
    throw err;
  }
};

// Export private key to JWK JSON string (stored locally on device)
export const exportPrivateKey = async (privateKey) => {
  try {
    const exported = await window.crypto.subtle.exportKey('jwk', privateKey);
    return JSON.stringify(exported);
  } catch (err) {
    console.error('Failed to export private key:', err);
    throw err;
  }
};

// Import private key from JWK JSON string
export const importPrivateKey = async (jwkJsonStr) => {
  try {
    const jwk = JSON.parse(jwkJsonStr);
    return await window.crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['decrypt']
    );
  } catch (err) {
    console.error('Failed to import private key:', err);
    throw err;
  }
};

// Generate random AES-256 session key
export const generateAESKey = async () => {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

// Encrypt plaintext using AES-256-GCM and encrypt AES key with RSA-OAEP public keys
export const encryptMessage = async (plaintext, receiverPublicKeySpki, senderPublicKeySpki) => {
  try {
    // 1. Generate AES session key and IV
    const aesKey = await generateAESKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // 2. Encrypt plaintext using AES-GCM
    const enc = new TextEncoder();
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      aesKey,
      enc.encode(plaintext)
    );

    // 3. Export raw AES key to encrypt it with RSA
    const rawAesKey = await window.crypto.subtle.exportKey('raw', aesKey);

    // 4. Encrypt raw AES key with receiver's public key
    const receiverKey = await importPublicKey(receiverPublicKeySpki);
    const encAesKeyForReceiver = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      receiverKey,
      rawAesKey
    );

    // 5. Encrypt raw AES key with sender's public key (to allow sender to decrypt own logs)
    const senderKey = await importPublicKey(senderPublicKeySpki);
    const encAesKeyForSender = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      senderKey,
      rawAesKey
    );

    return {
      encryptedMessage: bufferToBase64(encryptedData),
      encryptedAESKeyForSender: bufferToBase64(encAesKeyForSender),
      encryptedAESKeyForReceiver: bufferToBase64(encAesKeyForReceiver),
      iv: bufferToBase64(iv),
    };
  } catch (err) {
    console.error('Encryption failed:', err);
    throw err;
  }
};

// Decrypt message using private key and message payload parameters
export const decryptMessage = async (encryptedMessageBase64, ivBase64, encryptedAESKeyBase64, privateKeyJwkStr) => {
  try {
    const privateKey = await importPrivateKey(privateKeyJwkStr);
    
    // 1. Decrypt raw AES session key using RSA private key
    const encAesBuf = base64ToBuffer(encryptedAESKeyBase64);
    const rawAesKey = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      encAesBuf
    );

    // 2. Import raw AES key back to AES-GCM CryptoKey
    const aesKey = await window.crypto.subtle.importKey(
      'raw',
      rawAesKey,
      'AES-GCM',
      true,
      ['decrypt']
    );

    // 3. Decrypt ciphertext using AES key and IV
    const cipherBuf = base64ToBuffer(encryptedMessageBase64);
    const ivBuf = base64ToBuffer(ivBase64);
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuf,
      },
      aesKey,
      cipherBuf
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedData);
  } catch (err) {
    console.error('Decryption failed:', err);
    throw err;
  }
};

// Encrypt binary files (ArrayBuffer) using specific AES session key and IV
export const encryptFile = async (arrayBuffer, aesKeyRawBase64, ivBase64) => {
  try {
    const rawKey = base64ToBuffer(aesKeyRawBase64);
    const aesKey = await window.crypto.subtle.importKey(
      'raw',
      rawKey,
      'AES-GCM',
      true,
      ['encrypt']
    );
    const iv = base64ToBuffer(ivBase64);
    
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      aesKey,
      arrayBuffer
    );
    return encrypted;
  } catch (err) {
    console.error('File encryption failed:', err);
    throw err;
  }
};

// Decrypt binary files (ArrayBuffer) using specific AES session key and IV
export const decryptFile = async (arrayBuffer, aesKeyRawBase64, ivBase64) => {
  try {
    const rawKey = base64ToBuffer(aesKeyRawBase64);
    const aesKey = await window.crypto.subtle.importKey(
      'raw',
      rawKey,
      'AES-GCM',
      true,
      ['decrypt']
    );
    const iv = base64ToBuffer(ivBase64);
    
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      aesKey,
      arrayBuffer
    );
    return decrypted;
  } catch (err) {
    console.error('File decryption failed:', err);
    throw err;
  }
};

// Initialize E2EE Keys for a user on their browser device
export const initializeUserKeys = async (userId) => {
  const pubKeyKey = `e2ee_pub_${userId}`;
  const privKeyKey = `e2ee_priv_${userId}`;
  
  let pubKeyStr = localStorage.getItem(pubKeyKey);
  let privKeyStr = localStorage.getItem(privKeyKey);
  
  if (!pubKeyStr || !privKeyStr) {
    console.log('Generating new E2EE RSA keypair for user:', userId);
    const pair = await generateRSAKeyPair();
    pubKeyStr = await exportPublicKey(pair.publicKey);
    privKeyStr = await exportPrivateKey(pair.privateKey);
    
    localStorage.setItem(pubKeyKey, pubKeyStr);
    localStorage.setItem(privKeyKey, privKeyStr);
  }
  
  return { publicKey: pubKeyStr, privateKey: privKeyStr };
};

// Encruct message body and file metadata together under a single AES session key
export const encryptMessagePayload = async (plaintext, fileMetadataObj, receiverPubKeySpki, senderPubKeySpki) => {
  try {
    const aesKey = await generateAESKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();

    // Encrypt content
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      aesKey,
      enc.encode(plaintext || "")
    );

    // Encrypt file metadata if present
    let encryptedFileStr = "";
    if (fileMetadataObj) {
      const fileJson = JSON.stringify(fileMetadataObj);
      const encryptedFileData = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        aesKey,
        enc.encode(fileJson)
      );
      encryptedFileStr = bufferToBase64(encryptedFileData);
    }

    // Export raw key and encrypt for sender and receiver
    const rawAesKey = await window.crypto.subtle.exportKey('raw', aesKey);
    const receiverKey = await importPublicKey(receiverPubKeySpki);
    const encAesKeyForReceiver = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      receiverKey,
      rawAesKey
    );

    const senderKey = await importPublicKey(senderPubKeySpki);
    const encAesKeyForSender = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      senderKey,
      rawAesKey
    );

    return {
      encryptedMessage: bufferToBase64(encryptedData),
      encryptedFileUrl: encryptedFileStr,
      encryptedAESKeyForSender: bufferToBase64(encAesKeyForSender),
      encryptedAESKeyForReceiver: bufferToBase64(encAesKeyForReceiver),
      iv: bufferToBase64(iv),
    };
  } catch (err) {
    console.error('Payload encryption failed:', err);
    throw err;
  }
};

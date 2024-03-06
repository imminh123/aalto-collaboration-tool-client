export async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
    {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: {name: "SHA-256"},
    },
    true, // Whether the key is extractable
    ["encrypt", "decrypt"] // Key can be used to encrypt and decrypt data
    );

    return keyPair;
}
  
export async function exportPublicKey(key: CryptoKeyPair) {
    const exported = await window.crypto.subtle.exportKey(
    "spki", // Subject Public Key Info format
    key.publicKey
    );
    const exportedAsString =  arrayBufferToBase64(exported);
    const exportedAsPem = `-----BEGIN PUBLIC KEY-----\n${exportedAsString}\n-----END PUBLIC KEY-----`;
    return exportedAsPem;
}

export async function exportPrivateKey(cryptoKey: CryptoKeyPair) {
  // Export the key in PKCS#8 format
  const exported = await window.crypto.subtle.exportKey(
    "pkcs8",
    cryptoKey.privateKey
  );

  // Convert the exported ArrayBuffer to a Base64-encoded string
  const exportedAsBase64 = arrayBufferToBase64(exported);

  // Format the Base64-encoded string in PEM format
  const pemExported = `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;

  return pemExported;
}
  
function arrayBufferToBase64(buffer: ArrayBufferLike) {
    // @ts-ignore
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export async function encryptDataForSender(data: string, publicCryptoKey: CryptoKey) {
  console.log(publicCryptoKey);
  // Encode the string to a Uint8Array
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  // Encrypt the data
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicCryptoKey, // The public key from the RSA-OAEP key pair
    encodedData // The data to encrypt as an ArrayBuffer
  );

  // Convert the encrypted data to base64 to make it easier to transmit
  return arrayBufferToBase64(encryptedData);
}

export async function importPrivateKey(privateKey: string) {
  // Fetch the part of the PEM string between header and footer
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKey.substring(pemHeader.length, privateKey.length - pemFooter.length).trim();

  // Base64 decode the string to get the binary data
  const binaryDerString = window.atob(pemContents);

  // Convert the binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString);

  // Import the key
  return await window.crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true, // whether the key is extractable (i.e., can be used in exportKey)
    ["decrypt"] // use "decrypt" for private key
  );
}

export async function encryptData(data: string, publicKey: string) {
  const publicCryptoKey = await importPublicKey(publicKey);
  // Encode the string to a Uint8Array
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  // Encrypt the data
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicCryptoKey, // The public key from the RSA-OAEP key pair
    encodedData // The data to encrypt as an ArrayBuffer
  );

  // Convert the encrypted data to base64 to make it easier to transmit
  return arrayBufferToBase64(encryptedData);
}

export async function importPublicKey(publicKey: string) {
  // Fetch the part of the PEM string between header and footer
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = publicKey.substring(pemHeader.length, publicKey.length - pemFooter.length).trim();
  
  // Base64 decode the string to get the binary data
  const binaryDerString = window.atob(pemContents);
  
  // Convert the binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString);

  // Import the key
  return await window.crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}

function str2ab(stringData: string) {
  const buffer = new ArrayBuffer(stringData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < stringData.length; i++) {
    view[i] = stringData.charCodeAt(i);
  }
  return buffer;
}
  
export  async function decryptData(encryptedData: string, privateKey: string) {
    const privateCryptoKey = await importPrivateKey(privateKey);
    const encryptedArrayBuffer = base64ToArrayBuffer(encryptedData);
  
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateCryptoKey,
      encryptedArrayBuffer
    );
  
    return new TextDecoder().decode(decryptedData);
  }
  
  function base64ToArrayBuffer(base64: string) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }


// export  async function encryptMessage(message: string, secretKey: CryptoKey) {
//     const encodedMessage = new TextEncoder().encode(message);
//     // Assuming secretKey is imported and usable here
//     const encryptedContent = await window.crypto.subtle.encrypt(
//       {
//         name: "AES-GCM",
//         iv: window.crypto.getRandomValues(new Uint8Array(12)), // Initialization vector
//       },
//       secretKey,
//       encodedMessage
//     );
//     return encryptedContent;
//   }
  
// export  async function decryptMessage(encryptedContent: BufferSource, secretKey: CryptoKey) {
//     const decryptedContent = await window.crypto.subtle.decrypt(
//       {
//         name: "AES-GCM",
//         iv: window.crypto.getRandomValues(new Uint8Array(12)), // The same IV as used in encryption
//       },
//       secretKey,
//       encryptedContent
//     );
//     const decodedMessage = new TextDecoder().decode(decryptedContent);
//     return decodedMessage;
//   }
  
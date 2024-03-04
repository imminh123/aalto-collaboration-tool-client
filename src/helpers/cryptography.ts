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
  
export async function exportPublicKey(key: any) {
    const exported = await window.crypto.subtle.exportKey(
    "spki", // Subject Public Key Info format
    key.publicKey
    );
    const exportedAsString =  arrayBufferToBase64(exported);
    const exportedAsPem = `-----BEGIN PUBLIC KEY-----\n${exportedAsString}\n-----END PUBLIC KEY-----`;
    return exportedAsPem;
}
  
function arrayBufferToBase64(buffer: ArrayBufferLike) {
    // @ts-ignore
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
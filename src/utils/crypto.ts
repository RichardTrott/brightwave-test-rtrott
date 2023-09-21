const encode = (input: string) => {
  let enc = new TextEncoder();
  return enc.encode(input);
}

const DELIM = ".";
const STORAGE_KEY = "encApiKey";

const generateKeyMaterial = (passphrase: string) => {
  let enc = new TextEncoder();
  return window.crypto.subtle.importKey(
    "raw", 
    enc.encode(passphrase), 
    {name: "PBKDF2"}, 
    false, 
    ["deriveBits", "deriveKey"]
  );
}

const generateKey = (keyMaterial: CryptoKey, salt: ArrayBuffer) => {
  return window.crypto.subtle.deriveKey(
    {
      "name": "PBKDF2",
      salt: salt, 
      "iterations": 100000,
      "hash": "SHA-256"
    },
    keyMaterial,
    { "name": "AES-GCM", "length": 256},
    true,
    [ "encrypt", "decrypt" ]
  );
}

export const hasSecret = () => {
  return !!localStorage.getItem(STORAGE_KEY);
}

export const clearSecret = () => {
  localStorage.removeItem(STORAGE_KEY);
}

export const storeSecret = async (secret: string, passphrase: string) => {
  // FIXME error handling, polyfill?
  let keyMaterial = await generateKeyMaterial(passphrase);
  let salt = window.crypto.getRandomValues(new Uint8Array(16));
  let key = await generateKey(keyMaterial, salt);
  let iv = window.crypto.getRandomValues(new Uint8Array(12));
  let encodedSecret = encode(secret);

  const cipherText = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    encodedSecret
  );
  
  let cipherBuffer = new Uint8Array(cipherText);

  localStorage.setItem(STORAGE_KEY, [salt, cipherBuffer, iv].join(DELIM));
}

export const retrieveSecret = async (passphrase: string) => {
  const encryptedKey = localStorage.getItem(STORAGE_KEY);

  if (!encryptedKey) return;
  
  // Split and convert to Uint8Arrays
  const [salt, cipherText, iv] : Array<Uint8Array> = encryptedKey
    .split(DELIM)
    .map((v: string) => new Uint8Array(v.split(',').map((n: string) => parseInt(n, 10))));

  let keyMaterial = await generateKeyMaterial(passphrase);
  let key = await generateKey(keyMaterial, salt);
  let decrypted;

  try {
    decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      cipherText
    );
  } catch (e) {
    console.error(e)
  }
  
  return new TextDecoder().decode(decrypted);
}
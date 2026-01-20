// utils/crypto.js
const crypto = require("crypto");

// ==============================
// KONFIGURASI AES-256
// ==============================
const ALGORITHM = "aes-256-cbc";

// key harus 32 byte
const SECRET_KEY = crypto
  .createHash("sha256")
  .update(process.env.AES_SECRET_KEY)
  .digest();

// iv selalu 16 byte
const IV_LENGTH = 16;

// ==============================
// ENCRYPT
// ==============================
function encrypt(text) {
  if (!text) return text;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

// ==============================
// DECRYPT
// ==============================
function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText;

  try {
    const [ivHex, encrypted] = encryptedText.split(":");
    if (!ivHex || !encrypted) return encryptedText;

    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    // fallback aman (jika data lama belum terenkripsi)
    return encryptedText;
  }
}

module.exports = {
  encrypt,
  decrypt,
};

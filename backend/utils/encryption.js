import crypto from "crypto";
import fs from "fs";

function deriveKey(signature) {
  return crypto
    .createHash("sha256")
    .update(signature)
    .digest(); 
}

export async function encryptFileStream(
  inputPath,
  outputPath,
  signature
) {
  const key = deriveKey(signature);
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    key,
    iv
  );

  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    input
      .pipe(cipher)
      .pipe(output)
      .on("finish", () => {
        const tag = cipher.getAuthTag();
        resolve({
          iv: iv.toString("hex"),
          tag: tag.toString("hex"),
        });
      })
      .on("error", reject);
  });
}

export async function decryptFileStream(
  encryptedPath,
  outputPath,
  signature,
  ivHex,
  tagHex
) {
  const key = deriveKey(signature);

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(encryptedPath);
    const output = fs.createWriteStream(outputPath);

    input
      .pipe(decipher)
      .pipe(output)
      .on("finish", resolve)
      .on("error", reject);
  });
}

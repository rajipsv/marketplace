import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// AES-256-GCM for sensitive fields (coach bank account, UPI ID, PAN).
// Format: "v1:<iv>:<auth tag>:<ciphertext>" (base64 parts). The key never touches the database.

function key() {
  const raw = process.env.PAYOUT_ENCRYPTION_KEY;
  const k = raw ? Buffer.from(raw, "base64") : null;
  if (!k || k.length !== 32) throw new Error("PAYOUT_ENCRYPTION_KEY is missing or not 32 bytes (base64)");
  return k;
}

export const encryptionConfigured = () => {
  try {
    key();
    return true;
  } catch {
    return false;
  }
};

export function encrypt(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64"), cipher.getAuthTag().toString("base64"), ct.toString("base64")].join(":");
}

export function decrypt(blob: string) {
  const [v, iv, tag, ct] = blob.split(":");
  if (v !== "v1" || !iv || !tag || !ct) throw new Error("Unrecognised encrypted value");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(ct, "base64")), decipher.final()]).toString("utf8");
}

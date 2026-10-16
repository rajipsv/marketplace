import "server-only";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2 is S3-compatible. Credentials come from an R2 API token
// scoped to a single bucket with Object Read & Write.
function config() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    throw new Error("Cloudflare R2 is not configured — set R2_* variables in .env");
  }
  return { accountId: R2_ACCOUNT_ID, accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, bucket: R2_BUCKET };
}

let client: S3Client | undefined;
function r2() {
  const c = config();
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${c.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey },
  });
  return { client, bucket: c.bucket };
}

export const r2Configured = () =>
  Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET);

/** Short-lived URL the browser PUTs the file to directly (no upload through our server). */
// ContentLength is signed, so R2 rejects an upload whose size differs from what was declared.
export async function presignUpload(key: string, contentType: string, contentLength: number, expiresIn = 300) {
  const { client, bucket } = r2();
  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType, ContentLength: contentLength }),
    { expiresIn },
  );
}

/** Short-lived URL to read a private object (ID documents, recordings). */
export async function presignDownload(key: string, expiresIn = 300) {
  const { client, bucket } = r2();
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn });
}

export async function deleteObject(key: string) {
  const { client, bucket } = r2();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/** Public URL for objects under public/ (coach photos), served via custom domain or r2.dev. */
export function publicUrl(key: string) {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  return base ? `${base}/${key}` : null;
}

import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { db } from "@lab/database";

function encryptionKey() {
  const secret = process.env.MEDIA_TOKEN_ENCRYPTION_KEY;
  if (!secret) throw new Error("MEDIA_TOKEN_ENCRYPTION_KEY_MISSING");
  return createHash("sha256").update(secret).digest();
}

export function encryptToken(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
}

function decryptToken(value: string) {
  const [iv, tag, encrypted] = value.split(".").map((part) => Buffer.from(part, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export async function getDriveAccessToken(workspaceId: string) {
  const connection = await db.storageConnection.findUnique({ where: { workspaceId_provider: { workspaceId, provider: "GOOGLE_DRIVE" } } });
  if (!connection?.encryptedAccessToken || connection.status !== "CONNECTED") throw new Error("GOOGLE_DRIVE_NOT_CONNECTED");
  if (!connection.accessTokenExpiresAt || connection.accessTokenExpiresAt.getTime() > Date.now() + 60_000) return decryptToken(connection.encryptedAccessToken);
  if (!connection.encryptedRefreshToken) throw new Error("GOOGLE_DRIVE_REFRESH_TOKEN_MISSING");
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: process.env.GOOGLE_DRIVE_CLIENT_ID ?? "", client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET ?? "", refresh_token: decryptToken(connection.encryptedRefreshToken), grant_type: "refresh_token" }) });
  const tokens = await response.json() as { access_token?: string; expires_in?: number };
  if (!response.ok || !tokens.access_token) throw new Error("GOOGLE_DRIVE_TOKEN_REFRESH_FAILED");
  await db.storageConnection.update({ where: { id: connection.id }, data: { encryptedAccessToken: encryptToken(tokens.access_token), accessTokenExpiresAt: new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000) } });
  return tokens.access_token;
}

export async function uploadToDrive(workspaceId: string, file: File) {
  const connection = await db.storageConnection.findUnique({ where: { workspaceId_provider: { workspaceId, provider: "GOOGLE_DRIVE" } } });
  const token = await getDriveAccessToken(workspaceId);
  const boundary = `lab-${crypto.randomUUID()}`;
  const metadata = { name: file.name, ...(connection?.rootFolderId ? { parents: [connection.rootFolderId] } : {}), appProperties: { labWorkspaceId: workspaceId } };
  const prefix = Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`);
  const suffix = Buffer.from(`\r\n--${boundary}--`);
  const body = Buffer.concat([prefix, Buffer.from(await file.arrayBuffer()), suffix]);
  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": `multipart/related; boundary=${boundary}` }, body });
  const result = await response.json() as { id?: string };
  if (!response.ok || !result.id) throw new Error("GOOGLE_DRIVE_UPLOAD_FAILED");
  return result.id;
}

export async function downloadFromDrive(workspaceId: string, fileId: string) {
  const token = await getDriveAccessToken(workspaceId);
  return fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`, { headers: { authorization: `Bearer ${token}` } });
}

import "server-only";

import { createReadStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";
import { db } from "@lab/database";
import { requireSession } from "@/server/auth/session";
import type { LabSession } from "@/server/auth/session";

function mediaRoot() {
  return process.env.MEDIA_STORAGE_PATH ?? path.resolve(process.cwd(), "../../.data/media");
}

export async function getMediaContext(allowedRoles?: Array<LabSession["role"]>) {
  const session = await requireSession(allowedRoles);
  const [workspace, user] = await Promise.all([
    db.workspace.findUnique({ where: { slug: session.workspaceId } }),
    db.user.findFirst({ where: { OR: [{ id: session.userId }, { email: session.user.email }] } }),
  ]);
  if (!workspace || !user) throw new Error("MEDIA_CONTEXT_NOT_FOUND");
  return { session, workspace, user };
}

export function mediaAssetUrl(id: string) {
  return `/api/media/assets/${id}/content`;
}

export async function storeLocalImage(buffer: Buffer, extension: string) {
  const folder = mediaRoot();
  await mkdir(folder, { recursive: true });
  const storageKey = `${crypto.randomUUID()}.${extension}`;
  await writeFile(path.join(folder, storageKey), buffer);
  return storageKey;
}

export function openLocalImage(storageKey: string) {
  const fullPath = path.resolve(mediaRoot(), storageKey);
  if (!fullPath.startsWith(path.resolve(mediaRoot()) + path.sep)) throw new Error("INVALID_STORAGE_KEY");
  return Readable.toWeb(createReadStream(fullPath)) as ReadableStream;
}

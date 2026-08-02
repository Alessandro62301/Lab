import { NextResponse } from "next/server";
import { db } from "@lab/database";
import { getMediaContext } from "@/features/media/server";

export async function GET() {
  const { workspace } = await getMediaContext();
  const connection = await db.storageConnection.findUnique({ where: { workspaceId_provider: { workspaceId: workspace.id, provider: "GOOGLE_DRIVE" } }, select: { status: true, accountLabel: true, rootFolderId: true } });
  return NextResponse.json({ data: { configured: Boolean(process.env.GOOGLE_DRIVE_CLIENT_ID && process.env.GOOGLE_DRIVE_CLIENT_SECRET && process.env.MEDIA_TOKEN_ENCRYPTION_KEY), connected: connection?.status === "CONNECTED", accountLabel: connection?.accountLabel ?? null, rootFolderId: connection?.rootFolderId ?? null }, error: null });
}

import { NextResponse } from "next/server";
import { db } from "@lab/database";
import { getMediaContext, openLocalImage } from "@/features/media/server";
import { downloadFromDrive } from "@/features/media/google-drive";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { workspace } = await getMediaContext();
  const asset = await db.mediaAsset.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!asset || asset.archivedAt) return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 });
  if (asset.provider === "GOOGLE_DRIVE" && asset.providerFileId) {
    try {
      const remote = await downloadFromDrive(asset.workspaceId, asset.providerFileId);
      if (!remote.ok || !remote.body) throw new Error("DRIVE_DOWNLOAD_FAILED");
      return new Response(remote.body, { headers: { "content-type": asset.mimeType, "cache-control": "public, max-age=3600" } });
    } catch {
      return NextResponse.json({ error: "Imagem indisponível no Google Drive." }, { status: 502 });
    }
  }
  try {
    return new Response(openLocalImage(asset.storageKey), { headers: { "content-type": asset.mimeType, "cache-control": "public, max-age=31536000, immutable" } });
  } catch {
    return NextResponse.json({ error: "Arquivo indisponível." }, { status: 404 });
  }
}

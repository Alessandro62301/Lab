import { NextResponse } from "next/server";
import { db } from "@lab/database";
import { getMediaContext, mediaAssetUrl, storeLocalImage } from "@/features/media/server";
import { MAX_IMAGE_BYTES, supportedImageTypes } from "@/features/media/schema";
import { uploadToDrive } from "@/features/media/google-drive";

export async function GET() {
  try {
    const { workspace } = await getMediaContext();
    const assets = await db.mediaAsset.findMany({
      where: { workspaceId: workspace.id, archivedAt: null },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ data: assets.map((asset) => ({ ...asset, size: Number(asset.size), createdAt: asset.createdAt.toISOString(), updatedAt: asset.updatedAt.toISOString(), url: mediaAssetUrl(asset.id) })), error: null });
  } catch {
    return NextResponse.json({ data: null, error: { code: "MEDIA_LIST_FAILED", message: "Não foi possível carregar a galeria." } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { workspace, user } = await getMediaContext(["OWNER", "ADMIN", "MEMBER"]);
    const body = await request.formData();
    const file = body.get("file");
    if (!(file instanceof File)) return NextResponse.json({ data: null, error: { code: "FILE_REQUIRED", message: "Selecione uma imagem." } }, { status: 400 });
    if (!supportedImageTypes.includes(file.type as (typeof supportedImageTypes)[number]) || file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ data: null, error: { code: "INVALID_IMAGE", message: "Use JPG, PNG ou WebP com até 10 MB." } }, { status: 400 });
    }
    const extension = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
    const useDrive = process.env.MEDIA_STORAGE_PROVIDER === "google-drive";
    const providerFileId = useDrive ? await uploadToDrive(workspace.id, file) : null;
    const storageKey = providerFileId ?? await storeLocalImage(Buffer.from(await file.arrayBuffer()), extension);
    const width = Number(body.get("width")) || null;
    const height = Number(body.get("height")) || null;
    const asset = await db.mediaAsset.create({ data: { workspaceId: workspace.id, uploadedById: user.id, provider: useDrive ? "GOOGLE_DRIVE" : "LOCAL", providerFileId, storageKey, name: file.name, mimeType: file.type, size: file.size, width, height } });
    return NextResponse.json({ data: { ...asset, createdAt: asset.createdAt.toISOString(), updatedAt: asset.updatedAt.toISOString(), url: mediaAssetUrl(asset.id) }, error: null }, { status: 201 });
  } catch {
    return NextResponse.json({ data: null, error: { code: "MEDIA_UPLOAD_FAILED", message: "Não foi possível enviar a imagem." } }, { status: 500 });
  }
}

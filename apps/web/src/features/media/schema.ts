import { z } from "zod";

export const supportedImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const mediaTransformSchema = z.object({
  width: z.number().int().min(240).max(2400),
  height: z.number().int().min(240).max(2400),
  quality: z.number().min(0.5).max(1),
  zoom: z.number().min(1).max(3),
  positionX: z.number().min(0).max(100),
  positionY: z.number().min(0).max(100),
});

export type MediaAssetDto = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  url: string;
  createdAt: string;
};

export function calculateCoverCrop(sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number, zoom: number, positionX: number, positionY: number) {
  const targetRatio = targetWidth / targetHeight;
  const sourceRatio = sourceWidth / sourceHeight;
  const baseWidth = sourceRatio > targetRatio ? sourceHeight * targetRatio : sourceWidth;
  const baseHeight = sourceRatio > targetRatio ? sourceHeight : sourceWidth / targetRatio;
  const cropWidth = baseWidth / zoom;
  const cropHeight = baseHeight / zoom;
  return { sx: (sourceWidth - cropWidth) * (positionX / 100), sy: (sourceHeight - cropHeight) * (positionY / 100), sw: cropWidth, sh: cropHeight };
}

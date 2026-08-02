import { describe, expect, it } from "vitest";
import { calculateCoverCrop, mediaTransformSchema } from "./schema";

describe("media transforms", () => {
  it("creates a centered square crop from a landscape image", () => {
    expect(calculateCoverCrop(1600, 900, 800, 800, 1, 50, 50)).toEqual({ sx: 350, sy: 0, sw: 900, sh: 900 });
  });

  it("rejects oversized outputs", () => {
    expect(mediaTransformSchema.safeParse({ width: 5000, height: 800, quality: .85, zoom: 1, positionX: 50, positionY: 50 }).success).toBe(false);
  });
});

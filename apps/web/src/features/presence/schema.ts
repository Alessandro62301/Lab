import { z } from "zod";

const colorSchema = z.string().regex(/^#[0-9a-f]{6}$/i, "Use uma cor hexadecimal.");
const externalUrlSchema = z.string().refine((value) => {
  if (!value) return true;
  if (/^\/api\/media\/assets\/[a-z0-9]+\/content$/i.test(value)) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
}, "Use um link http, https, mailto ou tel.");

export const presenceBlockTypeSchema = z.enum([
  "LINK",
  "FEATURE",
  "TEXT",
  "IMAGE",
  "GALLERY",
  "FORM",
]);

export const presenceBlockSchema = z.object({
  id: z.string().min(1),
  key: z.string().regex(/^[a-z0-9][a-z0-9-]*$/).max(80),
  type: presenceBlockTypeSchema,
  title: z.string().trim().min(1).max(120),
  description: z.string().max(500),
  url: externalUrlSchema,
  mediaUrl: externalUrlSchema,
  position: z.number().int().min(0),
  isVisible: z.boolean(),
  settings: z.record(z.string(), z.unknown()),
}).superRefine((block, context) => {
  if (["LINK", "FEATURE"].includes(block.type) && !block.url) {
    context.addIssue({
      code: "custom",
      path: ["url"],
      message: "Esse bloco precisa de um destino.",
    });
  }
});

export const presenceThemeSchema = z.object({
  backgroundColor: colorSchema,
  surfaceColor: colorSchema,
  textColor: colorSchema,
  accentColor: colorSchema,
  fontFamily: z.string().trim().min(1).max(80),
  fontSize: z.number().int().min(11).max(24).default(14),
  iconSize: z.number().int().min(16).max(48).default(24),
  borderRadius: z.number().int().min(0).max(40),
});

export const presencePageSchema = z.object({
  name: z.string().trim().min(3).max(80),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/).max(80),
  bio: z.string().max(300),
  avatarUrl: externalUrlSchema,
  status: z.enum(["DRAFT", "PUBLISHED", "PAUSED", "ARCHIVED"]),
  theme: presenceThemeSchema,
  blocks: z.array(presenceBlockSchema).max(60),
});

export type PresenceBlock = z.infer<typeof presenceBlockSchema>;
export type PresencePageInput = z.infer<typeof presencePageSchema>;
export type PresenceBlockType = z.infer<typeof presenceBlockTypeSchema>;

export function normalizePresenceBlocks(blocks: PresenceBlock[]) {
  return [...blocks]
    .sort((first, second) => first.position - second.position)
    .map((block, position) => ({ ...block, position }));
}

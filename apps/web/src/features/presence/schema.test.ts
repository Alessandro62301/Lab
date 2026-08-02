import { describe, expect, it } from "vitest";

import {
  normalizePresenceBlocks,
  presencePageSchema,
} from "./schema";

const validPage = {
  name: "Maria Victoria | Apple",
  slug: "maria-victoria",
  bio: "Importamos o seu sonho Apple",
  avatarUrl: "https://images.example.com/avatar.jpg",
  status: "PUBLISHED" as const,
  theme: {
    backgroundColor: "#71384f",
    surfaceColor: "#a34f76",
    textColor: "#ffffff",
    accentColor: "#b83872",
    fontFamily: "Geist Mono",
    borderRadius: 14,
  },
  blocks: [
    {
      id: "block-1",
      key: "whatsapp",
      type: "LINK" as const,
      title: "Ofertas da Mavi",
      description: "Comunidade no WhatsApp",
      url: "https://wa.me/5521999999999",
      mediaUrl: "",
      position: 7,
      isVisible: true,
      settings: {},
    },
  ],
};

describe("contrato das páginas Presença", () => {
  it("aceita uma página customizada com blocos", () => {
    const result = presencePageSchema.safeParse(validPage);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.theme.fontSize).toBe(14);
      expect(result.data.theme.iconSize).toBe(24);
    }
  });

  it("limita tamanhos para preservar a leitura e o layout", () => {
    expect(presencePageSchema.safeParse({
      ...validPage,
      theme: { ...validPage.theme, fontSize: 25, iconSize: 49 },
    }).success).toBe(false);
  });

  it("rejeita slug, cor e destino inválidos", () => {
    const result = presencePageSchema.safeParse({
      ...validPage,
      slug: "Página da Mavi",
      theme: { ...validPage.theme, backgroundColor: "vinho" },
      blocks: [{ ...validPage.blocks[0], url: "javascript:alert(1)" }],
    });

    expect(result.success).toBe(false);
  });

  it("normaliza posições sem depender dos valores enviados pelo navegador", () => {
    const blocks = normalizePresenceBlocks([
      { ...validPage.blocks[0], key: "segundo", position: 8 },
      { ...validPage.blocks[0], id: "block-2", key: "primeiro", position: 2 },
    ]);

    expect(blocks.map((block) => [block.key, block.position])).toEqual([
      ["primeiro", 0],
      ["segundo", 1],
    ]);
  });
});

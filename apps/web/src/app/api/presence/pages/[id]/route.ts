import { Prisma, db } from "@lab/database";
import { NextResponse } from "next/server";

import { normalizePresenceBlocks, presencePageSchema } from "@/features/presence/schema";
import { requireSession } from "@/server/auth/session";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const parsed = presencePageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Revise os dados da página.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const [{ id }, session] = await Promise.all([
    context.params,
    requireSession(["OWNER", "ADMIN", "MEMBER"]),
  ]);
  const workspace = await db.workspace.findUnique({ where: { slug: session.workspaceId } });
  if (!workspace) return NextResponse.json({ error: "Workspace não encontrado." }, { status: 404 });

  const existing = await db.publicPage.findFirst({
    where: { id, workspaceId: workspace.id, archivedAt: null },
    include: { blocks: true },
  });
  if (!existing) return NextResponse.json({ error: "Página não encontrada." }, { status: 404 });

  const data = parsed.data;
  const blocks = normalizePresenceBlocks(data.blocks);
  const incomingKeys = blocks.map((block) => block.key);

  try {
    await db.$transaction(async (tx) => {
      await tx.publicPage.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          bio: data.bio || null,
          avatarUrl: data.avatarUrl || null,
          status: data.status,
          themeJson: data.theme as Prisma.InputJsonValue,
          publishedAt: data.status === "PUBLISHED"
            ? existing.publishedAt ?? new Date()
            : existing.publishedAt,
        },
      });

      if (incomingKeys.length) {
        await tx.pageBlock.updateMany({
          where: { publicPageId: id, key: { notIn: incomingKeys } },
          data: { archivedAt: new Date() },
        });
      }
      await tx.pageBlock.updateMany({
        where: { publicPageId: id, archivedAt: null },
        data: { position: { increment: 10000 } },
      });

      for (const block of blocks) {
        await tx.pageBlock.upsert({
          where: { publicPageId_key: { publicPageId: id, key: block.key } },
          create: {
            publicPageId: id,
            key: block.key,
            type: block.type,
            title: block.title,
            description: block.description || null,
            url: block.url || null,
            mediaUrl: block.mediaUrl || null,
            position: block.position,
            isVisible: block.isVisible,
            settingsJson: block.settings as Prisma.InputJsonValue,
          },
          update: {
            type: block.type,
            title: block.title,
            description: block.description || null,
            url: block.url || null,
            mediaUrl: block.mediaUrl || null,
            position: block.position,
            isVisible: block.isVisible,
            settingsJson: block.settings as Prisma.InputJsonValue,
            archivedAt: null,
          },
        });
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Esse nome ou endereço público já está em uso." }, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json({ data: { id } });
}

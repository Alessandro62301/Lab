import "server-only";

import { db } from "@lab/database";

import { requireSession } from "@/server/auth/session";
import { summarizePresenceEvents } from "./metrics";
import type { PresenceBlock, PresencePageInput } from "./schema";
import { presenceThemeSchema } from "./schema";

const fallbackTheme: PresencePageInput["theme"] = {
  backgroundColor: "#71384f",
  surfaceColor: "#a34f76",
  textColor: "#ffffff",
  accentColor: "#b83872",
  fontFamily: "Geist Mono",
  fontSize: 14,
  iconSize: 24,
  borderRadius: 14,
};

function objectValue(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function serializePage(page: {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  status: string;
  themeJson: unknown;
  blocks: Array<{
    id: string;
    key: string;
    type: string;
    title: string;
    description: string | null;
    url: string | null;
    mediaUrl: string | null;
    position: number;
    isVisible: boolean;
    settingsJson: unknown;
  }>;
}) {
  const parsedTheme = presenceThemeSchema.safeParse(page.themeJson);
  return {
    id: page.id,
    name: page.name,
    slug: page.slug,
    bio: page.bio ?? "",
    avatarUrl: page.avatarUrl ?? "",
    status: page.status as PresencePageInput["status"],
    theme: parsedTheme.success ? parsedTheme.data : fallbackTheme,
    blocks: page.blocks.map((block) => ({
      id: block.id,
      key: block.key,
      type: block.type,
      title: block.title,
      description: block.description ?? "",
      url: block.url ?? "",
      mediaUrl: block.mediaUrl ?? "",
      position: block.position,
      isVisible: block.isVisible,
      settings: objectValue(block.settingsJson),
    })) as PresenceBlock[],
  };
}

async function getWorkspace() {
  const session = await requireSession();
  const workspace = await db.workspace.findUnique({
    where: { slug: session.workspaceId },
  });
  if (!workspace) throw new Error("WORKSPACE_NOT_FOUND");
  return { session, workspace };
}

export async function getPresenceDashboard() {
  const { workspace } = await getWorkspace();
  const pages = await db.publicPage.findMany({
    where: { workspaceId: workspace.id, archivedAt: null },
    include: {
      blocks: { where: { archivedAt: null }, orderBy: { position: "asc" } },
      events: {
        where: { eventName: { in: ["page_view", "link_click"] } },
        select: { eventName: true, anonymousId: true, entityId: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return pages.map((page) => ({
    ...serializePage(page),
    metrics: summarizePresenceEvents(page.events),
  }));
}

export async function getPresencePage(id: string) {
  const { workspace } = await getWorkspace();
  const page = await db.publicPage.findFirst({
    where: { id, workspaceId: workspace.id, archivedAt: null },
    include: { blocks: { where: { archivedAt: null }, orderBy: { position: "asc" } } },
  });
  return page ? serializePage(page) : null;
}

export async function getPublicPresencePage(slug: string) {
  const page = await db.publicPage.findFirst({
    where: { slug, status: "PUBLISHED", archivedAt: null },
    include: {
      blocks: {
        where: { archivedAt: null, isVisible: true },
        orderBy: { position: "asc" },
      },
    },
  });
  return page ? serializePage(page) : null;
}

export type SerializedPresencePage = NonNullable<Awaited<ReturnType<typeof getPresencePage>>>;

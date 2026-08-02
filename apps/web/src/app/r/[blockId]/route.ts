import { db } from "@lab/database";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: Promise<{ blockId: string }> }) {
  const { blockId } = await context.params;
  const block = await db.pageBlock.findFirst({
    where: {
      id: blockId,
      isVisible: true,
      archivedAt: null,
      publicPage: { status: "PUBLISHED", archivedAt: null },
    },
    include: { publicPage: true },
  });
  if (!block?.url) return NextResponse.redirect(new URL("/", request.url));

  const cookieHeader = request.headers.get("cookie") ?? "";
  const anonymousCookie = cookieHeader.match(/(?:^|; )lab_anonymous_id=([^;]+)/)?.[1];
  const anonymousId = anonymousCookie ? decodeURIComponent(anonymousCookie) : crypto.randomUUID();

  await db.analyticsEvent.create({
    data: {
      workspaceId: block.publicPage.workspaceId,
      pageId: block.publicPageId,
      moduleKey: "presence",
      entityType: "page_block",
      entityId: block.id,
      eventName: "link_click",
      anonymousId,
      path: `/p/${block.publicPage.slug}`,
      referrer: request.headers.get("referer"),
      metadataJson: { destination: block.url, blockType: block.type },
    },
  });

  const response = NextResponse.redirect(block.url);
  if (!anonymousCookie) {
    response.cookies.set("lab_anonymous_id", anonymousId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return response;
}

import { db } from "@lab/database";
import { NextResponse } from "next/server";
import { z } from "zod";

const viewSchema = z.object({ sessionId: z.string().uuid().optional() });

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const parsed = viewSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Evento inválido." }, { status: 400 });

  const { slug } = await context.params;
  const page = await db.publicPage.findFirst({
    where: { slug, status: "PUBLISHED", archivedAt: null },
  });
  if (!page) return NextResponse.json({ error: "Página indisponível." }, { status: 404 });

  const cookieHeader = request.headers.get("cookie") ?? "";
  const anonymousCookie = cookieHeader.match(/(?:^|; )lab_anonymous_id=([^;]+)/)?.[1];
  const anonymousId = anonymousCookie ? decodeURIComponent(anonymousCookie) : crypto.randomUUID();

  await db.analyticsEvent.create({
    data: {
      workspaceId: page.workspaceId,
      pageId: page.id,
      moduleKey: "presence",
      entityType: "public_page",
      entityId: page.id,
      eventName: "page_view",
      anonymousId,
      sessionId: parsed.data.sessionId,
      path: `/p/${page.slug}`,
      referrer: request.headers.get("referer"),
    },
  });

  const response = NextResponse.json({ data: { tracked: true } });
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

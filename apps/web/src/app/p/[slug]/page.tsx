import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicPresencePage } from "@/features/presence/components/public-presence-page";
import { getPublicPresencePage } from "@/features/presence/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublicPresencePage(slug);
  return page
    ? { title: page.name, description: page.bio }
    : { title: "Página não encontrada" };
}

export default async function PresencePublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublicPresencePage(slug);
  if (!page) notFound();
  return <PublicPresencePage page={page} />;
}

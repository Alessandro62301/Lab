import { notFound } from "next/navigation";

import { PresenceEditor } from "@/features/presence/components/presence-editor";
import { getPresencePage } from "@/features/presence/server";

export const metadata = { title: "Editor de presença" };

export default async function PresenceEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await getPresencePage(id);
  if (!page) notFound();
  return <PresenceEditor initialPage={page} />;
}

import { notFound } from "next/navigation";
import { FormTabs } from "@/features/forms/components/form-tabs";
import { ShareForm } from "@/features/forms/components/share-form";
import { getFormForWorkspace } from "@/features/forms/server";

export const dynamic = "force-dynamic";

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await getFormForWorkspace(id);
  if (!form) notFound();
  return <div><FormTabs formId={id} active="share" /><ShareForm slug={form.slug} isPublished={form.status === "PUBLISHED"} /></div>;
}

import { notFound } from "next/navigation";
import { FormSettings } from "@/features/forms/components/form-settings";
import { FormTabs } from "@/features/forms/components/form-tabs";
import { getFormForWorkspace } from "@/features/forms/server";

export const dynamic = "force-dynamic";

export default async function FormSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await getFormForWorkspace(id);
  if (!form) notFound();
  return <div><FormTabs formId={id} active="settings" /><FormSettings initialForm={form} /></div>;
}

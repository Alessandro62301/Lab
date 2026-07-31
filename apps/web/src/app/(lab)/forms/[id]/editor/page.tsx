import { notFound } from "next/navigation";
import { FormBuilder } from "@/features/forms/components/form-builder";
import { FormTabs } from "@/features/forms/components/form-tabs";
import { getFormForWorkspace } from "@/features/forms/server";

export const metadata = { title: "Editor de formulário" };
export const dynamic = "force-dynamic";

export default async function FormEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await getFormForWorkspace(id);
  if (!form) notFound();

  return (
    <div className="-mx-4 -my-6 sm:-mx-6 lg:-mx-8">
      <div className="px-4 sm:px-6 lg:px-8"><FormTabs formId={form.id} active="editor" /></div>
      <div className="px-4 sm:px-6 lg:px-8"><FormBuilder initialForm={form} /></div>
    </div>
  );
}

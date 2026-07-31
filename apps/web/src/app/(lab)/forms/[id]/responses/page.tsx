import { notFound } from "next/navigation";
import { FormTabs } from "@/features/forms/components/form-tabs";
import { ResponsesWorkspace } from "@/features/forms/components/responses-workspace";
import { getFormResponses } from "@/features/forms/server";

export const metadata = { title: "Respostas do formulário" };
export const dynamic = "force-dynamic";

export default async function ResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getFormResponses(id);
  if (!data) notFound();
  return <div className="-mx-4 -my-6 sm:-mx-6 lg:-mx-8"><div className="px-4 sm:px-6 lg:px-8"><FormTabs formId={id} active="responses" /></div><div className="p-4 sm:p-6"><ResponsesWorkspace data={data} /></div></div>;
}

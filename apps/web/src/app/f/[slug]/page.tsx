import { notFound } from "next/navigation";
import { PublicFormRunner } from "@/features/forms/components/public-form";
import { getPublicForm } from "@/features/forms/server";

export const dynamic = "force-dynamic";

export default async function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const form = await getPublicForm(slug);
  if (!form) notFound();
  return <PublicFormRunner form={form} />;
}

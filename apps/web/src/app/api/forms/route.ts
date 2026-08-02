import { FormFieldType, FormStatus, db } from "@lab/database";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/server/auth/session";

const createFormSchema = z.object({
  name: z.string().trim().min(3).max(80).default("Novo formulário"),
});

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
  const parsed = createFormSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Nome do formulário inválido." }, { status: 400 });
  }

  const session = await requireSession(["OWNER", "ADMIN", "MEMBER"]);
  const [workspace, user] = await Promise.all([
    db.workspace.findUnique({ where: { slug: session.workspaceId } }),
    db.user.findUnique({ where: { email: session.user.email } }),
  ]);
  if (!workspace || !user) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const project = await db.project.findFirst({
    where: { workspaceId: workspace.id, slug: "captacao-de-leads" },
  });
  const baseSlug = slugify(parsed.data.name) || "formulario";
  let slug = baseSlug;
  let suffix = 2;
  while (await db.form.findUnique({ where: { slug } })) slug = `${baseSlug}-${suffix++}`;

  const form = await db.form.create({
    data: {
      workspaceId: workspace.id,
      projectId: project?.id,
      createdById: user.id,
      name: parsed.data.name,
      slug,
      status: FormStatus.DRAFT,
      welcomeTitle: "Oi! Vamos começar?",
      welcomeDescription: "Leva menos de dois minutos.",
      thankYouTitle: "Tudo certo!",
      thankYouDescription: "Recebemos suas informações e entraremos em contato.",
      fields: {
        create: [
          { key: "welcome", type: FormFieldType.WELCOME, title: "Boas-vindas", position: 0 },
          { key: "name", type: FormFieldType.NAME, title: "Qual é o seu nome?", position: 1, isRequired: true },
          { key: "email", type: FormFieldType.EMAIL, title: "Qual é o seu melhor e-mail?", position: 2, isRequired: true },
          { key: "phone", type: FormFieldType.PHONE, title: "Seu WhatsApp", position: 3, isRequired: true },
          { key: "thanks", type: FormFieldType.THANK_YOU, title: "Agradecimento", position: 4 },
        ],
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ data: form }, { status: 201 });
}

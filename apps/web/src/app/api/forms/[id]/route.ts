import { Prisma, db } from "@lab/database";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/server/auth/session";

const fieldTypeSchema = z.enum([
  "WELCOME", "NAME", "EMAIL", "PHONE", "CPF", "CNPJ", "SHORT_TEXT", "LONG_TEXT",
  "NUMBER", "CURRENCY", "DATE", "ADDRESS", "SINGLE_CHOICE", "MULTIPLE_CHOICE",
  "SELECT", "TERMS", "MESSAGE", "THANK_YOU",
]);

const updateFormSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().max(240),
  status: z.enum(["DRAFT", "PUBLISHED", "PAUSED", "ARCHIVED"]),
  welcomeTitle: z.string().max(120),
  welcomeDescription: z.string().max(400),
  thankYouTitle: z.string().max(120),
  thankYouDescription: z.string().max(400),
  buttonLabel: z.string().max(40),
  primaryColor: z.string().regex(/^#[0-9a-f]{6}$/i),
  backgroundColor: z.string().regex(/^#[0-9a-f]{6}$/i),
  fontFamily: z.string().max(60),
  borderRadius: z.number().int().min(0).max(40),
  collectPartial: z.boolean(),
  notifyEmail: z.boolean(),
  limitDuplicate: z.boolean(),
  fields: z.array(z.object({
    id: z.string(),
    key: z.string().min(1).max(80),
    type: fieldTypeSchema,
    title: z.string().min(1).max(240),
    description: z.string().max(500),
    placeholder: z.string().max(200),
    position: z.number().int().min(0),
    isRequired: z.boolean(),
    options: z.array(z.string().max(120)).max(50),
    logic: z.object({
      sourceKey: z.string().min(1),
      operator: z.enum(["EQUALS", "NOT_EQUALS", "CONTAINS"]),
      value: z.string().max(200),
    }).nullable(),
  })),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const parsed = updateFormSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Revise os campos do formulário." }, { status: 400 });
  }

  const [{ id }, session] = await Promise.all([
    context.params,
    requireSession(["OWNER", "ADMIN", "MEMBER"]),
  ]);
  const workspace = await db.workspace.findUnique({ where: { slug: session.workspaceId } });
  if (!workspace) return NextResponse.json({ error: "Workspace não encontrado." }, { status: 404 });

  const existing = await db.form.findFirst({
    where: { id, workspaceId: workspace.id, archivedAt: null },
    include: { fields: true },
  });
  if (!existing) return NextResponse.json({ error: "Formulário não encontrado." }, { status: 404 });

  const data = parsed.data;
  const incomingKeys = data.fields.map((field) => field.key);
  await db.$transaction(async (tx) => {
    await tx.form.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        status: data.status,
        publishedAt: data.status === "PUBLISHED" ? existing.publishedAt ?? new Date() : existing.publishedAt,
        welcomeTitle: data.welcomeTitle,
        welcomeDescription: data.welcomeDescription || null,
        thankYouTitle: data.thankYouTitle,
        thankYouDescription: data.thankYouDescription || null,
        buttonLabel: data.buttonLabel,
        primaryColor: data.primaryColor,
        backgroundColor: data.backgroundColor,
        fontFamily: data.fontFamily,
        borderRadius: data.borderRadius,
        collectPartial: data.collectPartial,
        notifyEmail: data.notifyEmail,
        limitDuplicate: data.limitDuplicate,
      },
    });

    if (incomingKeys.length) {
      await tx.formField.updateMany({
        where: { formId: id, key: { notIn: incomingKeys } },
        data: { archivedAt: new Date() },
      });
    }

    await tx.formField.updateMany({
      where: { formId: id, archivedAt: null },
      data: { position: { increment: 10000 } },
    });

    for (const field of data.fields) {
      const settingsJson = field.logic ? { logic: field.logic } as Prisma.InputJsonValue : Prisma.JsonNull;
      await tx.formField.upsert({
        where: { formId_key: { formId: id, key: field.key } },
        create: {
          formId: id, key: field.key, type: field.type, title: field.title,
          description: field.description || null, placeholder: field.placeholder || null,
          position: field.position, isRequired: field.isRequired,
          optionsJson: field.options as Prisma.InputJsonValue, settingsJson,
        },
        update: {
          type: field.type, title: field.title, description: field.description || null,
          placeholder: field.placeholder || null, position: field.position,
          isRequired: field.isRequired, optionsJson: field.options as Prisma.InputJsonValue,
          settingsJson, archivedAt: null,
        },
      });
    }
  });

  return NextResponse.json({ data: { id } });
}

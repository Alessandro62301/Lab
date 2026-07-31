import { Prisma, db } from "@lab/database";
import { NextResponse } from "next/server";

import {
  completeSubmissionSchema,
  draftSubmissionSchema,
  submissionAnswerText,
} from "@/features/forms/submission-schema";
import type { FormAnswer, LeadFormFieldType } from "@/features/forms/types";
import { onlyDigits, validateAnswer } from "@/features/forms/validation";

type FormFieldShape = {
  id: string;
  key: string;
  type: string;
  title: string;
  isRequired: boolean;
  settingsJson: unknown;
};

function isVisible(
  settings: unknown,
  answers: Record<string, FormAnswer>,
) {
  if (!settings || typeof settings !== "object" || !("logic" in settings)) return true;
  const logic = (settings as { logic?: Record<string, unknown> }).logic;
  if (!logic || typeof logic.sourceKey !== "string") return true;
  const raw = answers[logic.sourceKey];
  const actual = raw === undefined ? "" : submissionAnswerText(raw);
  const expected = String(logic.value ?? "");
  if (logic.operator === "EQUALS") return actual === expected;
  if (logic.operator === "NOT_EQUALS") return actual !== expected;
  if (logic.operator === "CONTAINS") {
    return actual.toLowerCase().includes(expected.toLowerCase());
  }
  return true;
}

function answerByType(
  fields: FormFieldShape[],
  type: LeadFormFieldType,
  answers: Record<string, FormAnswer>,
) {
  const field = fields.find((candidate) => candidate.type === type);
  const value = field ? answers[field.key] : undefined;
  return value === undefined ? "" : submissionAnswerText(value).trim();
}

async function getPublishedForm(slug: string) {
  return db.form.findFirst({
    where: { slug, status: "PUBLISHED", archivedAt: null },
    include: { fields: { where: { archivedAt: null } } },
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const parsed = draftSubmissionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Não foi possível salvar o progresso." },
      { status: 400 },
    );
  }

  const { slug } = await context.params;
  const form = await getPublishedForm(slug);
  if (!form || !form.collectPartial) {
    return NextResponse.json({ error: "Recuperação indisponível." }, { status: 404 });
  }

  const existing = await db.formSubmission.findUnique({
    where: { externalKey: parsed.data.externalKey },
  });
  if (existing && existing.formId !== form.id) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 409 });
  }
  if (existing?.status === "COMPLETED") {
    return NextResponse.json({ data: { id: existing.id, status: existing.status } });
  }

  const answers = parsed.data.answers as Record<string, FormAnswer>;
  const name = answerByType(form.fields, "NAME", answers);
  const email = answerByType(form.fields, "EMAIL", answers);
  const phone = answerByType(form.fields, "PHONE", answers);
  const metadata = {
    currentStep: parsed.data.currentStep,
    totalSteps: parsed.data.totalSteps,
    currentFieldKey: parsed.data.currentFieldKey ?? null,
    completionRate: Math.min(
      100,
      Math.round((parsed.data.currentStep / parsed.data.totalSteps) * 100),
    ),
  };

  const submission = await db.$transaction(async (tx) => {
    const saved = existing
      ? await tx.formSubmission.update({
          where: { id: existing.id },
          data: {
            respondentName: name || existing.respondentName,
            respondentEmail: email || existing.respondentEmail,
            respondentPhone: phone || existing.respondentPhone,
            utmJson: parsed.data.utm
              ? parsed.data.utm as Prisma.InputJsonValue
              : existing.utmJson ?? Prisma.JsonNull,
            metadataJson: metadata,
            lastSeenAt: new Date(),
          },
        })
      : await tx.formSubmission.create({
          data: {
            externalKey: parsed.data.externalKey,
            workspaceId: form.workspaceId,
            formId: form.id,
            status: "IN_PROGRESS",
            respondentName: name || null,
            respondentEmail: email || null,
            respondentPhone: phone || null,
            utmJson: parsed.data.utm
              ? parsed.data.utm as Prisma.InputJsonValue
              : Prisma.JsonNull,
            metadataJson: metadata,
          },
        });

    const answerRows = form.fields.filter((field) => answers[field.key] !== undefined);
    await Promise.all(answerRows.map((field) =>
      tx.formAnswer.upsert({
        where: {
          submissionId_fieldId: {
            submissionId: saved.id,
            fieldId: field.id,
          },
        },
        update: {
          valueJson: answers[field.key] as Prisma.InputJsonValue,
          textValue: submissionAnswerText(answers[field.key]),
        },
        create: {
          submissionId: saved.id,
          fieldId: field.id,
          valueJson: answers[field.key] as Prisma.InputJsonValue,
          textValue: submissionAnswerText(answers[field.key]),
        },
      }),
    ));

    return saved;
  });

  return NextResponse.json({
    data: { id: submission.id, status: submission.status },
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const parsed = completeSubmissionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Não foi possível enviar suas respostas." },
      { status: 400 },
    );
  }

  const { slug } = await context.params;
  const form = await getPublishedForm(slug);
  if (!form) {
    return NextResponse.json({ error: "Formulário indisponível." }, { status: 404 });
  }

  const answers = parsed.data.answers as Record<string, FormAnswer>;
  const invalid = form.fields
    .filter((field) =>
      isVisible(field.settingsJson, answers) &&
      !["WELCOME", "MESSAGE", "THANK_YOU"].includes(field.type),
    )
    .map((field) => ({
      field,
      message: validateAnswer(
        field.type as LeadFormFieldType,
        answers[field.key],
        field.isRequired,
      ),
    }))
    .find((result) => result.message);

  if (invalid) {
    return NextResponse.json(
      { error: `${invalid.field.title}: ${invalid.message}` },
      { status: 400 },
    );
  }

  const existingSubmission = parsed.data.externalKey
    ? await db.formSubmission.findUnique({
        where: { externalKey: parsed.data.externalKey },
      })
    : null;
  if (existingSubmission && existingSubmission.formId !== form.id) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 409 });
  }
  if (existingSubmission?.status === "COMPLETED") {
    return NextResponse.json({ data: { id: existingSubmission.id } });
  }

  const name = answerByType(form.fields, "NAME", answers);
  const email = answerByType(form.fields, "EMAIL", answers);
  const phone = answerByType(form.fields, "PHONE", answers);
  const cpf = onlyDigits(answerByType(form.fields, "CPF", answers)) || null;
  const cnpj = onlyDigits(answerByType(form.fields, "CNPJ", answers)) || null;
  const emailNormalized = email ? email.toLowerCase() : null;
  const phoneNormalized = phone ? onlyDigits(phone) : null;

  const lead = emailNormalized || phoneNormalized || cpf || cnpj
    ? await db.lead.findFirst({
        where: {
          workspaceId: form.workspaceId,
          OR: [
            ...(emailNormalized ? [{ emailNormalized }] : []),
            ...(phoneNormalized ? [{ phoneNormalized }] : []),
            ...(cpf ? [{ cpf }] : []),
            ...(cnpj ? [{ cnpj }] : []),
          ],
        },
      })
    : null;

  const result = await db.$transaction(async (tx) => {
    const savedLead = lead
      ? await tx.lead.update({
          where: { id: lead.id },
          data: {
            name: name || lead.name,
            email: email || lead.email,
            emailNormalized: emailNormalized ?? lead.emailNormalized,
            phone: phone || lead.phone,
            phoneNormalized: phoneNormalized ?? lead.phoneNormalized,
            cpf: cpf ?? lead.cpf,
            cnpj: cnpj ?? lead.cnpj,
            source: parsed.data.utm?.utm_source ?? lead.source ?? "Formulário",
            lastSeenAt: new Date(),
          },
        })
      : await tx.lead.create({
          data: {
            workspaceId: form.workspaceId,
            name: name || null,
            email: email || null,
            emailNormalized,
            phone: phone || null,
            phoneNormalized,
            cpf,
            cnpj,
            source: parsed.data.utm?.utm_source ?? "Formulário",
          },
        });

    const submission = existingSubmission
      ? await tx.formSubmission.update({
          where: { id: existingSubmission.id },
          data: {
            leadId: savedLead.id,
            status: "COMPLETED",
            respondentName: name || null,
            respondentEmail: email || null,
            respondentPhone: phone || null,
            utmJson: parsed.data.utm
              ? parsed.data.utm as Prisma.InputJsonValue
              : existingSubmission.utmJson ?? Prisma.JsonNull,
            lastSeenAt: new Date(),
            completedAt: new Date(),
          },
        })
      : await tx.formSubmission.create({
          data: {
            externalKey: parsed.data.externalKey,
            workspaceId: form.workspaceId,
            formId: form.id,
            leadId: savedLead.id,
            status: "COMPLETED",
            respondentName: name || null,
            respondentEmail: email || null,
            respondentPhone: phone || null,
            utmJson: parsed.data.utm
              ? parsed.data.utm as Prisma.InputJsonValue
              : Prisma.JsonNull,
            completedAt: new Date(),
          },
        });

    await tx.formAnswer.deleteMany({ where: { submissionId: submission.id } });
    const answerRows = form.fields
      .filter((field) => answers[field.key] !== undefined)
      .map((field) => ({
        submissionId: submission.id,
        fieldId: field.id,
        valueJson: answers[field.key] as Prisma.InputJsonValue,
        textValue: submissionAnswerText(answers[field.key]),
      }));
    if (answerRows.length) await tx.formAnswer.createMany({ data: answerRows });
    return submission;
  });

  return NextResponse.json({ data: { id: result.id } }, { status: 201 });
}

import "server-only";

import { db } from "@lab/database";
import { requireSession } from "@/server/auth/session";
import type { LeadForm, LeadFormField, LeadFormFieldType } from "./types";

function stringOptions(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function fieldLogic(value: unknown): LeadFormField["logic"] {
  if (!value || typeof value !== "object" || !("logic" in value)) return null;
  const logic = (value as { logic?: unknown }).logic;
  if (!logic || typeof logic !== "object") return null;
  const candidate = logic as Record<string, unknown>;
  if (
    typeof candidate.sourceKey !== "string" ||
    typeof candidate.value !== "string" ||
    !["EQUALS", "NOT_EQUALS", "CONTAINS"].includes(String(candidate.operator))
  ) return null;
  return candidate as LeadFormField["logic"];
}

export function serializeField(field: {
  id: string;
  key: string;
  type: string;
  title: string;
  description: string | null;
  placeholder: string | null;
  position: number;
  isRequired: boolean;
  optionsJson: unknown;
  settingsJson: unknown;
}): LeadFormField {
  return {
    id: field.id,
    key: field.key,
    type: field.type as LeadFormFieldType,
    title: field.title,
    description: field.description ?? "",
    placeholder: field.placeholder ?? "",
    position: field.position,
    isRequired: field.isRequired,
    options: stringOptions(field.optionsJson),
    logic: fieldLogic(field.settingsJson),
  };
}

export function serializeForm(form: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  welcomeTitle: string;
  welcomeDescription: string | null;
  thankYouTitle: string;
  thankYouDescription: string | null;
  buttonLabel: string;
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  borderRadius: number;
  collectPartial: boolean;
  notifyEmail: boolean;
  limitDuplicate: boolean;
  fields: Array<Parameters<typeof serializeField>[0]>;
}): LeadForm {
  return {
    id: form.id,
    name: form.name,
    slug: form.slug,
    description: form.description ?? "",
    status: form.status as LeadForm["status"],
    welcomeTitle: form.welcomeTitle,
    welcomeDescription: form.welcomeDescription ?? "",
    thankYouTitle: form.thankYouTitle,
    thankYouDescription: form.thankYouDescription ?? "",
    buttonLabel: form.buttonLabel,
    primaryColor: form.primaryColor,
    backgroundColor: form.backgroundColor,
    fontFamily: form.fontFamily,
    borderRadius: form.borderRadius,
    collectPartial: form.collectPartial,
    notifyEmail: form.notifyEmail,
    limitDuplicate: form.limitDuplicate,
    fields: form.fields.map(serializeField),
  };
}

async function getWorkspace() {
  const session = await requireSession();
  const workspace = await db.workspace.findUnique({
    where: { slug: session.workspaceId },
  });
  if (!workspace) throw new Error("WORKSPACE_NOT_FOUND");
  return { session, workspace };
}

export async function listForms() {
  const { workspace } = await getWorkspace();
  const forms = await db.form.findMany({
    where: { workspaceId: workspace.id, archivedAt: null },
    include: {
      _count: { select: { submissions: true } },
      submissions: {
        where: { status: "COMPLETED" },
        select: { id: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return forms.map((form) => ({
    id: form.id,
    name: form.name,
    slug: form.slug,
    description: form.description ?? "",
    status: form.status,
    totalResponses: form._count.submissions,
    completedResponses: form.submissions.length,
    updatedAt: form.updatedAt.toISOString(),
    publishedAt: form.publishedAt?.toISOString() ?? null,
  }));
}

export async function getFormForWorkspace(idOrSlug: string) {
  const { workspace } = await getWorkspace();
  const form = await db.form.findFirst({
    where: {
      workspaceId: workspace.id,
      archivedAt: null,
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      fields: {
        where: { archivedAt: null },
        orderBy: { position: "asc" },
      },
    },
  });
  return form ? serializeForm(form) : null;
}

export async function getPublicForm(slug: string) {
  const form = await db.form.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      archivedAt: null,
    },
    include: {
      fields: {
        where: { archivedAt: null },
        orderBy: { position: "asc" },
      },
    },
  });
  return form ? serializeForm(form) : null;
}

export async function getFormResponses(formId: string) {
  const { workspace } = await getWorkspace();
  const form = await db.form.findFirst({
    where: { id: formId, workspaceId: workspace.id, archivedAt: null },
    select: { id: true, name: true, slug: true },
  });
  if (!form) return null;

  const submissions = await db.formSubmission.findMany({
    where: { formId, workspaceId: workspace.id },
    include: {
      answers: {
        include: { field: { select: { key: true, title: true, type: true, position: true } } },
      },
      lead: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    form,
    submissions: submissions.map((submission) => ({
      id: submission.id,
      status: submission.status,
      respondentName: submission.respondentName ?? "Resposta sem nome",
      respondentEmail: submission.respondentEmail ?? "",
      respondentPhone: submission.respondentPhone ?? "",
      createdAt: submission.createdAt.toISOString(),
      lastSeenAt: submission.lastSeenAt.toISOString(),
      completedAt: submission.completedAt?.toISOString() ?? null,
      completionRate:
        submission.metadataJson &&
        typeof submission.metadataJson === "object" &&
        !Array.isArray(submission.metadataJson) &&
        "completionRate" in submission.metadataJson
          ? Number(submission.metadataJson.completionRate)
          : submission.status === "COMPLETED"
            ? 100
            : 0,
      source: submission.lead?.source ?? "Direto",
      leadStatus: submission.lead?.status ?? "NEW",
      answers: submission.answers
        .sort((a, b) => a.field.position - b.field.position)
        .map((answer) => ({
          fieldKey: answer.field.key,
          title: answer.field.title,
          type: answer.field.type,
          value: answer.textValue ?? String(answer.valueJson),
        })),
    })),
  };
}

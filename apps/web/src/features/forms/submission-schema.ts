import { z } from "zod";

import type { FormAnswer } from "./types";
import { isAddressAnswer } from "./validation";

export const addressAnswerSchema = z.object({
  cep: z.string(),
  street: z.string(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  number: z.string(),
  complement: z.string(),
});

const answerSchema = z.union([
  z.string(),
  z.array(z.string()),
  z.boolean(),
  addressAnswerSchema,
]);

const answersSchema = z.record(z.string(), answerSchema);
const utmSchema = z.record(z.string(), z.string()).optional();

export const completeSubmissionSchema = z.object({
  externalKey: z.string().uuid().optional(),
  answers: answersSchema,
  utm: utmSchema,
});

export const draftSubmissionSchema = z.object({
  externalKey: z.string().uuid(),
  answers: answersSchema,
  utm: utmSchema,
  currentStep: z.number().int().min(0),
  totalSteps: z.number().int().positive(),
  currentFieldKey: z.string().optional(),
});

export function submissionAnswerText(value: FormAnswer) {
  if (Array.isArray(value)) return value.join(", ");
  if (isAddressAnswer(value)) {
    return [
      value.street,
      value.number,
      value.complement,
      value.neighborhood,
      `${value.city}/${value.state}`,
      `CEP ${value.cep}`,
    ].filter(Boolean).join(", ");
  }
  return typeof value === "boolean" ? (value ? "Sim" : "Não") : value;
}

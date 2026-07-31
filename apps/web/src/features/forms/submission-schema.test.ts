import { describe, expect, it } from "vitest";

import {
  completeSubmissionSchema,
  draftSubmissionSchema,
  submissionAnswerText,
} from "./submission-schema";

const externalKey = "d9428888-122b-11e1-b85c-61cd3cbb3210";

describe("contrato de respostas progressivas", () => {
  it("permite iniciar uma resposta recuperável sem respostas preenchidas", () => {
    const result = draftSubmissionSchema.safeParse({
      externalKey,
      answers: {},
      currentStep: 0,
      totalSteps: 8,
      currentFieldKey: "welcome",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita identificador inválido e progresso impossível", () => {
    expect(draftSubmissionSchema.safeParse({
      externalKey: "qualquer-coisa",
      answers: {},
      currentStep: -1,
      totalSteps: 0,
    }).success).toBe(false);
  });

  it("aceita endereço estruturado durante o preenchimento", () => {
    const result = draftSubmissionSchema.safeParse({
      externalKey,
      currentStep: 4,
      totalSteps: 8,
      currentFieldKey: "address",
      answers: {
        address: {
          cep: "01001-000",
          street: "Praça da Sé",
          neighborhood: "Sé",
          city: "São Paulo",
          state: "SP",
          number: "100",
          complement: "Sala 2",
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("mantém compatibilidade com o envio final", () => {
    const result = completeSubmissionSchema.safeParse({
      externalKey,
      answers: { name: "Maria" },
      utm: { utm_source: "instagram" },
    });

    expect(result.success).toBe(true);
  });

  it("gera uma leitura humana para endereços recuperados", () => {
    expect(submissionAnswerText({
      cep: "01001-000",
      street: "Praça da Sé",
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
      number: "100",
      complement: "Sala 2",
    })).toBe("Praça da Sé, 100, Sala 2, Sé, São Paulo/SP, CEP 01001-000");
  });
});

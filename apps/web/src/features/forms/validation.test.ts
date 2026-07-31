import { describe, expect, it } from "vitest";

import {
  isEmptyAnswer,
  isValidCnpj,
  isValidCpf,
  maskCep,
  maskCnpj,
  maskCpf,
  maskCurrency,
  maskPhone,
  onlyDigits,
  validateAnswer,
} from "./validation";

describe("máscaras de formulário", () => {
  it("mantém somente números", () => {
    expect(onlyDigits("(21) 99876-5432")).toBe("21998765432");
  });

  it("formata CEP, telefone, CPF e CNPJ", () => {
    expect(maskCep("01001000")).toBe("01001-000");
    expect(maskPhone("21998765432")).toBe("(21) 99876-5432");
    expect(maskPhone("2134567890")).toBe("(21) 3456-7890");
    expect(maskCpf("52998224725")).toBe("529.982.247-25");
    expect(maskCnpj("04252011000110")).toBe("04.252.011/0001-10");
  });

  it("limita a quantidade de dígitos de cada documento", () => {
    expect(maskCpf("5299822472599")).toBe("529.982.247-25");
    expect(maskCnpj("0425201100011099")).toBe("04.252.011/0001-10");
  });

  it("formata valores monetários em real", () => {
    expect(maskCurrency("123456")).toContain("1.234,56");
    expect(maskCurrency("")).toBe("");
  });
});

describe("validação de documentos brasileiros", () => {
  it("aceita CPF válido e rejeita CPF inválido ou repetido", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("529.982.247-24")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
  });

  it("aceita CNPJ válido e rejeita CNPJ inválido ou repetido", () => {
    expect(isValidCnpj("04.252.011/0001-10")).toBe(true);
    expect(isValidCnpj("04.252.011/0001-11")).toBe(false);
    expect(isValidCnpj("11.111.111/1111-11")).toBe(false);
  });
});

describe("validação das respostas", () => {
  it("exige respostas obrigatórias", () => {
    expect(validateAnswer("SHORT_TEXT", "", true)).not.toBe("");
    expect(validateAnswer("SHORT_TEXT", "", false)).toBe("");
  });

  it("valida e-mail e telefone", () => {
    expect(validateAnswer("EMAIL", "cliente", true)).not.toBe("");
    expect(validateAnswer("EMAIL", "cliente@mavi.com.br", true)).toBe("");
    expect(validateAnswer("PHONE", "2198765", true)).not.toBe("");
    expect(validateAnswer("PHONE", "(21) 99876-5432", true)).toBe("");
  });

  it("valida CPF e CNPJ mesmo quando estão mascarados", () => {
    expect(validateAnswer("CPF", "529.982.247-25", true)).toBe("");
    expect(validateAnswer("CPF", "529.982.247-24", true)).not.toBe("");
    expect(validateAnswer("CNPJ", "04.252.011/0001-10", true)).toBe("");
    expect(validateAnswer("CNPJ", "04.252.011/0001-11", true)).not.toBe("");
  });

  it("considera endereço completo somente após o retorno do CEP", () => {
    expect(isEmptyAnswer({
      cep: "01001-000",
      street: "",
      neighborhood: "",
      city: "",
      state: "",
      number: "",
      complement: "",
    })).toBe(true);

    expect(isEmptyAnswer({
      cep: "01001-000",
      street: "Praça da Sé",
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
      number: "",
      complement: "",
    })).toBe(false);
  });
});

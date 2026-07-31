import type { AddressAnswer, FormAnswer, LeadFormFieldType } from "./types";

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function maskCep(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

export function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return digits.replace(/^(\d{2})(\d+)/, "($1) $2");
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
  }
  return digits.replace(/^(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
}

export function maskCpf(value: string) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function maskCnpj(value: string) {
  return onlyDigits(value)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function maskCurrency(value: string) {
  const digits = onlyDigits(value);
  if (!digits) return "";
  const amount = Number(digits) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function isValidCpf(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const calculate = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index++) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return calculate(9) === Number(cpf[9]) && calculate(10) === Number(cpf[10]);
}

export function isValidCnpj(value: string) {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calculate = (length: number) => {
    const weights = length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((total, weight, index) => total + Number(cnpj[index]) * weight, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  return calculate(12) === Number(cnpj[12]) && calculate(13) === Number(cnpj[13]);
}

export function isAddressAnswer(value: FormAnswer | undefined): value is AddressAnswer {
  return Boolean(
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "cep" in value,
  );
}

export function isEmptyAnswer(value: FormAnswer | undefined) {
  if (value === undefined || value === "" || value === false) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (isAddressAnswer(value)) {
    return onlyDigits(value.cep).length !== 8 || !value.street || !value.city || !value.state;
  }
  return false;
}

export function validateAnswer(
  type: LeadFormFieldType,
  value: FormAnswer | undefined,
  required: boolean,
) {
  if (isEmptyAnswer(value)) return required ? "Este campo é obrigatório." : "";
  if (typeof value !== "string") return "";
  if (type === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return "Digite um e-mail válido.";
  }
  if (type === "PHONE" && !/^\d{10,11}$/.test(onlyDigits(value))) {
    return "Digite um telefone com DDD.";
  }
  if (type === "CPF" && !isValidCpf(value)) return "Digite um CPF válido.";
  if (type === "CNPJ" && !isValidCnpj(value)) return "Digite um CNPJ válido.";
  if (type === "NUMBER" && Number.isNaN(Number(value))) return "Digite um número válido.";
  if (type === "CURRENCY" && !onlyDigits(value)) return "Digite um valor válido.";
  return "";
}

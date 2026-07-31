export type LeadFormFieldType =
  | "WELCOME"
  | "NAME"
  | "EMAIL"
  | "PHONE"
  | "CPF"
  | "CNPJ"
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "NUMBER"
  | "CURRENCY"
  | "DATE"
  | "ADDRESS"
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "SELECT"
  | "TERMS"
  | "MESSAGE"
  | "THANK_YOU";

export type AddressAnswer = {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
  complement: string;
};

export type FormAnswer = string | string[] | boolean | AddressAnswer;

export type LeadFormField = {
  id: string;
  key: string;
  type: LeadFormFieldType;
  title: string;
  description: string;
  placeholder: string;
  position: number;
  isRequired: boolean;
  options: string[];
  logic: {
    sourceKey: string;
    operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS";
    value: string;
  } | null;
};

export type LeadForm = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "DRAFT" | "PUBLISHED" | "PAUSED" | "ARCHIVED";
  welcomeTitle: string;
  welcomeDescription: string;
  thankYouTitle: string;
  thankYouDescription: string;
  buttonLabel: string;
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  borderRadius: number;
  collectPartial: boolean;
  notifyEmail: boolean;
  limitDuplicate: boolean;
  fields: LeadFormField[];
};

export const fieldTypeLabels: Record<LeadFormFieldType, string> = {
  WELCOME: "Boas-vindas",
  NAME: "Nome",
  EMAIL: "E-mail",
  PHONE: "Telefone",
  CPF: "CPF",
  CNPJ: "CNPJ",
  SHORT_TEXT: "Resposta curta",
  LONG_TEXT: "Texto longo",
  NUMBER: "Número",
  CURRENCY: "Valor monetário",
  DATE: "Data",
  ADDRESS: "Endereço",
  SINGLE_CHOICE: "Escolha única",
  MULTIPLE_CHOICE: "Múltipla escolha",
  SELECT: "Seleção em lista",
  TERMS: "Termos de uso",
  MESSAGE: "Mensagem",
  THANK_YOU: "Agradecimento",
};

export const addableFieldTypes: LeadFormFieldType[] = [
  "NAME", "EMAIL", "PHONE", "CPF", "CNPJ", "SHORT_TEXT", "LONG_TEXT", "NUMBER",
  "CURRENCY", "DATE", "ADDRESS", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "SELECT",
  "TERMS", "MESSAGE",
];

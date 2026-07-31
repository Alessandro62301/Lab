"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CircleDollarSign,
  FileDigit,
  Hash,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  AddressAnswer,
  FormAnswer,
  LeadForm,
  LeadFormField,
} from "../types";
import {
  isAddressAnswer,
  maskCep,
  maskCnpj,
  maskCpf,
  maskCurrency,
  maskPhone,
  onlyDigits,
  validateAnswer,
} from "../validation";

const emptyAddress: AddressAnswer = {
  cep: "",
  street: "",
  neighborhood: "",
  city: "",
  state: "",
  number: "",
  complement: "",
};

function answerAsText(value: FormAnswer | undefined) {
  if (Array.isArray(value)) return value.join(",");
  if (isAddressAnswer(value)) return `${value.cep} ${value.street} ${value.city}`;
  return String(value ?? "");
}

function matchesLogic(field: LeadFormField, answers: Record<string, FormAnswer>) {
  if (!field.logic) return true;
  const actual = answerAsText(answers[field.logic.sourceKey]);
  if (field.logic.operator === "EQUALS") return actual === field.logic.value;
  if (field.logic.operator === "NOT_EQUALS") return actual !== field.logic.value;
  return actual.toLowerCase().includes(field.logic.value.toLowerCase());
}

function AddressStep({
  value,
  onChange,
  invalid,
}: {
  value: FormAnswer | undefined;
  onChange: (value: AddressAnswer) => void;
  invalid: boolean;
}) {
  const address = isAddressAnswer(value) ? value : emptyAddress;
  const [lookupState, setLookupState] = useState<"idle" | "loading" | "found" | "error">("idle");
  const [lookupError, setLookupError] = useState("");
  const lastLookup = useRef("");

  useEffect(() => {
    const cep = onlyDigits(address.cep);
    if (cep.length !== 8 || cep === lastLookup.current) return;
    lastLookup.current = cep;
    let active = true;
    setLookupState("loading");
    setLookupError("");

    fetch(`/api/address/cep/${cep}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "CEP não encontrado.");
        return payload.data as Pick<
          AddressAnswer,
          "cep" | "street" | "neighborhood" | "city" | "state"
        >;
      })
      .then((data) => {
        if (!active) return;
        onChange({ ...address, ...data, cep: maskCep(data.cep) });
        setLookupState("found");
      })
      .catch((error: Error) => {
        if (!active) return;
        setLookupState("error");
        setLookupError(error.message);
      });

    return () => {
      active = false;
    };
  }, [address, onChange]);

  function update(patch: Partial<AddressAnswer>) {
    onChange({ ...address, ...patch });
  }

  return (
    <FieldSet>
      <FieldLegend className="sr-only">Endereço completo</FieldLegend>
      <FieldGroup>
        <Field data-invalid={invalid || lookupState === "error"}>
          <FieldLabel htmlFor="address-cep">CEP</FieldLabel>
          <InputGroup className="h-12">
            <InputGroupAddon>
              {lookupState === "loading" ? <LoaderCircle className="animate-spin" /> : <MapPin />}
            </InputGroupAddon>
            <InputGroupInput
              id="address-cep"
              autoFocus
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              value={address.cep}
              aria-invalid={invalid || lookupState === "error"}
              onChange={(event) => {
                const cep = maskCep(event.target.value);
                if (onlyDigits(cep).length < 8) {
                  lastLookup.current = "";
                  setLookupState("idle");
                  setLookupError("");
                  onChange({ ...emptyAddress, cep });
                } else update({ cep });
              }}
            />
          </InputGroup>
          <FieldDescription>O endereço será preenchido automaticamente.</FieldDescription>
          {lookupError && <FieldError>{lookupError}</FieldError>}
        </Field>

        {lookupState === "found" && (
          <>
            <Alert>
              <MapPin />
              <AlertTitle>Endereço encontrado</AlertTitle>
              <AlertDescription>
                Confira os dados e informe o número e o complemento.
              </AlertDescription>
            </Alert>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="address-street">Logradouro</FieldLabel>
                <InputGroup className="h-11">
                  <InputGroupInput
                    id="address-street"
                    autoComplete="address-line1"
                    value={address.street}
                    onChange={(event) => update({ street: event.target.value })}
                  />
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel htmlFor="address-number">Número</FieldLabel>
                <InputGroup className="h-11">
                  <InputGroupAddon><Hash /></InputGroupAddon>
                  <InputGroupInput
                    id="address-number"
                    inputMode="numeric"
                    autoComplete="address-line2"
                    placeholder="123"
                    value={address.number}
                    onChange={(event) => update({ number: event.target.value })}
                  />
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel htmlFor="address-complement">Complemento</FieldLabel>
                <InputGroup className="h-11">
                  <InputGroupInput
                    id="address-complement"
                    placeholder="Apto, bloco, referência..."
                    value={address.complement}
                    onChange={(event) => update({ complement: event.target.value })}
                  />
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel htmlFor="address-neighborhood">Bairro</FieldLabel>
                <InputGroup className="h-11">
                  <InputGroupInput
                    id="address-neighborhood"
                    value={address.neighborhood}
                    onChange={(event) => update({ neighborhood: event.target.value })}
                  />
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel htmlFor="address-city">Cidade / UF</FieldLabel>
                <InputGroup className="h-11">
                  <InputGroupInput
                    id="address-city"
                    value={`${address.city}${address.state ? ` / ${address.state}` : ""}`}
                    readOnly
                  />
                </InputGroup>
              </Field>
            </FieldGroup>
          </>
        )}
      </FieldGroup>
    </FieldSet>
  );
}

function AnswerInput({
  field,
  value,
  onChange,
  invalid,
}: {
  field: LeadFormField;
  value: FormAnswer | undefined;
  onChange: (value: FormAnswer) => void;
  invalid: boolean;
}) {
  if (field.type === "ADDRESS") {
    return <AddressStep value={value} onChange={onChange} invalid={invalid} />;
  }
  if (field.type === "LONG_TEXT") {
    return (
      <Textarea
        autoFocus
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder || "Escreva sua resposta..."}
        aria-invalid={invalid}
        className="min-h-32 resize-none text-base"
      />
    );
  }
  if (field.type === "SINGLE_CHOICE") {
    return (
      <RadioGroup value={String(value ?? "")} onValueChange={onChange} className="grid gap-3">
        {field.options.map((option) => (
          <FieldLabel key={option} className="cursor-pointer">
            <Field orientation="horizontal">
              <RadioGroupItem value={option} />
              <span>{option}</span>
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>
    );
  }
  if (field.type === "MULTIPLE_CHOICE") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <FieldGroup>
        {field.options.map((option) => (
          <FieldLabel key={option} className="cursor-pointer">
            <Field orientation="horizontal">
              <Checkbox
                checked={selected.includes(option)}
                onCheckedChange={(checked) =>
                  onChange(
                    checked
                      ? [...selected, option]
                      : selected.filter((item) => item !== option),
                  )
                }
              />
              <span>{option}</span>
            </Field>
          </FieldLabel>
        ))}
      </FieldGroup>
    );
  }
  if (field.type === "SELECT") {
    return (
      <Select value={String(value ?? "")} onValueChange={(next) => next && onChange(next)}>
        <SelectTrigger className="h-12 w-full text-base" aria-invalid={invalid}>
          <SelectValue placeholder={field.placeholder || "Selecione uma opção"} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {field.options.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }
  if (field.type === "TERMS") {
    return (
      <FieldLabel className="cursor-pointer">
        <Field orientation="horizontal">
          <Checkbox
            checked={Boolean(value)}
            onCheckedChange={onChange}
            aria-invalid={invalid}
          />
          <span>{field.description || "Li e concordo com os termos."}</span>
        </Field>
      </FieldLabel>
    );
  }

  const inputConfigs = {
    NAME: { icon: UserRound, type: "text", inputMode: "text" as const, autoComplete: "name" },
    EMAIL: { icon: Mail, type: "email", inputMode: "email" as const, autoComplete: "email" },
    PHONE: { icon: Phone, type: "tel", inputMode: "tel" as const, autoComplete: "tel" },
    CPF: { icon: FileDigit, type: "text", inputMode: "numeric" as const, autoComplete: "off" },
    CNPJ: { icon: FileDigit, type: "text", inputMode: "numeric" as const, autoComplete: "off" },
    NUMBER: { icon: Hash, type: "number", inputMode: "decimal" as const, autoComplete: "off" },
    CURRENCY: { icon: CircleDollarSign, type: "text", inputMode: "numeric" as const, autoComplete: "off" },
    DATE: { icon: CalendarDays, type: "date", inputMode: "none" as const, autoComplete: "bday" },
    SHORT_TEXT: { icon: Hash, type: "text", inputMode: "text" as const, autoComplete: "off" },
  };
  const config = inputConfigs[field.type as keyof typeof inputConfigs] ?? {
    icon: Hash,
    type: "text",
    inputMode: "text" as const,
    autoComplete: "off",
  };
  const Icon = config.icon;

  function changeValue(raw: string) {
    if (field.type === "PHONE") onChange(maskPhone(raw));
    else if (field.type === "CPF") onChange(maskCpf(raw));
    else if (field.type === "CNPJ") onChange(maskCnpj(raw));
    else if (field.type === "CURRENCY") onChange(maskCurrency(raw));
    else onChange(raw);
  }

  return (
    <InputGroup className="h-13">
      <InputGroupAddon><Icon /></InputGroupAddon>
      <InputGroupInput
        autoFocus
        type={config.type}
        inputMode={config.inputMode}
        autoComplete={config.autoComplete}
        value={String(value ?? "")}
        onChange={(event) => changeValue(event.target.value)}
        placeholder={field.placeholder || "Digite sua resposta..."}
        aria-invalid={invalid}
        className="text-base"
      />
    </InputGroup>
  );
}

export function PublicFormRunner({ form }: { form: LeadForm }) {
  const [answers, setAnswers] = useState<Record<string, FormAnswer>>({});
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submissionKey = useRef<string | null>(null);
  const visibleFields = useMemo(
    () => form.fields.filter((field) => matchesLogic(field, answers)),
    [form.fields, answers],
  );
  const field = visibleFields[Math.min(step, visibleFields.length - 1)];
  const progress = visibleFields.length > 1
    ? Math.round((step / (visibleFields.length - 1)) * 100)
    : 100;

  function getSubmissionKey() {
    submissionKey.current ??= crypto.randomUUID();
    return submissionKey.current;
  }

  function getUtm() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(
      [...params.entries()].filter(([key]) => key.startsWith("utm_")),
    );
  }

  async function saveProgress(nextStep: number) {
    if (!form.collectPartial) return;
    try {
      await fetch(`/api/public/forms/${form.slug}/submissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalKey: getSubmissionKey(),
          answers,
          utm: getUtm(),
          currentStep: nextStep,
          totalSteps: visibleFields.length,
          currentFieldKey: visibleFields[nextStep]?.key ?? field?.key,
        }),
      });
    } catch {
      // A falha de telemetria não deve bloquear quem está preenchendo.
    }
  }

  async function advance(event?: FormEvent) {
    event?.preventDefault();
    if (!field) return;
    const validationError = validateAnswer(field.type, answers[field.key], field.isRequired);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    const next = visibleFields[step + 1];
    await saveProgress(Math.min(step + 1, visibleFields.length - 1));
    if (next?.type === "THANK_YOU" || (!next && field.type !== "THANK_YOU")) {
      setSubmitting(true);
      const response = await fetch(`/api/public/forms/${form.slug}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalKey: getSubmissionKey(),
          answers,
          utm: getUtm(),
        }),
      });
      const payload = await response.json();
      setSubmitting(false);
      if (!response.ok) {
        setError(payload.error ?? "Não foi possível enviar. Tente novamente.");
        return;
      }
    }
    if (next) setStep((current) => current + 1);
  }

  if (!field) return null;
  const isIntro = field.type === "WELCOME";
  const isMessage = field.type === "MESSAGE";
  const isThankYou = field.type === "THANK_YOU";
  const title = isIntro
    ? form.welcomeTitle
    : isThankYou
      ? form.thankYouTitle
      : field.title;
  const description = isIntro
    ? form.welcomeDescription
    : isThankYou
      ? form.thankYouDescription
      : field.description;
  const style = {
    "--form-accent": form.primaryColor,
    backgroundColor: form.backgroundColor,
    fontFamily: form.fontFamily,
  } as CSSProperties;

  return (
    <main className="flex min-h-screen flex-col" style={style}>
      <Progress
        value={progress}
        className="h-1 rounded-none [&_[data-slot=progress-indicator]]:bg-[var(--form-accent)]"
      />
      <div className="mx-auto flex w-full max-w-2xl flex-1 items-center px-6 py-12">
        <form className="w-full" onSubmit={advance} noValidate>
          <p className="mb-5 text-sm font-medium text-[var(--form-accent)]">
            {isIntro ? "Boas-vindas" : isThankYou ? "Concluído" : `${step} →`}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          {description && field.type !== "TERMS" && (
            <p className="mt-4 text-lg leading-7 text-muted-foreground">{description}</p>
          )}
          {!isIntro && !isMessage && !isThankYou && (
            <FieldGroup className="mt-10">
              <Field data-invalid={Boolean(error)}>
                <AnswerInput
                  field={field}
                  value={answers[field.key]}
                  invalid={Boolean(error)}
                  onChange={(value) => {
                    setAnswers((current) => ({ ...current, [field.key]: value }));
                    setError("");
                  }}
                />
                <FieldError>{error}</FieldError>
              </Field>
            </FieldGroup>
          )}
          {isThankYou ? (
            <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="size-4 text-[var(--form-accent)]" />
              Resposta enviada com sucesso
            </div>
          ) : (
            <div className="mt-10 flex items-center gap-3">
              {step > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setError("");
                    setStep((current) => current - 1);
                  }}
                  aria-label="Voltar"
                >
                  <ArrowLeft />
                </Button>
              )}
              <Button
                type="submit"
                disabled={submitting}
                style={{ backgroundColor: form.primaryColor, borderRadius: form.borderRadius }}
              >
                {submitting && <LoaderCircle className="animate-spin" data-icon="inline-start" />}
                {isIntro ? "Vamos começar" : isMessage ? "Continuar" : form.buttonLabel}
                {!submitting && <ArrowRight data-icon="inline-end" />}
              </Button>
              {!isIntro && field.type !== "ADDRESS" && (
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  Enter para continuar
                </span>
              )}
            </div>
          )}
        </form>
      </div>
      <p className="px-6 py-5 text-center text-xs text-muted-foreground">Criado no Lab</p>
    </main>
  );
}

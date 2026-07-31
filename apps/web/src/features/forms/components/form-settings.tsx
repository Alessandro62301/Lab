"use client";

import { useState } from "react";
import { Check, LoaderCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { LeadForm } from "../types";

export function FormSettings({ initialForm }: { initialForm: LeadForm }) {
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setState("saving");
    const response = await fetch(`/api/forms/${form.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setState(response.ok ? "saved" : "error");
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div><h1 className="text-2xl font-semibold tracking-tight">Opções</h1><p className="mt-1 text-sm text-muted-foreground">Identidade, comportamento e notificações do formulário.</p></div>
        <Button onClick={save} disabled={state === "saving"}>
          {state === "saving" ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : state === "saved" ? <Check data-icon="inline-start" /> : <Save data-icon="inline-start" />}
          {state === "saved" ? "Salvo" : "Salvar"}
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Informações</CardTitle><CardDescription>Como o formulário aparece dentro do Lab.</CardDescription></CardHeader>
        <CardContent>
          <FieldGroup>
            <Field><FieldLabel htmlFor="form-name">Título do formulário</FieldLabel><Input id="form-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
            <Field><FieldLabel htmlFor="form-description">Descrição interna</FieldLabel><Textarea id="form-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
            <Field><FieldLabel htmlFor="button-label">Texto do botão</FieldLabel><Input id="button-label" value={form.buttonLabel} onChange={(event) => setForm({ ...form, buttonLabel: event.target.value })} /></Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Personalizar estilo</CardTitle><CardDescription>Cores e acabamento da experiência pública.</CardDescription></CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field><FieldLabel htmlFor="primary-color">Cor principal</FieldLabel><div className="flex gap-2"><Input id="primary-color" type="color" className="w-14 p-1" value={form.primaryColor} onChange={(event) => setForm({ ...form, primaryColor: event.target.value })} /><Input value={form.primaryColor} onChange={(event) => setForm({ ...form, primaryColor: event.target.value })} /></div></Field>
              <Field><FieldLabel htmlFor="background-color">Cor de fundo</FieldLabel><div className="flex gap-2"><Input id="background-color" type="color" className="w-14 p-1" value={form.backgroundColor} onChange={(event) => setForm({ ...form, backgroundColor: event.target.value })} /><Input value={form.backgroundColor} onChange={(event) => setForm({ ...form, backgroundColor: event.target.value })} /></div></Field>
            </div>
            <Field><FieldLabel htmlFor="radius">Arredondamento: {form.borderRadius}px</FieldLabel><Input id="radius" type="range" min="0" max="40" value={form.borderRadius} onChange={(event) => setForm({ ...form, borderRadius: Number(event.target.value) })} /></Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Captação</CardTitle><CardDescription>Controle o recebimento e a identificação dos leads.</CardDescription></CardHeader>
        <CardContent>
          <FieldGroup>
            <Field orientation="horizontal"><div><FieldLabel htmlFor="notify-email">Receber alerta por e-mail</FieldLabel><FieldDescription>Preparo para notificações; o envio real será conectado depois.</FieldDescription></div><Switch id="notify-email" checked={form.notifyEmail} onCheckedChange={(notifyEmail) => setForm({ ...form, notifyEmail })} /></Field>
            <Field orientation="horizontal"><div><FieldLabel htmlFor="collect-partial">Salvar respostas parciais</FieldLabel><FieldDescription>Mantém a configuração pronta para recuperar abandonos.</FieldDescription></div><Switch id="collect-partial" checked={form.collectPartial} onCheckedChange={(collectPartial) => setForm({ ...form, collectPartial })} /></Field>
            <Field orientation="horizontal"><div><FieldLabel htmlFor="limit-duplicate">Limitar envios duplicados</FieldLabel><FieldDescription>Usa e-mail ou telefone para reconhecer o mesmo lead.</FieldDescription></div><Switch id="limit-duplicate" checked={form.limitDuplicate} onCheckedChange={(limitDuplicate) => setForm({ ...form, limitDuplicate })} /></Field>
          </FieldGroup>
        </CardContent>
      </Card>
      {state === "error" && <p className="text-sm text-destructive">Não foi possível salvar as opções.</p>}
    </div>
  );
}

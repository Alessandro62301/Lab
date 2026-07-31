"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  ChevronDown,
  Eye,
  GripVertical,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { addableFieldTypes, fieldTypeLabels, type LeadForm, type LeadFormField, type LeadFormFieldType } from "../types";

const optionTypes: LeadFormFieldType[] = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "SELECT"];
const noAnswerTypes: LeadFormFieldType[] = ["WELCOME", "MESSAGE", "THANK_YOU"];
const lockedFieldTypes: LeadFormFieldType[] = ["WELCOME", "THANK_YOU"];

function fieldDefaults(type: LeadFormFieldType, position: number): LeadFormField {
  const key = `${type.toLowerCase()}_${Date.now()}`;
  return {
    id: `new_${key}`,
    key,
    type,
    title: fieldTypeLabels[type],
    description: "",
    placeholder: "",
    position,
    isRequired: false,
    options: optionTypes.includes(type) ? ["Opção 1", "Opção 2"] : [],
    logic: null,
  };
}

function SortableFieldRow({
  field,
  index,
  selected,
  onSelect,
}: {
  field: LeadFormField;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const locked = lockedFieldTypes.includes(field.type);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.key, disabled: locked });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group flex items-center rounded-lg transition-colors",
        selected ? "bg-accent text-accent-foreground" : "hover:bg-muted/60",
        isDragging && "opacity-60 shadow-lg",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left"
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-background text-xs">
          {index + 1}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{field.title}</span>
          <span className="block text-xs text-muted-foreground">{fieldTypeLabels[field.type]}</span>
        </span>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled={locked}
        aria-label={locked ? "Posição fixa" : `Reordenar ${field.title}`}
        {...attributes}
        {...listeners}
      >
        {locked ? <LockKeyhole /> : <GripVertical />}
      </Button>
    </div>
  );
}

export function FormBuilder({ initialForm }: { initialForm: LeadForm }) {
  const [form, setForm] = useState(initialForm);
  const [selectedKey, setSelectedKey] = useState(initialForm.fields[0]?.key ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const selected = form.fields.find((field) => field.key === selectedKey) ?? form.fields[0];
  const previousFields = useMemo(
    () => form.fields.filter((field) => field.position < (selected?.position ?? 0) && !noAnswerTypes.includes(field.type)),
    [form.fields, selected?.position],
  );

  function updateSelected(patch: Partial<LeadFormField>) {
    setForm((current) => ({
      ...current,
      fields: current.fields.map((field) => field.key === selectedKey ? { ...field, ...patch } : field),
    }));
    setSaveState("idle");
  }

  function addField(type: LeadFormFieldType) {
    const thankYou = form.fields.find((field) => field.type === "THANK_YOU");
    const insertAt = thankYou?.position ?? form.fields.length;
    const newField = fieldDefaults(type, insertAt);
    setForm((current) => ({
      ...current,
      fields: [...current.fields.filter((field) => field.type !== "THANK_YOU"), newField, ...(thankYou ? [{ ...thankYou, position: insertAt + 1 }] : [])],
    }));
    setSelectedKey(newField.key);
  }

  function removeField() {
    if (!selected || noAnswerTypes.includes(selected.type)) return;
    const nextFields = form.fields
      .filter((field) => field.key !== selected.key)
      .map((field, position) => ({ ...field, position }));
    setForm((current) => ({ ...current, fields: nextFields }));
    setSelectedKey(nextFields[Math.max(0, selected.position - 1)]?.key ?? "");
  }

  function reorderFields(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = form.fields.findIndex((field) => field.key === active.id);
    const newIndex = form.fields.findIndex((field) => field.key === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    if (
      lockedFieldTypes.includes(form.fields[oldIndex].type) ||
      lockedFieldTypes.includes(form.fields[newIndex].type)
    ) return;
    const fields = arrayMove(form.fields, oldIndex, newIndex)
      .map((field, position) => ({ ...field, position }));
    setForm((current) => ({ ...current, fields }));
    setSaveState("idle");
  }

  async function save(status = form.status) {
    setSaveState("saving");
    const nextForm = { ...form, status };
    const response = await fetch(`/api/forms/${form.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextForm),
    });
    if (response.ok) {
      setForm(nextForm);
      setSaveState("saved");
    } else setSaveState("error");
  }

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b py-3">
        <div>
          <p className="text-sm font-medium">{form.name}</p>
          <p className="text-xs text-muted-foreground">{form.fields.length} etapas</p>
        </div>
        <div className="flex items-center gap-2">
          {saveState === "saved" && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Check className="size-3.5" /> Salvo</span>}
          {saveState === "error" && <span className="text-xs text-destructive">Não foi possível salvar</span>}
          <Link href={`/f/${form.slug}`} target="_blank" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Eye data-icon="inline-start" /> Visualizar
          </Link>
          <Button variant="outline" size="sm" onClick={() => save()} disabled={saveState === "saving"}>
            {saveState === "saving" ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
            Salvar
          </Button>
          <Button size="sm" onClick={() => save("PUBLISHED")} disabled={saveState === "saving"}>
            {form.status === "PUBLISHED" ? "Atualizar" : "Publicar"}
          </Button>
        </div>
      </div>

      <div className="grid flex-1 lg:grid-cols-[260px_minmax(360px,1fr)_320px]">
        <aside className="border-r py-4 lg:pr-4">
          <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Fluxo</p>
          <p className="px-2 pb-3 text-xs text-muted-foreground">Arraste pelo ícone para mudar a ordem.</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorderFields}>
            <SortableContext
              items={form.fields.map((field) => field.key)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-1">
                {form.fields.map((field, index) => (
                  <SortableFieldRow
                    key={field.key}
                    field={field}
                    index={index}
                    selected={selected?.key === field.key}
                    onSelect={() => setSelectedKey(field.key)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <Select onValueChange={(value) => addField(value as LeadFormFieldType)}>
            <SelectTrigger className="mt-3 w-full">
              <Plus data-icon="inline-start" />
              <SelectValue placeholder="Adicionar campo" />
              <ChevronDown className="ml-auto size-4 opacity-50" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {addableFieldTypes.map((type) => <SelectItem key={type} value={type}>{fieldTypeLabels[type]}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </aside>

        <main className="flex min-h-[540px] items-center justify-center bg-muted/25 p-6">
          <div className="w-full max-w-2xl rounded-2xl border bg-background p-10 shadow-sm" style={{ borderRadius: form.borderRadius }}>
            <Badge variant="secondary">{selected ? fieldTypeLabels[selected.type] : "Etapa"}</Badge>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">
              {selected?.type === "WELCOME" ? form.welcomeTitle : selected?.type === "THANK_YOU" ? form.thankYouTitle : selected?.title}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {selected?.type === "WELCOME" ? form.welcomeDescription : selected?.type === "THANK_YOU" ? form.thankYouDescription : selected?.description}
            </p>
            {selected?.type === "ADDRESS" ? (
              <div className="mt-8 grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  CEP com preenchimento automático
                </div>
                <Input placeholder="CEP" readOnly />
                <Input placeholder="Número e complemento" readOnly />
              </div>
            ) : selected && !noAnswerTypes.includes(selected.type) && (
              <Input className="mt-8 border-x-0 border-t-0 px-0 text-lg shadow-none" placeholder={selected.placeholder || "Digite sua resposta..."} readOnly />
            )}
            <Button className="mt-8" style={{ backgroundColor: form.primaryColor, borderRadius: form.borderRadius }}>
              {selected?.type === "WELCOME" ? "Vamos começar" : form.buttonLabel}
            </Button>
          </div>
        </main>

        <aside className="border-l py-5 lg:pl-5">
          {selected && (
            <FieldGroup>
              <div>
                <p className="font-medium">Configurar etapa</p>
                <p className="text-sm text-muted-foreground">{fieldTypeLabels[selected.type]}</p>
              </div>
              {!["WELCOME", "THANK_YOU"].includes(selected.type) && (
                <>
                  <Field>
                    <FieldLabel htmlFor="field-title">Pergunta</FieldLabel>
                    <Textarea id="field-title" value={selected.title} onChange={(event) => updateSelected({ title: event.target.value })} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="field-description">Descrição</FieldLabel>
                    <Textarea id="field-description" value={selected.description} onChange={(event) => updateSelected({ description: event.target.value })} />
                  </Field>
                  {!noAnswerTypes.includes(selected.type) && (
                    <Field>
                      <FieldLabel htmlFor="field-placeholder">Texto de ajuda</FieldLabel>
                      <Input id="field-placeholder" value={selected.placeholder} onChange={(event) => updateSelected({ placeholder: event.target.value })} />
                    </Field>
                  )}
                  {optionTypes.includes(selected.type) && (
                    <Field>
                      <FieldLabel htmlFor="field-options">Opções</FieldLabel>
                      <Textarea id="field-options" value={selected.options.join("\n")} onChange={(event) => updateSelected({ options: event.target.value.split("\n").filter(Boolean) })} />
                      <FieldDescription>Uma opção por linha.</FieldDescription>
                    </Field>
                  )}
                  {!noAnswerTypes.includes(selected.type) && (
                    <Field orientation="horizontal">
                      <div>
                        <FieldLabel htmlFor="field-required">Obrigatória</FieldLabel>
                        <FieldDescription>Impede o avanço sem resposta.</FieldDescription>
                      </div>
                      <Switch id="field-required" checked={selected.isRequired} onCheckedChange={(checked) => updateSelected({ isRequired: checked })} />
                    </Field>
                  )}
                  {previousFields.length > 0 && (
                    <>
                      <Field orientation="horizontal">
                        <div>
                          <FieldLabel htmlFor="field-logic">Lógica condicional</FieldLabel>
                          <FieldDescription>Exiba esta etapa conforme uma resposta.</FieldDescription>
                        </div>
                        <Switch
                          id="field-logic"
                          checked={Boolean(selected.logic)}
                          onCheckedChange={(checked) => updateSelected({ logic: checked ? { sourceKey: previousFields[0].key, operator: "EQUALS", value: "" } : null })}
                        />
                      </Field>
                      {selected.logic && (
                        <>
                          <Field>
                            <FieldLabel>Quando a resposta de</FieldLabel>
                            <Select value={selected.logic.sourceKey} onValueChange={(sourceKey) => sourceKey && updateSelected({ logic: { ...selected.logic!, sourceKey } })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent><SelectGroup>{previousFields.map((field) => <SelectItem key={field.key} value={field.key}>{field.title}</SelectItem>)}</SelectGroup></SelectContent>
                            </Select>
                          </Field>
                          <Field>
                            <FieldLabel>Condição</FieldLabel>
                            <Select value={selected.logic.operator} onValueChange={(operator) => operator && updateSelected({ logic: { ...selected.logic!, operator: operator as "EQUALS" | "NOT_EQUALS" | "CONTAINS" } })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent><SelectGroup>
                                <SelectItem value="EQUALS">é igual a</SelectItem>
                                <SelectItem value="NOT_EQUALS">é diferente de</SelectItem>
                                <SelectItem value="CONTAINS">contém</SelectItem>
                              </SelectGroup></SelectContent>
                            </Select>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="logic-value">Valor</FieldLabel>
                            <Input id="logic-value" value={selected.logic.value} onChange={(event) => updateSelected({ logic: { ...selected.logic!, value: event.target.value } })} />
                          </Field>
                        </>
                      )}
                    </>
                  )}
                  {!noAnswerTypes.includes(selected.type) && (
                    <Button variant="destructive" size="sm" onClick={removeField}>
                      <Trash2 data-icon="inline-start" /> Remover campo
                    </Button>
                  )}
                </>
              )}
              {selected.type === "WELCOME" && (
                <>
                  <Field><FieldLabel htmlFor="welcome-title">Título</FieldLabel><Input id="welcome-title" value={form.welcomeTitle} onChange={(event) => setForm({ ...form, welcomeTitle: event.target.value })} /></Field>
                  <Field><FieldLabel htmlFor="welcome-description">Descrição</FieldLabel><Textarea id="welcome-description" value={form.welcomeDescription} onChange={(event) => setForm({ ...form, welcomeDescription: event.target.value })} /></Field>
                </>
              )}
              {selected.type === "THANK_YOU" && (
                <>
                  <Field><FieldLabel htmlFor="thanks-title">Título</FieldLabel><Input id="thanks-title" value={form.thankYouTitle} onChange={(event) => setForm({ ...form, thankYouTitle: event.target.value })} /></Field>
                  <Field><FieldLabel htmlFor="thanks-description">Descrição</FieldLabel><Textarea id="thanks-description" value={form.thankYouDescription} onChange={(event) => setForm({ ...form, thankYouDescription: event.target.value })} /></Field>
                </>
              )}
            </FieldGroup>
          )}
        </aside>
      </div>
    </div>
  );
}

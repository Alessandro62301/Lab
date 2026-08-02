"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  GripVertical,
  ImageIcon,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MediaGalleryInput, MediaInput } from "@/features/media/media-picker";
import { FONT_OPTIONS, ICON_OPTIONS, resolveFontFamily, resolveIconOption } from "../appearance";
import type { SerializedPresencePage } from "../server";
import { presencePageSchema, type PresenceBlock, type PresenceBlockType, type PresencePageInput } from "../schema";

const blockLabels: Record<PresenceBlockType, string> = {
  LINK: "Link",
  FEATURE: "Destaque com imagem",
  TEXT: "Título de seção",
  IMAGE: "Imagem",
  GALLERY: "Galeria",
  FORM: "Formulário",
};

function EditorPreview({ page }: { page: PresencePageInput }) {
  const visibleBlocks = page.blocks.filter((block) => block.isVisible);
  return (
    <div
      className="mx-auto min-h-[650px] w-full max-w-[340px] overflow-hidden p-3 shadow-xl"
      style={{
        background: page.theme.backgroundColor,
        color: page.theme.textColor,
        borderRadius: page.theme.borderRadius + 8,
        fontFamily: resolveFontFamily(page.theme.fontFamily),
      }}
    >
      <div
        className="flex min-h-[620px] flex-col gap-2.5 px-3 py-7"
        style={{ background: page.theme.surfaceColor, borderRadius: page.theme.borderRadius + 3 }}
      >
        <header className="flex flex-col items-center px-3 pb-4 text-center">
          {page.avatarUrl ? (
            <img src={page.avatarUrl} alt="" className="size-16 rounded-full border-2 border-white/60 object-cover" />
          ) : (
            <div className="grid size-16 place-items-center rounded-full bg-white/20 text-lg font-semibold">
              {page.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <p className="mt-3 font-semibold" style={{ fontSize: page.theme.fontSize + 2 }}>{page.name}</p>
          <p className="mt-1 leading-relaxed opacity-80" style={{ fontSize: Math.max(9, page.theme.fontSize - 4) }}>{page.bio}</p>
        </header>

        {visibleBlocks.map((block) => {
          const radius = page.theme.borderRadius;
          const PreviewIcon = resolveIconOption(block.settings.icon).Icon;
          if (block.type === "TEXT") {
            return <p key={block.id} className="px-2 py-2 text-center font-semibold" style={{ fontSize: Math.max(9, page.theme.fontSize - 2) }}>{block.title}</p>;
          }
          if (block.type === "FEATURE" || block.type === "IMAGE") {
            return (
              <div key={block.id} className="overflow-hidden bg-white p-1.5 text-[#4b3440]" style={{ borderRadius: radius }}>
                {block.mediaUrl ? <img src={block.mediaUrl} alt="" className="aspect-video w-full rounded-lg object-cover" /> : null}
                <p className="px-2 py-2 text-center" style={{ fontSize: Math.max(9, page.theme.fontSize - 3) }}>{block.description || block.title}</p>
              </div>
            );
          }
          if (block.type === "GALLERY") {
            const images = Array.isArray(block.settings.images)
              ? block.settings.images.filter((item): item is string => typeof item === "string").slice(0, 3)
              : [];
            return (
              <div key={block.id} className="bg-white p-3 text-[#4b3440]" style={{ borderRadius: radius }}>
                <div className="relative h-28">
                  {images.map((image, index) => (
                    <img key={image} src={image} alt="" className="absolute left-1/2 top-1/2 size-24 rounded-md object-cover shadow" style={{ transform: `translate(-50%, -50%) translateX(${(index - 1) * 42}px) rotate(${(index - 1) * 9}deg)` }} />
                  ))}
                </div>
                <p className="opacity-60" style={{ fontSize: Math.max(8, page.theme.fontSize - 5) }}>{block.title} · {images.length} fotos</p>
              </div>
            );
          }
          return (
            <div key={block.id} className="flex min-h-11 items-center gap-2 bg-white px-3 py-2 text-[#4b3440]" style={{ borderRadius: radius }}>
              <PreviewIcon className="shrink-0" style={{ color: page.theme.accentColor, width: page.theme.iconSize, height: page.theme.iconSize }} />
              <span className="flex-1 font-medium" style={{ fontSize: Math.max(9, page.theme.fontSize - 3) }}>{block.title}</span>
              <span className="opacity-40">⋮</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PresenceEditor({ initialPage }: { initialPage: SerializedPresencePage }) {
  const [page, setPage] = useState<PresencePageInput>(() => presencePageSchema.parse(initialPage));
  const [selectedId, setSelectedId] = useState(initialPage.blocks[0]?.id ?? "");
  const [newType, setNewType] = useState<PresenceBlockType>("LINK");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const selected = useMemo(() => page.blocks.find((block) => block.id === selectedId), [page.blocks, selectedId]);

  function updatePage(changes: Partial<PresencePageInput>) {
    setPage((current) => ({ ...current, ...changes }));
    setSaveState("idle");
  }

  function updateBlock(id: string, changes: Partial<PresenceBlock>) {
    updatePage({ blocks: page.blocks.map((block) => block.id === id ? { ...block, ...changes } : block) });
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= page.blocks.length) return;
    const blocks = [...page.blocks];
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    updatePage({ blocks: blocks.map((block, position) => ({ ...block, position })) });
  }

  function addBlock() {
    const id = `new-${crypto.randomUUID()}`;
    const requiresUrl = ["LINK", "FEATURE"].includes(newType);
    const block: PresenceBlock = {
      id,
      key: `bloco-${Date.now()}`,
      type: newType,
      title: blockLabels[newType],
      description: "",
      url: requiresUrl ? "https://example.com" : "",
      mediaUrl: "",
      position: page.blocks.length,
      isVisible: true,
      settings: newType === "GALLERY" ? { images: [] } : {},
    };
    updatePage({ blocks: [...page.blocks, block] });
    setSelectedId(id);
  }

  function removeBlock(id: string) {
    const blocks = page.blocks.filter((block) => block.id !== id).map((block, position) => ({ ...block, position }));
    updatePage({ blocks });
    setSelectedId(blocks[0]?.id ?? "");
  }

  async function save() {
    setSaveState("saving");
    const response = await fetch(`/api/presence/pages/${initialPage.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(page),
    });
    setSaveState(response.ok ? "saved" : "error");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 border-b pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{page.name}</h1>
            <Badge variant={page.status === "PUBLISHED" ? "default" : "secondary"}>{page.status === "PUBLISHED" ? "Publicada" : "Rascunho"}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Edite a página como uma composição de blocos, não como um template fechado.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href={`/p/${page.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-sm font-medium hover:bg-muted">
            Ver página <ExternalLink className="size-3.5" />
          </a>
          <Button onClick={save} disabled={saveState === "saving"}>
            {saveState === "saved" ? <Check /> : <Save />}
            {saveState === "saving" ? "Salvando..." : saveState === "saved" ? "Salvo" : "Salvar"}
          </Button>
        </div>
      </div>

      {saveState === "error" ? <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">Não foi possível salvar. Revise os links e campos obrigatórios.</p> : null}

      <div className="grid gap-5 xl:grid-cols-[270px_minmax(320px,0.9fr)_minmax(300px,0.75fr)]">
        <Card className="h-fit xl:sticky xl:top-5">
          <CardHeader><CardTitle>Blocos</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Select value={newType} onValueChange={(value) => setNewType(value as PresenceBlockType)}>
                <SelectTrigger className="min-w-0 flex-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup>{Object.entries(blockLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
              <Button size="icon" variant="outline" onClick={addBlock} aria-label="Adicionar bloco"><Plus /></Button>
            </div>
            <div className="flex flex-col gap-1.5">
              {page.blocks.map((block, index) => (
                <button key={block.id} type="button" onClick={() => setSelectedId(block.id)} className={cn("flex items-center gap-2 rounded-lg border px-2 py-2 text-left transition-colors hover:bg-muted", selectedId === block.id && "border-primary bg-primary/5")}>
                  <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{block.title}</span><span className="text-[10px] text-muted-foreground">{blockLabels[block.type]}</span></span>
                  <span className="flex gap-0.5">
                    <span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); moveBlock(index, -1); }} className="rounded p-1 hover:bg-background"><ArrowUp className="size-3" /></span>
                    <span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); moveBlock(index, 1); }} className="rounded p-1 hover:bg-background"><ArrowDown className="size-3" /></span>
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="rounded-2xl border bg-[radial-gradient(circle_at_top,_var(--muted),_transparent_60%)] p-5 lg:p-8">
          <EditorPreview page={page} />
        </div>

        <Card className="h-fit xl:sticky xl:top-5">
          <CardContent className="pt-6">
            <Tabs defaultValue="content">
              <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="content">Conteúdo</TabsTrigger><TabsTrigger value="appearance">Aparência</TabsTrigger></TabsList>
              <TabsContent value="content" className="pt-5">
                {selected ? (
                  <FieldGroup>
                    <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="text-sm font-medium">Bloco visível</p><p className="text-xs text-muted-foreground">Pode ser ocultado sem apagar.</p></div><Switch checked={selected.isVisible} onCheckedChange={(checked) => updateBlock(selected.id, { isVisible: checked })} /></div>
                    <Field><FieldLabel htmlFor="block-title">Título</FieldLabel><Input id="block-title" value={selected.title} onChange={(event) => updateBlock(selected.id, { title: event.target.value })} /></Field>
                    <Field><FieldLabel htmlFor="block-description">Descrição</FieldLabel><Textarea id="block-description" value={selected.description} onChange={(event) => updateBlock(selected.id, { description: event.target.value })} /></Field>
                    {["LINK", "FORM"].includes(selected.type) ? (
                      <Field>
                        <FieldLabel>Ícone</FieldLabel>
                        <Select value={resolveIconOption(selected.settings.icon).value} onValueChange={(value) => updateBlock(selected.id, { settings: { ...selected.settings, icon: value } })}>
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {ICON_OPTIONS.map(({ value, label, Icon }) => <SelectItem key={value} value={value}><Icon />{label}</SelectItem>)}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldDescription>O ícone aparece no cartão e pode ser diferente em cada link.</FieldDescription>
                      </Field>
                    ) : null}
                    {selected.type !== "TEXT" && selected.type !== "GALLERY" ? <Field><FieldLabel htmlFor="block-url">Destino</FieldLabel><Input id="block-url" value={selected.url} onChange={(event) => updateBlock(selected.id, { url: event.target.value })} placeholder="https://..." /></Field> : null}
                    {["FEATURE", "IMAGE"].includes(selected.type) ? <Field><FieldLabel>Imagem</FieldLabel><MediaInput value={selected.mediaUrl} onChange={(mediaUrl) => updateBlock(selected.id, { mediaUrl })} label="Escolher na biblioteca" /></Field> : null}
                    {selected.type === "GALLERY" ? <Field><FieldLabel>Imagens da galeria</FieldLabel><MediaGalleryInput values={Array.isArray(selected.settings.images) ? selected.settings.images.filter((item): item is string => typeof item === "string") : []} onChange={(images) => updateBlock(selected.id, { settings: { ...selected.settings, images } })} /><FieldDescription>Reutilize imagens do Lab; as três primeiras aparecem na composição.</FieldDescription></Field> : null}
                    <Button variant="outline" className="text-destructive" onClick={() => removeBlock(selected.id)}><Trash2 /> Remover bloco</Button>
                  </FieldGroup>
                ) : <div className="grid min-h-48 place-items-center text-center text-sm text-muted-foreground"><div><ImageIcon className="mx-auto mb-2" />Selecione ou adicione um bloco.</div></div>}
              </TabsContent>
              <TabsContent value="appearance" className="pt-5">
                <FieldGroup>
                  <Field><FieldLabel htmlFor="page-name">Nome</FieldLabel><Input id="page-name" value={page.name} onChange={(event) => updatePage({ name: event.target.value })} /></Field>
                  <Field><FieldLabel htmlFor="page-bio">Descrição</FieldLabel><Textarea id="page-bio" value={page.bio} onChange={(event) => updatePage({ bio: event.target.value })} /></Field>
                  <Field><FieldLabel>Foto de perfil</FieldLabel><MediaInput value={page.avatarUrl} onChange={(avatarUrl) => updatePage({ avatarUrl })} label="Escolher foto" /></Field>
                  <Field>
                    <FieldLabel>Fonte da página</FieldLabel>
                    <Select value={FONT_OPTIONS.some((option) => option.value === page.theme.fontFamily) ? page.theme.fontFamily : FONT_OPTIONS[0].value} onValueChange={(value) => updatePage({ theme: { ...page.theme, fontFamily: value ?? FONT_OPTIONS[0].value } })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {FONT_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}><span style={{ fontFamily: option.css }}>{option.label}</span><span className="text-xs text-muted-foreground">{option.description}</span></SelectItem>)}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>A fonte é aplicada ao perfil, textos, botões e seções.</FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="font-size">Tamanho da fonte</FieldLabel>
                    <Input id="font-size" type="range" min="11" max="24" step="1" value={page.theme.fontSize} onInput={(event) => updatePage({ theme: { ...page.theme, fontSize: Number(event.currentTarget.value) } })} />
                    <FieldDescription>{page.theme.fontSize}px · aplicado proporcionalmente em títulos, textos e botões.</FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="icon-size">Tamanho dos ícones</FieldLabel>
                    <Input id="icon-size" type="range" min="16" max="48" step="1" value={page.theme.iconSize} onInput={(event) => updatePage({ theme: { ...page.theme, iconSize: Number(event.currentTarget.value) } })} />
                    <FieldDescription>{page.theme.iconSize}px · aplicado aos ícones escolhidos nos links.</FieldDescription>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    {(["backgroundColor", "surfaceColor", "textColor", "accentColor"] as const).map((field) => (
                      <Field key={field}><FieldLabel htmlFor={field}>{field === "backgroundColor" ? "Fundo" : field === "surfaceColor" ? "Painel" : field === "textColor" ? "Texto" : "Destaque"}</FieldLabel><div className="flex gap-2"><Input id={field} type="color" className="w-11 px-1" value={page.theme[field]} onChange={(event) => updatePage({ theme: { ...page.theme, [field]: event.target.value } })} /><Input value={page.theme[field]} onChange={(event) => updatePage({ theme: { ...page.theme, [field]: event.target.value } })} /></div></Field>
                    ))}
                  </div>
                  <Field><FieldLabel htmlFor="radius">Arredondamento</FieldLabel><Input id="radius" type="range" min="0" max="40" value={page.theme.borderRadius} onInput={(event) => updatePage({ theme: { ...page.theme, borderRadius: Number(event.currentTarget.value) } })} /><FieldDescription>{page.theme.borderRadius}px</FieldDescription></Field>
                  <Field><FieldLabel htmlFor="slug">Endereço público</FieldLabel><div className="flex items-center rounded-lg border bg-muted/30 pl-3"><span className="text-xs text-muted-foreground">/p/</span><Input id="slug" className="border-0 bg-transparent shadow-none" value={page.slug} onChange={(event) => updatePage({ slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} /></div></Field>
                  <Field><FieldLabel>Status</FieldLabel><Select value={page.status} onValueChange={(value) => updatePage({ status: value as PresencePageInput["status"] })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="DRAFT">Rascunho</SelectItem><SelectItem value="PUBLISHED">Publicada</SelectItem><SelectItem value="PAUSED">Pausada</SelectItem></SelectGroup></SelectContent></Select></Field>
                </FieldGroup>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

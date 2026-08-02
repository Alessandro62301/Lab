"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { calculateCoverCrop, type MediaAssetDto } from "./schema";

type PickerProps = { open: boolean; onOpenChange: (open: boolean) => void; onSelect: (asset: MediaAssetDto) => void };

async function createProcessedFile(source: File, image: HTMLImageElement, width: number, height: number, zoom: number, positionX: number, positionY: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("CANVAS_UNAVAILABLE");
  const crop = calculateCoverCrop(image.naturalWidth, image.naturalHeight, width, height, zoom, positionX, positionY);
  context.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("IMAGE_PROCESS_FAILED")), "image/webp", .88));
  return new File([blob], source.name.replace(/\.[^.]+$/, "") + "-editada.webp", { type: "image/webp" });
}

export function MediaPickerDialog({ open, onOpenChange, onSelect }: PickerProps) {
  const [assets, setAssets] = useState<MediaAssetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [ratio, setRatio] = useState("1:1");
  const [width, setWidth] = useState(800);
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const fileInput = useRef<HTMLInputElement>(null);
  const height = ratio === "4:5" ? Math.round(width * 1.25) : ratio === "16:9" ? Math.round(width * 9 / 16) : width;

  useEffect(() => {
    if (!open) return;
    fetch("/api/media/assets").then((response) => response.json()).then((result) => setAssets(result.data ?? [])).catch(() => setError("Não foi possível abrir a biblioteca.")).finally(() => setLoading(false));
  }, [open]);

  useEffect(() => () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); }, [sourceUrl]);

  function chooseFile(file: File | undefined) {
    if (!file) return;
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    const url = URL.createObjectURL(file);
    const nextImage = new Image();
    nextImage.onload = () => setImage(nextImage);
    nextImage.src = url;
    setSourceFile(file);
    setSourceUrl(url);
    setError("");
  }

  async function upload() {
    if (!sourceFile || !image) return;
    setUploading(true);
    setError("");
    try {
      const processed = await createProcessedFile(sourceFile, image, width, height, zoom, positionX, positionY);
      const form = new FormData();
      form.set("file", processed);
      form.set("width", String(width));
      form.set("height", String(height));
      const response = await fetch("/api/media/assets", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message);
      setAssets((current) => [result.data, ...current]);
      onSelect(result.data);
      onOpenChange(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha no upload.");
    } finally { setUploading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Biblioteca de mídia do Lab</DialogTitle>
          <DialogDescription>Use uma imagem existente ou envie, recorte e redimensione uma nova.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="gallery" className="min-h-0">
          <TabsList><TabsTrigger value="gallery">Galeria</TabsTrigger><TabsTrigger value="upload">Enviar e editar</TabsTrigger></TabsList>
          <TabsContent value="gallery" className="max-h-[62vh] overflow-y-auto pt-4">
            {loading ? <div className="grid min-h-56 place-items-center text-muted-foreground"><Loader2 className="animate-spin" /></div> : assets.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {assets.map((asset) => (
                  <button key={asset.id} type="button" onClick={() => { onSelect(asset); onOpenChange(false); }} className="group overflow-hidden rounded-xl border bg-muted/30 text-left outline-none transition hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50">
                    <img src={asset.url} alt={asset.name} className="aspect-square w-full object-cover transition group-hover:scale-[1.02]" />
                    <span className="block truncate px-2 py-2 text-xs">{asset.name}</span>
                  </button>
                ))}
              </div>
            ) : <div className="grid min-h-56 place-items-center rounded-xl border border-dashed text-center text-muted-foreground"><div><ImagePlus className="mx-auto mb-2" /><p className="font-medium text-foreground">Sua galeria está vazia</p><p className="text-xs">Abra “Enviar e editar” para adicionar a primeira imagem.</p></div></div>}
          </TabsContent>
          <TabsContent value="upload" className="max-h-[62vh] overflow-y-auto pt-4">
            {!sourceUrl ? (
              <button type="button" onClick={() => fileInput.current?.click()} className="grid min-h-72 w-full place-items-center rounded-xl border border-dashed bg-muted/20 text-center transition hover:bg-muted/40">
                <span><Upload className="mx-auto mb-3" /><strong className="block">Escolher imagem</strong><small className="text-muted-foreground">JPG, PNG ou WebP · até 10 MB</small></span>
              </button>
            ) : (
              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
                <div className="grid min-h-80 place-items-center overflow-hidden rounded-xl bg-muted p-5">
                  <div className="relative max-h-[420px] w-full max-w-[440px] overflow-hidden rounded-lg shadow-lg" style={{ aspectRatio: `${width}/${height}` }}>
                    <img src={sourceUrl} alt="Prévia do recorte" className="h-full w-full object-cover" style={{ objectPosition: `${positionX}% ${positionY}%`, transform: `scale(${zoom})` }} />
                  </div>
                </div>
                <FieldGroup>
                  <Field><FieldLabel>Formato</FieldLabel><Select value={ratio} onValueChange={(value) => setRatio(value ?? "1:1")}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="1:1">Quadrado · 1:1</SelectItem><SelectItem value="4:5">Retrato · 4:5</SelectItem><SelectItem value="16:9">Paisagem · 16:9</SelectItem></SelectGroup></SelectContent></Select></Field>
                  <Field><FieldLabel htmlFor="media-width">Largura final</FieldLabel><Input id="media-width" type="range" min="400" max="1600" step="100" value={width} onChange={(event) => setWidth(Number(event.target.value))} /><FieldDescription>{width} × {height}px</FieldDescription></Field>
                  <Field><FieldLabel htmlFor="media-zoom">Zoom</FieldLabel><Input id="media-zoom" type="range" min="1" max="3" step=".05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></Field>
                  <Field><FieldLabel htmlFor="media-x">Posição horizontal</FieldLabel><Input id="media-x" type="range" min="0" max="100" value={positionX} onChange={(event) => setPositionX(Number(event.target.value))} /></Field>
                  <Field><FieldLabel htmlFor="media-y">Posição vertical</FieldLabel><Input id="media-y" type="range" min="0" max="100" value={positionY} onChange={(event) => setPositionY(Number(event.target.value))} /></Field>
                  <Button variant="outline" onClick={() => fileInput.current?.click()}><ImagePlus data-icon="inline-start" /> Trocar imagem</Button>
                </FieldGroup>
              </div>
            )}
            <Input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} />
          </TabsContent>
        </Tabs>
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={upload} disabled={!sourceFile || uploading}>{uploading ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Check data-icon="inline-start" />} Usar imagem</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MediaInput({ value, onChange, label = "Imagem" }: { value: string; onChange: (value: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      {value ? <div className="relative overflow-hidden rounded-xl border bg-muted"><img src={value} alt="" className="h-36 w-full object-cover" /><Button type="button" variant="secondary" size="sm" className="absolute bottom-2 right-2" onClick={() => setOpen(true)}>Trocar</Button></div> : null}
      <div className={cn("flex gap-2", value && "hidden")}><Button type="button" variant="outline" onClick={() => setOpen(true)}><ImagePlus data-icon="inline-start" /> {label}</Button></div>
      <MediaPickerDialog open={open} onOpenChange={setOpen} onSelect={(asset) => onChange(asset.url)} />
    </div>
  );
}

export function MediaGalleryInput({ values, onChange }: { values: string[]; onChange: (values: string[]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-3">
      {values.length ? <div className="grid grid-cols-3 gap-2">{values.map((url, index) => <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-lg border"><img src={url} alt="" className="aspect-square w-full object-cover" /><button type="button" aria-label="Remover imagem" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-1 top-1 rounded-md bg-background/90 px-1.5 py-0.5 text-xs opacity-0 shadow group-hover:opacity-100">×</button></div>)}</div> : null}
      <Button type="button" variant="outline" onClick={() => setOpen(true)}><ImagePlus data-icon="inline-start" /> Adicionar da galeria</Button>
      <MediaPickerDialog open={open} onOpenChange={setOpen} onSelect={(asset) => onChange([...values, asset.url])} />
    </div>
  );
}

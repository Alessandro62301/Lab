"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Cloud, HardDrive, ImagePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MediaAssetDto } from "./schema";
import { MediaPickerDialog } from "./media-picker";

export function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAssetDto[]>([]);
  const [open, setOpen] = useState(false);
  const [drive, setDrive] = useState<{ configured: boolean; connected: boolean; accountLabel: string | null } | null>(null);
  useEffect(() => { Promise.all([fetch("/api/media/assets").then((response) => response.json()), fetch("/api/media/google/status").then((response) => response.json())]).then(([media, google]) => { setAssets(media.data ?? []); setDrive(google.data ?? null); }); }, []);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-end md:justify-between">
        <div><p className="text-xs font-medium uppercase tracking-[.18em] text-muted-foreground">Workspace</p><h1 className="text-3xl font-semibold tracking-tight">Biblioteca de mídia</h1><p className="mt-1 text-sm text-muted-foreground">Uma galeria compartilhada por formulários, páginas e todos os módulos do Lab.</p></div>
        <Button onClick={() => setOpen(true)}><ImagePlus data-icon="inline-start" /> Nova imagem</Button>
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div><CardTitle className="flex items-center gap-2"><Cloud /> Google Drive</CardTitle><CardDescription>{drive?.connected ? `Conectado · ${drive.accountLabel ?? "Google Drive"}` : "Conecte uma conta para armazenar os arquivos da galeria no Drive."}</CardDescription></div>
          {drive?.connected ? <Badge>Conectado</Badge> : drive?.configured ? <a href="/api/media/google/connect" className={buttonVariants({ variant: "outline" })}>Conectar Drive</a> : <Badge variant="secondary">Configurar credenciais</Badge>}
        </CardHeader>
      </Card>
      {assets.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{assets.map((asset) => <Card key={asset.id} className="overflow-hidden py-0"><img src={asset.url} alt={asset.name} className="aspect-square w-full object-cover" /><CardContent className="px-3 py-3"><p className="truncate text-sm font-medium">{asset.name}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><HardDrive /> {asset.width && asset.height ? `${asset.width} × ${asset.height}` : "Imagem"}</p></CardContent></Card>)}</div> : <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed bg-muted/10 text-center"><div><ImagePlus className="mx-auto mb-3" /><h2 className="font-semibold">Nenhuma imagem ainda</h2><p className="text-sm text-muted-foreground">Envie a primeira imagem; ela ficará disponível em todo o Lab.</p></div></div>}
      <MediaPickerDialog open={open} onOpenChange={setOpen} onSelect={(asset) => setAssets((current) => [asset, ...current.filter((item) => item.id !== asset.id)])} />
    </div>
  );
}

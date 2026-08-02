import Link from "next/link";
import { BarChart3, ExternalLink, MousePointerClick, Pencil, UsersRound } from "lucide-react";

import { PageHeading } from "@/components/layout/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPresenceDashboard } from "@/features/presence/server";

export const metadata = { title: "Presença" };

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl border bg-muted/20 p-3"><p className="text-xl font-semibold tabular-nums">{value}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p></div>;
}

export default async function PresenceModulePage() {
  const pages = await getPresenceDashboard();
  return (
    <div className="flex flex-col gap-8">
      <PageHeading eyebrow="Módulo" title="Presença" description="Páginas públicas com identidade própria, blocos editoriais e métricas de acesso no mesmo lugar." />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Suas páginas</CardTitle><CardDescription>Cada página pode ter uma linguagem visual diferente — sem ficar presa a uma lista genérica de links.</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-4">
            {pages.map((page) => (
              <article key={page.id} className="grid gap-5 rounded-2xl border p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="grid size-14 shrink-0 place-items-center rounded-2xl text-lg font-semibold shadow-sm" style={{ background: page.theme.surfaceColor, color: page.theme.textColor }}>{page.name.slice(0, 2).toUpperCase()}</div>
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-semibold">{page.name}</h2><Badge variant={page.status === "PUBLISHED" ? "default" : "secondary"}>{page.status === "PUBLISHED" ? "Publicada" : "Rascunho"}</Badge></div><p className="mt-1 truncate text-sm text-muted-foreground">lab.local/p/{page.slug} · {page.blocks.length} blocos</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/modules/presence/${page.id}/editor`} className="inline-flex h-8 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"><Pencil className="size-3.5" /> Editar</Link>
                  <Link href={`/p/${page.slug}`} target="_blank" className="grid size-8 place-items-center rounded-lg border hover:bg-muted" aria-label="Abrir página"><ExternalLink className="size-4" /></Link>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:col-span-2">
                  <Metric label="visualizações" value={page.metrics.views} /><Metric label="cliques" value={page.metrics.clicks} /><Metric label="visitantes únicos" value={page.metrics.uniqueVisitors} /><Metric label="taxa de clique" value={`${page.metrics.clickRate.toFixed(1)}%`} />
                </div>
              </article>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="size-4" /> Métricas de verdade</CardTitle><CardDescription>Visualizações e cliques são gravados por página e por bloco. O visitante é anônimo.</CardDescription></CardHeader><CardContent className="flex gap-2"><Badge variant="secondary"><UsersRound /> únicos</Badge><Badge variant="secondary"><MousePointerClick /> CTR</Badge></CardContent></Card>
          <Card><CardHeader><CardTitle>Comece pela Mavi</CardTitle><CardDescription>A primeira composição reproduz a linguagem da sua página atual: vinho, rosa, cards compactos, mídia e galeria sobreposta.</CardDescription></CardHeader></Card>
        </div>
      </section>
    </div>
  );
}

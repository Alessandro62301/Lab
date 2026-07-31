"use client";

import { useMemo, useState } from "react";
import {
  Bold,
  Code2,
  Eye,
  Heading2,
  Italic,
  Link2,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { notes } from "@/lib/mock-data";

const initialContent = `# Visão do Lab

O **Lab** é a casa central para organizar produtos, conhecimento e execução.

## Princípios

- Um único lugar para encontrar contexto
- Módulos simples e independentes
- IA como infraestrutura compartilhada
- Documentação próxima do trabalho

## Próximos passos

1. Consolidar a fundação
2. Validar o fluxo de tarefas
3. Evoluir o Data Inbox`;

function MarkdownPreview({ content }: { content: string }) {
  const blocks = useMemo(() => content.split("\n"), [content]);

  return (
    <article className="flex flex-col gap-3 p-6 text-sm leading-7 md:p-10">
      {blocks.map((line, index) => {
        if (line.startsWith("# ")) return <h1 key={index} className="mt-2 text-3xl font-semibold tracking-tight">{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={index} className="mt-5 text-xl font-semibold">{line.slice(3)}</h2>;
        if (line.startsWith("- ")) return <p key={index} className="pl-4 before:mr-3 before:content-['•']">{line.slice(2)}</p>;
        if (/^\d+\.\s/.test(line)) return <p key={index} className="pl-4 text-muted-foreground">{line}</p>;
        if (!line) return <span key={index} className="h-1" />;
        const parts = line.split("**");
        return (
          <p key={index} className="text-muted-foreground">
            {parts.map((part, partIndex) =>
              partIndex % 2 ? <strong key={partIndex} className="font-semibold text-foreground">{part}</strong> : part,
            )}
          </p>
        );
      })}
    </article>
  );
}

export function NotesWorkspace() {
  const [content, setContent] = useState(initialContent);
  const [preview, setPreview] = useState(false);

  return (
    <div className="grid min-h-[680px] overflow-hidden rounded-xl border bg-background shadow-xs lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-b bg-muted/20 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 p-3">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-8 pl-8 text-xs" placeholder="Buscar notas..." />
          </div>
          <Button size="icon-sm" aria-label="Nova nota">
            <Plus />
          </Button>
        </div>
        <Separator />
        <div className="flex max-h-56 flex-col gap-1 overflow-y-auto p-2 lg:max-h-none">
          <p className="px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground">Recentes</p>
          {notes.map((note, index) => (
            <button
              key={note.title}
              className={`flex w-full items-start gap-2 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted ${index === 0 ? "bg-muted" : ""}`}
            >
              <span className="mt-0.5 text-xs">{note.icon}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{note.title}</span>
                <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                  {note.project} · {note.updatedAt}
                </span>
              </span>
            </button>
          ))}
          <p className="px-2 pb-1 pt-4 text-xs font-medium text-muted-foreground">Favoritos</p>
          <button className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <Star className="size-3.5" />
            Visão do Lab
          </button>
        </div>
      </aside>

      <section className="flex min-w-0 flex-col">
        <header className="flex h-12 items-center gap-1 border-b px-3">
          <Button variant="ghost" size="icon-sm" aria-label="Título">
            <Heading2 />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Negrito">
            <Bold />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Itálico">
            <Italic />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Lista">
            <List />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Link">
            <Link2 />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Código">
            <Code2 />
          </Button>
          <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">Salvo localmente</span>
          <Button
            variant={preview ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setPreview((value) => !value)}
          >
            <Eye data-icon="inline-start" />
            {preview ? "Editar" : "Prévia"}
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Mais opções">
            <MoreHorizontal />
          </Button>
        </header>
        {preview ? (
          <MarkdownPreview content={content} />
        ) : (
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="min-h-[630px] resize-none rounded-none border-0 bg-transparent p-6 font-mono text-sm leading-7 shadow-none focus-visible:ring-0 md:p-10"
            aria-label="Conteúdo da nota em Markdown"
          />
        )}
      </section>
    </div>
  );
}

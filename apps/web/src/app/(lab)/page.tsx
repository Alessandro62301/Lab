import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FileText,
  Inbox,
  MoreHorizontal,
} from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { ProjectIcon } from "@/components/project-icon";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { notes, projects, tasks } from "@/lib/mock-data";

export default function HomePage() {
  const focusTasks = tasks.filter((task) => task.status !== "Concluído").slice(0, 4);

  return (
    <div className="flex flex-col gap-10">
      <PageHeading
        eyebrow="Sexta, 31 de julho"
        title="Bom dia, Junior."
        description="Tudo o que merece sua atenção, em um só lugar."
        actions={
          <Link href="/tasks" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Ver minha semana
            <ArrowRight data-icon="inline-end" />
          </Link>
        }
      />

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Seu foco</h2>
              <p className="text-xs text-muted-foreground">4 tarefas abertas</p>
            </div>
            <Button variant="ghost" size="icon-sm" aria-label="Mais opções">
              <MoreHorizontal />
            </Button>
          </div>
          <div className="overflow-hidden rounded-xl border bg-background shadow-xs">
            {focusTasks.map((task, index) => (
              <div key={task.code}>
                {index > 0 ? <Separator /> : null}
                <Link
                  href="/tasks"
                  className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50"
                >
                  <Circle className="size-4 shrink-0 text-muted-foreground/70" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.code} · {task.project}
                    </p>
                  </div>
                  <Badge variant={task.priority === "Alta" ? "default" : "secondary"}>
                    {task.priority}
                  </Badge>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold">Pulso do Lab</h2>
            <p className="text-xs text-muted-foreground">Desde sua última visita</p>
          </div>
          <div className="flex flex-col gap-5 rounded-xl border bg-background p-5 shadow-xs">
            <div className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-success text-success-foreground">
                <CheckCircle2 className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">Fundação do Lab iniciada</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  Estrutura, módulos e banco já têm uma direção única.
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-warning text-warning-foreground">
                <Inbox className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">Data Inbox registrado</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  O módulo está planejado, sem lógica de processamento ainda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-sm font-semibold">Projetos em movimento</h2>
            <p className="text-xs text-muted-foreground">Contextos ativos deste workspace</p>
          </div>
          <Link href="/projects" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Todos os projetos
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href="/projects"
              className="flex flex-col gap-5 rounded-xl border bg-background p-5 shadow-xs transition-[border-color,transform] hover:-translate-y-0.5 hover:border-foreground/20"
            >
              <div className="flex items-start gap-3">
                <ProjectIcon icon={project.icon} />
                <div className="min-w-0">
                  <p className="font-medium">{project.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {project.description}
                  </p>
                </div>
              </div>
              <div className="mt-auto flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{project.progress}% concluído</span>
                  <span>{project.updatedAt}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-sm font-semibold">Conhecimento recente</h2>
            <p className="text-xs text-muted-foreground">Páginas alteradas recentemente</p>
          </div>
          <Link href="/notes" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Abrir notas
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
        <div className="grid overflow-hidden rounded-xl border bg-background shadow-xs md:grid-cols-2">
          {notes.slice(0, 4).map((note, index) => (
            <Link
              key={note.title}
              href="/notes"
              className={cn(
                "flex gap-3 p-4 transition-colors hover:bg-muted/50",
                index % 2 === 0 && "md:border-r",
                index > 1 && "border-t",
                index === 1 && "border-t md:border-t-0",
              )}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-sm">
                {note.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="size-3.5 text-muted-foreground" />
                  <p className="truncate text-sm font-medium">{note.title}</p>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">{note.excerpt}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {note.project} · {note.updatedAt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

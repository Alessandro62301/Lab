import Link from "next/link";
import { ArrowUpRight, Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { ProjectIcon } from "@/components/project-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { projects } from "@/lib/mock-data";

export const metadata = { title: "Projetos" };

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Workspace"
        title="Projetos"
        description="Cada iniciativa reúne contexto, notas, tarefas e módulos em um único lugar."
        actions={
          <Button size="sm">
            <Plus data-icon="inline-start" />
            Novo projeto
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar projetos..." aria-label="Buscar projetos" />
        </div>
        <Button variant="outline" size="sm">
          <Filter data-icon="inline-start" />
          Filtrar
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-background shadow-xs">
        <div className="hidden grid-cols-[minmax(280px,1fr)_140px_180px_120px_40px] border-b bg-muted/30 px-5 py-2.5 text-xs font-medium text-muted-foreground md:grid">
          <span>Projeto</span>
          <span>Status</span>
          <span>Progresso</span>
          <span>Atualizado</span>
          <span />
        </div>
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group grid gap-4 border-b px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40 md:grid-cols-[minmax(280px,1fr)_140px_180px_120px_40px] md:items-center"
          >
            <div className="flex min-w-0 items-center gap-3">
              <ProjectIcon icon={project.icon} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{project.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {project.description}
                </p>
              </div>
            </div>
            <div>
              <Badge variant={project.status === "Ativo" ? "default" : "secondary"}>
                {project.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-brand" style={{ width: `${project.progress}%` }} />
              </div>
              <span className="w-8 text-right text-xs text-muted-foreground">{project.progress}%</span>
            </div>
            <span className="text-xs text-muted-foreground">{project.updatedAt}</span>
            <Button variant="ghost" size="icon-sm" aria-label={`Opções de ${project.name}`}>
              <MoreHorizontal />
            </Button>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-dashed bg-muted/20 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Data Inbox é o primeiro módulo registrado</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              O contexto já existe dentro do Lab; processamento e integrações ficam para a próxima etapa.
            </p>
          </div>
          <Button variant="outline" size="sm">
            Ver módulo
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  );
}

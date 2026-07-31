import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckSquare2, NotebookPen, Shapes } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { ProjectIcon } from "@/components/project-icon";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { projects, tasks } from "@/lib/mock-data";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const projectTasks = tasks.filter((task) => task.project === project.name);

  return (
    <div className="flex flex-col gap-8">
      <Link href="/projects" className={buttonVariants({ variant: "ghost", size: "sm", className: "w-fit" })}>
        <ArrowLeft data-icon="inline-start" />
        Projetos
      </Link>
      <div className="flex items-start gap-4">
        <ProjectIcon icon={project.icon} />
        <div className="min-w-0 flex-1">
          <PageHeading
            eyebrow="Projeto"
            title={project.name}
            description={project.description}
            actions={<Badge variant={project.status === "Ativo" ? "default" : "secondary"}>{project.status}</Badge>}
          />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { icon: CheckSquare2, value: projectTasks.length, label: "tarefas registradas" },
          { icon: NotebookPen, value: 2, label: "notas relacionadas" },
          { icon: Shapes, value: project.slug === "data-inbox" ? 1 : 3, label: "módulos vinculados" },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="rounded-xl border bg-background p-5 shadow-xs">
            <Icon className="size-4 text-muted-foreground" />
            <p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

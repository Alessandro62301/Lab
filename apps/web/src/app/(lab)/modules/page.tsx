import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { moduleRegistry } from "@/modules/registry";

export const metadata = { title: "Módulos" };

export default function ModulesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Sistema"
        title="Módulos"
        description="Capacidades internas que compartilham workspace, identidade, dados e navegação."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {moduleRegistry.map(({ key, name, description, href, icon: Icon, status, projectScoped }) => (
          <article key={key} className="flex flex-col gap-5 rounded-xl border bg-background p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border bg-muted/30">
                <Icon className="size-4 text-muted-foreground" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold">{name}</h2>
                  <Badge variant={status === "active" ? "default" : "secondary"}>
                    {status === "active" ? "Ativo" : "Planejado"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {projectScoped ? "Pode usar contexto de projeto" : "Global do workspace"}
              </span>
              <Link href={href} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Abrir
                <ArrowUpRight data-icon="inline-end" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

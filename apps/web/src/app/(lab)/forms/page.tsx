import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  Eye,
  MessageSquareText,
  Radio,
} from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateFormButton } from "@/features/forms/components/create-form-button";
import { listForms } from "@/features/forms/server";
import { cn } from "@/lib/utils";

export const metadata = { title: "Captação de leads" };
export const dynamic = "force-dynamic";

const statusLabel = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
  PAUSED: "Pausado",
  ARCHIVED: "Arquivado",
};

export default async function FormsPage() {
  const forms = await listForms();
  const responses = forms.reduce((total, form) => total + form.completedResponses, 0);
  const published = forms.filter((form) => form.status === "PUBLISHED").length;
  const completionBase = forms.reduce((total, form) => total + form.totalResponses, 0);
  const completion = completionBase ? Math.round((responses / completionBase) * 100) : 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeading
        eyebrow="Captação"
        title="Formulários"
        description="Crie jornadas personalizadas e transforme cada resposta em uma oportunidade."
        actions={<CreateFormButton />}
      />

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Visão geral</CardTitle>
          <CardDescription>Desempenho dos formulários deste workspace.</CardDescription>
        </CardHeader>
        <CardContent className="-mb-(--card-spacing) -mx-(--card-spacing) grid sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex items-center gap-3 border-b px-5 py-4 sm:border-r xl:border-b-0">
            <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
              <ClipboardList className="size-4" />
            </span>
            <div>
              <p className="text-xl font-semibold tabular-nums">{forms.length}</p>
              <p className="text-xs text-muted-foreground">Formulários</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b px-5 py-4 xl:border-b-0 xl:border-r">
            <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
              <Radio className="size-4" />
            </span>
            <div>
              <p className="text-xl font-semibold tabular-nums">{published}</p>
              <p className="text-xs text-muted-foreground">Publicados</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b px-5 py-4 sm:border-b-0 sm:border-r">
            <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
              <MessageSquareText className="size-4" />
            </span>
            <div>
              <p className="text-xl font-semibold tabular-nums">{responses}</p>
              <p className="text-xs text-muted-foreground">Respostas</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
              <BarChart3 className="size-4" />
            </span>
            <div>
              <p className="text-xl font-semibold tabular-nums">{completion}%</p>
              <p className="text-xs text-muted-foreground">Concluídas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Seus formulários</CardTitle>
          <CardDescription>Edite a jornada, compartilhe o link e acompanhe os leads recebidos.</CardDescription>
          <CardAction>
            <Badge variant="secondary">{forms.length} no total</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="-mb-(--card-spacing) -mx-(--card-spacing)">
          {forms.length ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-5">Formulário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Respostas</TableHead>
                  <TableHead>Atualizado</TableHead>
                  <TableHead className="pr-5 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="pl-5">
                      <div className="flex min-w-64 items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground shadow-xs">
                          <ClipboardList className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/forms/${form.id}/editor`}
                            className="block truncate font-medium hover:underline"
                          >
                            {form.name}
                          </Link>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            /f/{form.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={form.status === "PUBLISHED" ? "default" : "secondary"}>
                        {statusLabel[form.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium tabular-nums">{form.completedResponses}</span>
                      <span className="ml-1 text-xs text-muted-foreground">leads</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Intl.DateTimeFormat("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      }).format(new Date(form.updatedAt))}
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex justify-end gap-1">
                        {form.status === "PUBLISHED" && (
                          <Link
                            href={`/f/${form.slug}`}
                            target="_blank"
                            aria-label={`Visualizar ${form.name}`}
                            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                          >
                            <Eye />
                          </Link>
                        )}
                        <Link
                          href={`/forms/${form.id}/responses`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          Respostas
                        </Link>
                        <Link
                          href={`/forms/${form.id}/editor`}
                          aria-label={`Editar ${form.name}`}
                          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                        >
                          <ArrowUpRight />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty className="border-0 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardList />
                </EmptyMedia>
                <EmptyTitle>Nenhum formulário criado</EmptyTitle>
                <EmptyDescription>
                  Crie uma jornada para começar a captar e organizar seus leads.
                </EmptyDescription>
              </EmptyHeader>
              <CreateFormButton />
            </Empty>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between rounded-xl border border-dashed bg-muted/20 px-5 py-4">
        <div>
          <p className="text-sm font-medium">Contratos serão um módulo separado</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Aqui o foco continua sendo formulário, captação e organização dos leads.
          </p>
        </div>
        <Link href="/projects/captacao-de-leads" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}>
          Ver projeto
          <ArrowUpRight data-icon="inline-end" />
        </Link>
      </div>
    </div>
  );
}

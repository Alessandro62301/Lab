import { ArrowLeft, FileSpreadsheet, Inbox, ListChecks, Sparkles } from "lucide-react";
import Link from "next/link";
import { PageHeading } from "@/components/layout/page-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Data Inbox" };

export default function DataInboxPage() {
  return (
    <div className="flex flex-col gap-8">
      <Link href="/modules" className={buttonVariants({ variant: "ghost", size: "sm", className: "w-fit" })}>
        <ArrowLeft data-icon="inline-start" />
        Voltar aos módulos
      </Link>
      <PageHeading
        eyebrow="Primeiro módulo de produto"
        title="Data Inbox"
        description="Uma central para transformar textos, planilhas e documentos em dados estruturados e revisáveis."
        actions={<Badge variant="secondary">Planejado</Badge>}
      />
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { icon: Inbox, title: "Receber", text: "Textos e arquivos entram por uma caixa única." },
          { icon: Sparkles, title: "Estruturar", text: "Conversores extraem e normalizam os dados." },
          { icon: ListChecks, title: "Revisar", text: "Uma etapa humana confirma tudo antes de salvar." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border bg-background p-5 shadow-xs">
            <Icon className="size-5 text-muted-foreground" />
            <p className="mt-5 text-sm font-semibold">{title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-4 rounded-xl border border-dashed bg-muted/20 p-5">
        <FileSpreadsheet className="mt-0.5 size-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Escopo preservado, implementação adiada</p>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
            O módulo já aparece no registro e no banco, mas ainda não possui processamento, APIs próprias ou integrações externas.
          </p>
        </div>
      </div>
    </div>
  );
}

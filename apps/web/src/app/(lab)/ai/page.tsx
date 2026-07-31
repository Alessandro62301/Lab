import {
  Check,
  CircleDotDashed,
  KeyRound,
  LockKeyhole,
  MessageSquareText,
  Route,
  Sparkles,
} from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export const metadata = { title: "Central de IA" };

const providers = [
  {
    name: "OpenAI",
    initials: "OA",
    description: "Chats, extração, classificação e automações.",
    environment: "OPENAI_API_KEY",
  },
  {
    name: "Claude",
    initials: "CL",
    description: "Análise longa, escrita e assistência de desenvolvimento.",
    environment: "ANTHROPIC_API_KEY",
  },
];

export default function AiHubPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Infraestrutura compartilhada"
        title="Central de IA"
        description="Conecte provedores uma vez e defina como cada projeto poderá usá-los. Chamadas reais continuam desativadas nesta primeira etapa."
        actions={
          <Badge variant="secondary">
            <CircleDotDashed data-icon="inline-start" />
            Modo preparação
          </Badge>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <section className="overflow-hidden rounded-xl border bg-background shadow-xs">
          <div className="p-5">
            <h2 className="text-sm font-semibold">Provedores</h2>
            <p className="mt-1 text-xs text-muted-foreground">Credenciais sempre permanecem no servidor.</p>
          </div>
          <Separator />
          {providers.map((provider, index) => (
            <div key={provider.name}>
              {index > 0 ? <Separator /> : null}
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border bg-muted/30 text-xs font-semibold">
                  {provider.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{provider.name}</p>
                    <Badge variant="outline">Não conectado</Badge>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{provider.description}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">{provider.environment}</p>
                </div>
                <Button variant="outline" size="sm">
                  <KeyRound data-icon="inline-start" />
                  Configurar
                </Button>
              </div>
            </div>
          ))}
        </section>

        <aside className="flex flex-col gap-4 rounded-xl border bg-background p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-brand text-brand-foreground">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Playground</h2>
              <p className="text-xs text-muted-foreground">Interface pronta para a próxima etapa</p>
            </div>
          </div>
          <Textarea
            disabled
            placeholder="Pergunte, analise um documento ou inicie uma automação..."
            className="min-h-36 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Nenhum modelo selecionado</span>
            <Button disabled size="sm">
              Enviar
            </Button>
          </div>
        </aside>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          { icon: MessageSquareText, title: "Chats por projeto", text: "Conversas guardam o contexto do projeto certo." },
          { icon: Route, title: "Roteamento", text: "Escolha provedor e modelo conforme cada tarefa." },
          { icon: LockKeyhole, title: "Uso seguro", text: "Segredos no servidor e permissões por workspace." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3 rounded-xl border bg-background p-4 shadow-xs">
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Check className="size-3.5" />
        Contratos OpenAI e Anthropic já definidos no servidor, sem chamadas externas.
      </div>
    </div>
  );
}

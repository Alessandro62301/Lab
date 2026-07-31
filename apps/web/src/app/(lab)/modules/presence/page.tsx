import {
  ArrowUpRight,
  Link2,
  MessageCircle,
  MousePointerClick,
  UsersRound,
} from "lucide-react";

import { PageHeading } from "@/components/layout/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Presença" };

export default function PresenceModulePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Módulo planejado"
        title="Presença"
        description="Páginas públicas de links e campanhas com identidade própria, captação de leads e métricas de ponta a ponta."
        actions={<Button disabled>Criar página</Button>}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Uma página que parece uma marca</CardTitle>
            <CardDescription>
              O layout não será uma pilha genérica de botões. Cada página combina narrativa,
              destaques e ações em um grid adaptável.
            </CardDescription>
            <CardAction><Badge variant="secondary">Direção visual</Badge></CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid min-h-[420px] gap-3 rounded-2xl border bg-muted/30 p-4 sm:grid-cols-2">
              <div className="flex flex-col justify-between rounded-xl bg-primary p-6 text-primary-foreground sm:row-span-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="grid size-9 place-items-center rounded-full bg-background text-foreground">M</span>
                  Mavi
                </div>
                <div>
                  <p className="text-3xl font-semibold tracking-tight">Tecnologia que chega até você.</p>
                  <p className="mt-3 text-sm opacity-80">Produtos, atendimento e novidades em um só lugar.</p>
                </div>
                <span className="flex items-center gap-2 text-sm font-medium">
                  Falar no WhatsApp <ArrowUpRight />
                </span>
              </div>

              <div className="flex flex-col justify-between rounded-xl border bg-background p-5">
                <Badge variant="outline">Destaque da semana</Badge>
                <div>
                  <p className="text-xl font-semibold">iPhone 17</p>
                  <p className="mt-1 text-sm text-muted-foreground">Condições especiais para encomenda.</p>
                </div>
                <span className="flex items-center gap-2 text-sm font-medium">
                  Ver campanha <ArrowUpRight />
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col justify-between rounded-xl border bg-background p-4">
                  <MessageCircle className="text-muted-foreground" />
                  <span className="text-sm font-medium">Atendimento</span>
                </div>
                <div className="flex flex-col justify-between rounded-xl border bg-background p-4">
                  <Link2 className="text-muted-foreground" />
                  <span className="text-sm font-medium">Catálogo</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <span className="text-xs text-muted-foreground">Prévia conceitual · celular e desktop</span>
            <Badge variant="outline">Não genérico</Badge>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas do funil</CardTitle>
              <CardDescription>Todos os números partem dos mesmos eventos do Lab.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-4">
                <MousePointerClick className="text-muted-foreground" />
                <p className="mt-5 text-2xl font-semibold">CTR</p>
                <p className="text-xs text-muted-foreground">geral e por bloco</p>
              </div>
              <div className="rounded-xl border p-4">
                <UsersRound className="text-muted-foreground" />
                <p className="mt-5 text-2xl font-semibold">Únicos</p>
                <p className="text-xs text-muted-foreground">visitas e cliques</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Escopo do MVP</CardTitle>
              <CardDescription>Páginas, blocos, links e conversão antes de recursos comerciais.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["Editor visual", "Agendamento", "Formulários", "QR Code", "UTM", "Exportação"].map((item) => (
                <Badge key={item} variant="secondary">{item}</Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximo marco</CardTitle>
              <CardDescription>Modelar páginas e eventos antes de iniciar o editor.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Badge variant="outline">Pesquisa concluída</Badge>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft, QrCode } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Gerador de QR Code" };

export default function QrCodeModulePage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <Link href="/modules" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <ArrowLeft data-icon="inline-start" />
        Voltar aos módulos
      </Link>
      <PageHeading
        eyebrow="Novo módulo"
        title="Gerador de QR Code"
        description="Crie QR Codes para links, formulários, contatos e campanhas do Lab."
        actions={<Badge variant="secondary">Planejado</Badge>}
      />
      <Card>
        <CardHeader>
          <div className="mb-2 grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
            <QrCode className="size-5" />
          </div>
          <CardTitle>Escopo inicial anotado</CardTitle>
          <CardDescription>
            O módulo foi registrado para desenvolvimento em uma próxima etapa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <li>• QR Code para URL</li>
            <li>• QR Code para formulários</li>
            <li>• Contato e WhatsApp</li>
            <li>• Download em PNG e SVG</li>
            <li>• Cores e logotipo</li>
            <li>• Histórico por workspace</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

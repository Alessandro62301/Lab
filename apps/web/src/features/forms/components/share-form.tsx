"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ShareForm({ slug, isPublished }: { slug: string; isPublished: boolean }) {
  const [copied, setCopied] = useState(false);
  const path = `/f/${slug}`;

  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}${path}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Compartilhar</h1>
      <p className="mt-1 text-sm text-muted-foreground">Distribua o formulário por link, campanhas ou QR Code no futuro.</p>
      <Card className="mt-6">
        <CardHeader><CardTitle>Link público</CardTitle><CardDescription>{isPublished ? "O formulário está publicado e pronto para receber respostas." : "Publique o formulário no editor antes de divulgar este link."}</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input value={path} readOnly />
          <Button variant="outline" onClick={copy}>{copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}{copied ? "Copiado" : "Copiar"}</Button>
          {isPublished ? (
            <a href={path} target="_blank" rel="noreferrer" className={buttonVariants()}>
              Abrir <ExternalLink data-icon="inline-end" />
            </a>
          ) : (
            <Button disabled>Abrir <ExternalLink data-icon="inline-end" /></Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

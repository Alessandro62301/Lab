"use client";

import { useState } from "react";
import { ExternalLink, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

type ResponsesData = {
  form: { id: string; name: string; slug: string };
  submissions: Array<{
    id: string;
    status: string;
    respondentName: string;
    respondentEmail: string;
    respondentPhone: string;
    createdAt: string;
    lastSeenAt: string;
    completedAt: string | null;
    completionRate: number;
    source: string;
    leadStatus: string;
    answers: Array<{ fieldKey: string; title: string; type: string; value: string }>;
  }>;
};

const leadLabels: Record<string, string> = {
  NEW: "Novo",
  CONTACTED: "Contatado",
  QUALIFIED: "Qualificado",
  CONVERTED: "Convertido",
  LOST: "Perdido",
};

const submissionLabels: Record<string, string> = {
  IN_PROGRESS: "Parcial recuperada",
  COMPLETED: "Concluída",
  ABANDONED: "Abandonada",
  SPAM: "Spam",
};

export function ResponsesWorkspace({ data }: { data: ResponsesData }) {
  const [selectedId, setSelectedId] = useState(data.submissions[0]?.id ?? "");
  const selected = data.submissions.find((submission) => submission.id === selectedId);
  const recoveredCount = data.submissions.filter(
    (submission) => submission.status === "IN_PROGRESS",
  ).length;

  return (
    <div className="grid min-h-[calc(100vh-11rem)] overflow-hidden rounded-xl border bg-background lg:grid-cols-[320px_1fr]">
      <aside className="border-r">
        <div className="border-b px-4 py-3">
          <p className="font-medium">{data.submissions.length} respostas</p>
          <p className="text-xs text-muted-foreground">
            {recoveredCount} parciais recuperadas · mais recentes primeiro
          </p>
        </div>
        <div className="h-[calc(100vh-16rem)] overflow-y-auto">
          {data.submissions.map((submission, index) => (
            <button
              key={submission.id}
              type="button"
              onClick={() => setSelectedId(submission.id)}
              className={`flex w-full gap-3 border-b px-4 py-4 text-left transition-colors ${selectedId === submission.id ? "bg-accent" : "hover:bg-muted/50"}`}
            >
              <span className="text-xs text-muted-foreground">{data.submissions.length - index}.</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{submission.respondentName}</span>
                <span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(submission.createdAt))}
                  {submission.status === "IN_PROGRESS" && (
                    <span>{submission.completionRate}%</span>
                  )}
                </span>
              </span>
            </button>
          ))}
          {!data.submissions.length && <p className="px-4 py-10 text-center text-sm text-muted-foreground">Ainda não há respostas.</p>}
        </div>
      </aside>

      <main className="bg-muted/30 p-4 sm:p-8">
        {selected ? (
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border bg-background shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-t-4 border-t-primary px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold">{selected.respondentName}</h2>
                <p className="mt-1 text-sm text-muted-foreground">Recebido em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(new Date(selected.createdAt))}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={selected.status === "COMPLETED" ? "default" : "secondary"}>
                  {submissionLabels[selected.status] ?? selected.status}
                </Badge>
                <Badge variant="secondary">{leadLabels[selected.leadStatus] ?? selected.leadStatus}</Badge>
                <Badge>{selected.source}</Badge>
              </div>
            </div>
            {(selected.respondentEmail || selected.respondentPhone) && (
              <div className="flex flex-wrap gap-2 border-t bg-muted/20 px-6 py-3">
                {selected.respondentEmail && <a href={`mailto:${selected.respondentEmail}`} className={buttonVariants({ variant: "outline", size: "sm" })}><Mail data-icon="inline-start" /> E-mail</a>}
                {selected.respondentPhone && <a href={`https://wa.me/${selected.respondentPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}><Phone data-icon="inline-start" /> WhatsApp <ExternalLink data-icon="inline-end" /></a>}
              </div>
            )}
            <div>
              {selected.answers.map((answer) => (
                <div key={answer.fieldKey} className="border-t px-6 py-5">
                  <p className="text-sm font-medium text-primary">{answer.title}</p>
                  <p className="mt-2 text-sm leading-6">{answer.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Selecione uma resposta.</div>
        )}
      </main>
    </div>
  );
}

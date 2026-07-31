import { PageHeading } from "@/components/layout/page-heading";

export const metadata = { title: "Ajuda" };

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Suporte"
        title="Ajuda e atalhos"
        description="A documentação operacional do Lab vive na pasta Obsidian e acompanha cada módulo."
      />
      <div className="rounded-xl border bg-background p-5 text-sm shadow-xs">
        Use <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">⌘ K</kbd> como atalho reservado para a busca global.
      </div>
    </div>
  );
}

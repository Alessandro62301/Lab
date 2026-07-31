import Link from "next/link";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "editor", label: "Editor" },
  { key: "settings", label: "Opções" },
  { key: "share", label: "Compartilhar" },
  { key: "responses", label: "Respostas" },
] as const;

export function FormTabs({ formId, active }: { formId: string; active: typeof tabs[number]["key"] }) {
  return (
    <nav className="flex items-center gap-1 border-b" aria-label="Seções do formulário">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`/forms/${formId}/${tab.key}`}
          className={cn(
            "border-b-2 border-transparent px-3 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
            active === tab.key && "border-foreground font-medium text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

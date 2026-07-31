import { ContactRound, Inbox, Orbit, Store } from "lucide-react";
import type { Project } from "@/lib/mock-data";

const icons = { orbit: Orbit, inbox: Inbox, store: Store, leads: ContactRound };

export function ProjectIcon({ icon }: { icon: Project["icon"] }) {
  const Icon = icons[icon];
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground shadow-xs">
      <Icon className="size-4" />
    </span>
  );
}

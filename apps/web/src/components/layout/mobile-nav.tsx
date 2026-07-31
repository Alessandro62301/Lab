"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CheckSquare2,
  ContactRound,
  LayoutDashboard,
  NotebookPen,
  PanelsTopLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Início", href: "/", icon: LayoutDashboard },
  { label: "Projetos", href: "/projects", icon: PanelsTopLeft },
  { label: "Notas", href: "/notes", icon: NotebookPen },
  { label: "Tarefas", href: "/tasks", icon: CheckSquare2 },
  { label: "Leads", href: "/forms", icon: ContactRound },
  { label: "IA", href: "/ai", icon: Bot },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-6">
        {items.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md py-1.5 text-[11px] text-muted-foreground",
                active && "text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CheckSquare2,
  CircleHelp,
  ContactRound,
  Images,
  LayoutDashboard,
  NotebookPen,
  PanelsTopLeft,
  Settings,
  Shapes,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primaryItems = [
  { label: "Início", href: "/", icon: LayoutDashboard },
  { label: "Projetos", href: "/projects", icon: PanelsTopLeft },
  { label: "Notas", href: "/notes", icon: NotebookPen },
  { label: "Tarefas", href: "/tasks", icon: CheckSquare2 },
  { label: "Captar leads", href: "/forms", icon: ContactRound },
  { label: "Mídia", href: "/media", icon: Images },
  { label: "Central de IA", href: "/ai", icon: Bot },
];

const secondaryItems = [
  { label: "Módulos", href: "/modules", icon: Shapes },
  { label: "Configurações", href: "/settings", icon: Settings },
];

function NavLink({
  label,
  href,
  icon: Icon,
}: (typeof primaryItems)[number]) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex h-9 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
      )}
    >
      <Icon className="size-4" strokeWidth={1.8} />
      <span>{label}</span>
    </Link>
  );
}

export function AppNav() {
  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-2 py-4">
      <div className="flex flex-col gap-1">
        {primaryItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
          Workspace
        </p>
        {secondaryItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-1">
        <Link
          href="/help"
          className="flex h-9 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <CircleHelp className="size-4" strokeWidth={1.8} />
          Ajuda e atalhos
        </Link>
      </div>
    </nav>
  );
}

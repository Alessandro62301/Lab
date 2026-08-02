import Link from "next/link";
import { Bell, Command, Plus, Search } from "lucide-react";
import { AppNav } from "@/components/layout/app-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "@/components/auth/logout-button";
import type { LabSession } from "@/server/auth/session";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function AppShell({ children, session }: { children: React.ReactNode; session: LabSession }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 px-4">
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand text-sm font-semibold text-brand-foreground shadow-sm">
              L
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">Lab</span>
              <span className="block truncate text-xs text-muted-foreground">{session.workspaceId}</span>
            </span>
          </Link>
        </div>
        <Separator />
        <AppNav />
        <Separator />
        <div className="flex items-center gap-3 p-4">
          <Avatar className="size-8">
            <AvatarFallback>{initials(session.user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{session.user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{session.role}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold lg:hidden">
            <span className="grid size-8 place-items-center rounded-lg bg-brand text-sm text-brand-foreground">L</span>
            Lab
          </Link>
          <button className="hidden h-9 min-w-72 items-center gap-2 rounded-lg border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted md:flex">
            <Search className="size-4" />
            Buscar em todo o Lab...
            <span className="ml-auto flex items-center gap-0.5 rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]">
              <Command className="size-3" /> K
            </span>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Notificações">
              <Bell />
            </Button>
            <Button size="sm">
              <Plus data-icon="inline-start" />
              Criar
            </Button>
          </div>
        </header>
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1480px] px-4 pb-24 pt-8 md:px-8 lg:pb-10">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

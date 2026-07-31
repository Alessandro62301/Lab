"use client";

import { CalendarDays, ListFilter, MoreHorizontal, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tasks, type Task } from "@/lib/mock-data";

const columns: Task["status"][] = ["Backlog", "A fazer", "Em andamento", "Em revisão", "Concluído"];

function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  return (
    <Badge variant={priority === "Alta" ? "default" : "secondary"}>
      {priority}
    </Badge>
  );
}

export function TaskBoard() {
  return (
    <Tabs defaultValue="board" className="gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList>
          <TabsTrigger value="board">Kanban</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ListFilter data-icon="inline-start" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <CalendarDays data-icon="inline-start" />
            Prazo
          </Button>
          <Button size="sm">
            <Plus data-icon="inline-start" />
            Nova tarefa
          </Button>
        </div>
      </div>

      <TabsContent value="board">
        <div className="grid gap-3 overflow-x-auto pb-3 xl:grid-cols-5">
          {columns.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column);
            return (
              <section key={column} className="min-w-64 rounded-xl bg-muted/40 p-2.5">
                <header className="mb-2 flex items-center gap-2 px-1 py-1">
                  <span className="size-2 rounded-full bg-muted-foreground/50" />
                  <h2 className="text-xs font-semibold">{column}</h2>
                  <span className="text-xs text-muted-foreground">{columnTasks.length}</span>
                  <Button className="ml-auto" variant="ghost" size="icon-xs" aria-label={`Adicionar em ${column}`}>
                    <Plus />
                  </Button>
                </header>
                <div className="flex flex-col gap-2">
                  {columnTasks.map((task) => (
                    <article key={task.code} className="flex flex-col gap-4 rounded-lg border bg-background p-3 shadow-xs">
                      <div className="flex items-start gap-2">
                        <p className="flex-1 text-sm font-medium leading-5">{task.title}</p>
                        <Button variant="ghost" size="icon-xs" aria-label="Opções da tarefa">
                          <MoreHorizontal />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-muted-foreground">{task.code}</span>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">{task.project}</p>
                    </article>
                  ))}
                  {columnTasks.length === 0 ? (
                    <button className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground hover:bg-background">
                      + Adicionar tarefa
                    </button>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="list">
        <div className="overflow-hidden rounded-xl border bg-background shadow-xs">
          <div className="hidden grid-cols-[100px_minmax(260px,1fr)_160px_130px_140px] border-b bg-muted/30 px-4 py-2.5 text-xs font-medium text-muted-foreground md:grid">
            <span>ID</span>
            <span>Tarefa</span>
            <span>Projeto</span>
            <span>Prioridade</span>
            <span>Status</span>
          </div>
          {tasks.map((task) => (
            <div key={task.code} className="grid gap-2 border-b px-4 py-3 last:border-b-0 hover:bg-muted/30 md:grid-cols-[100px_minmax(260px,1fr)_160px_130px_140px] md:items-center">
              <span className="font-mono text-xs text-muted-foreground">{task.code}</span>
              <span className="text-sm font-medium">{task.title}</span>
              <span className="text-xs text-muted-foreground">{task.project}</span>
              <div><PriorityBadge priority={task.priority} /></div>
              <span className="text-xs text-muted-foreground">{task.status}</span>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}

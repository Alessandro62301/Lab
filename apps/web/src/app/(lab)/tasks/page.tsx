import { PageHeading } from "@/components/layout/page-heading";
import { TaskBoard } from "@/components/tasks/task-board";

export const metadata = { title: "Tarefas" };

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Execução"
        title="Tarefas"
        description="Um fluxo leve para transformar ideias e decisões em trabalho visível."
      />
      <TaskBoard />
    </div>
  );
}

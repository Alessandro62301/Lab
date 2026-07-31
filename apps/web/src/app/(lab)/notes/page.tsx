import { PageHeading } from "@/components/layout/page-heading";
import { NotesWorkspace } from "@/components/notes/notes-workspace";

export const metadata = { title: "Notas" };

export default function NotesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Conhecimento"
        title="Notas"
        description="Páginas simples em Markdown, próximas dos projetos e decisões que explicam."
      />
      <NotesWorkspace />
    </div>
  );
}

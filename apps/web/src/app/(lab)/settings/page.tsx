import { PageHeading } from "@/components/layout/page-heading";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Configurações" };

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Workspace"
        title="Configurações"
        description="Identidade, membros, permissões e preferências compartilhadas do Mavi Lab."
      />
      <div className="rounded-xl border bg-background p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Mavi Lab</p>
            <p className="mt-1 text-xs text-muted-foreground">mavi-lab · 1 membro</p>
          </div>
          <Badge>Owner</Badge>
        </div>
      </div>
    </div>
  );
}

import {
  Bot,
  ContactRound,
  FolderKanban,
  Inbox,
  Link2,
  NotebookPen,
  PanelsTopLeft,
  QrCode,
  type LucideIcon,
} from "lucide-react";

export type LabModule = {
  key: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  status: "active" | "planned";
  projectScoped: boolean;
};

export const moduleRegistry: LabModule[] = [
  {
    key: "lead-capture",
    name: "Captação de leads",
    description: "Formulários personalizados, fluxos e respostas.",
    href: "/forms",
    icon: ContactRound,
    status: "active",
    projectScoped: true,
  },
  {
    key: "projects",
    name: "Projetos",
    description: "Planejamento e visão de cada iniciativa.",
    href: "/projects",
    icon: PanelsTopLeft,
    status: "active",
    projectScoped: false,
  },
  {
    key: "notes",
    name: "Notas",
    description: "Conhecimento conectado em páginas Markdown.",
    href: "/notes",
    icon: NotebookPen,
    status: "active",
    projectScoped: true,
  },
  {
    key: "tasks",
    name: "Tarefas",
    description: "Backlog, lista e fluxo Kanban.",
    href: "/tasks",
    icon: FolderKanban,
    status: "active",
    projectScoped: true,
  },
  {
    key: "ai-hub",
    name: "Central de IA",
    description: "Provedores, modelos e políticas de uso.",
    href: "/ai",
    icon: Bot,
    status: "active",
    projectScoped: false,
  },
  {
    key: "data-inbox",
    name: "Data Inbox",
    description: "Entrada e normalização de dados desestruturados.",
    href: "/modules/data-inbox",
    icon: Inbox,
    status: "planned",
    projectScoped: true,
  },
  {
    key: "presence",
    name: "Presença",
    description: "Páginas públicas de links, campanhas e métricas de acesso.",
    href: "/modules/presence",
    icon: Link2,
    status: "planned",
    projectScoped: true,
  },
  {
    key: "qr-code-generator",
    name: "Gerador de QR Code",
    description: "Criação de QR Codes para links, formulários, contatos e campanhas.",
    href: "/modules/qr-code",
    icon: QrCode,
    status: "planned",
    projectScoped: false,
  },
];

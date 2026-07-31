export type Project = {
  name: string;
  slug: string;
  description: string;
  status: "Ativo" | "Planejamento" | "Pausado";
  progress: number;
  updatedAt: string;
  icon: "orbit" | "inbox" | "store" | "leads";
};

export type Note = {
  title: string;
  excerpt: string;
  project: string;
  updatedAt: string;
  icon: string;
};

export type Task = {
  code: string;
  title: string;
  project: string;
  priority: "Baixa" | "Média" | "Alta";
  status: "Backlog" | "A fazer" | "Em andamento" | "Em revisão" | "Concluído";
};

export const projects: Project[] = [
  {
    name: "Captação de Leads",
    slug: "captacao-de-leads",
    description: "Formulários personalizados e gestão das respostas.",
    status: "Ativo",
    progress: 62,
    updatedAt: "agora",
    icon: "leads",
  },
  {
    name: "Lab Core",
    slug: "lab-core",
    description: "Fundação compartilhada, navegação e sistema de módulos.",
    status: "Ativo",
    progress: 38,
    updatedAt: "há 12 min",
    icon: "orbit",
  },
  {
    name: "Data Inbox",
    slug: "data-inbox",
    description: "Entrada e normalização de dados desestruturados.",
    status: "Planejamento",
    progress: 12,
    updatedAt: "ontem",
    icon: "inbox",
  },
  {
    name: "Mavi Operações",
    slug: "mavi-operacoes",
    description: "Processos internos, fornecedores e catálogo.",
    status: "Planejamento",
    progress: 6,
    updatedAt: "há 3 dias",
    icon: "store",
  },
];

export const notes: Note[] = [
  {
    title: "Visão do Lab",
    excerpt: "Uma casa única para projetos, conhecimento, tarefas e automações.",
    project: "Lab Core",
    updatedAt: "há 18 min",
    icon: "✦",
  },
  {
    title: "Decisões da fundação",
    excerpt: "Por que começamos com um monorepo simples e módulos internos.",
    project: "Lab Core",
    updatedAt: "ontem",
    icon: "⌁",
  },
  {
    title: "Data Inbox — Brief",
    excerpt: "Escopo inicial do primeiro módulo de produto registrado no Lab.",
    project: "Data Inbox",
    updatedAt: "há 2 dias",
    icon: "↳",
  },
  {
    title: "Ideias para automações",
    excerpt: "Rascunhos de fluxos usando OpenAI, Claude e modelos locais.",
    project: "Lab Core",
    updatedAt: "há 4 dias",
    icon: "◈",
  },
];

export const tasks: Task[] = [
  { code: "LAB-1", title: "Definir navegação principal", project: "Lab Core", priority: "Alta", status: "Concluído" },
  { code: "LAB-2", title: "Modelar permissões por workspace", project: "Lab Core", priority: "Alta", status: "Em andamento" },
  { code: "LAB-3", title: "Criar editor de notas", project: "Lab Core", priority: "Média", status: "A fazer" },
  { code: "LAB-4", title: "Preparar adapters de IA", project: "Lab Core", priority: "Média", status: "Em revisão" },
  { code: "DATA-1", title: "Especificar o MVP do Data Inbox", project: "Data Inbox", priority: "Baixa", status: "Backlog" },
  { code: "DATA-2", title: "Mapear formatos de entrada", project: "Data Inbox", priority: "Média", status: "Backlog" },
  { code: "LAB-5", title: "Documentar sistema de módulos", project: "Lab Core", priority: "Baixa", status: "A fazer" },
];

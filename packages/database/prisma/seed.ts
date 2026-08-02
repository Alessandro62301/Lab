import {
  AiProvider,
  FormFieldType,
  FormStatus,
  LeadStatus,
  ModuleStatus,
  PageBlockType,
  PrismaClient,
  ProjectStatus,
  PublicPageStatus,
  TaskPriority,
  TaskStatus,
  SubmissionStatus,
  WorkspaceRole,
} from "../generated/client";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { hash } from "bcryptjs";

config({
  path: fileURLToPath(new URL("../../../.env", import.meta.url)),
});

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.INITIAL_ADMIN_EMAIL ?? process.env.DEV_USER_EMAIL ?? "junior@lab.local").toLowerCase();
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD ?? (process.env.NODE_ENV === "production" ? "" : "lab-local-12345");
  if (adminPassword.length < 12) throw new Error("INITIAL_ADMIN_PASSWORD must have at least 12 characters");
  const passwordHash = await hash(adminPassword, 12);
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { name: process.env.INITIAL_ADMIN_NAME ?? "Junior", email: adminEmail, passwordHash },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: "mavi-lab" },
    update: {},
    create: {
      name: "Mavi Lab",
      slug: "mavi-lab",
      description: "Workspace principal para produtos, operações e experimentos.",
    },
  });

  await prisma.membership.upsert({
    where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } },
    update: { role: WorkspaceRole.OWNER },
    create: { userId: user.id, workspaceId: workspace.id, role: WorkspaceRole.OWNER },
  });

  const dataInbox = await prisma.project.upsert({
    where: { workspaceId_slug: { workspaceId: workspace.id, slug: "data-inbox" } },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: "Data Inbox",
      slug: "data-inbox",
      description: "Transforma fontes desestruturadas em dados revisáveis.",
      icon: "inbox",
      status: ProjectStatus.PLANNING,
      progress: 12,
    },
  });

  const labCore = await prisma.project.upsert({
    where: { workspaceId_slug: { workspaceId: workspace.id, slug: "lab-core" } },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: "Lab Core",
      slug: "lab-core",
      description: "Fundação compartilhada, navegação e sistema de módulos.",
      icon: "orbit",
      status: ProjectStatus.ACTIVE,
      progress: 38,
    },
  });

  const leadCapture = await prisma.project.upsert({
    where: { workspaceId_slug: { workspaceId: workspace.id, slug: "captacao-de-leads" } },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: "Captação de Leads",
      slug: "captacao-de-leads",
      description: "Formulários personalizados, respostas e organização dos novos contatos.",
      icon: "contact-round",
      status: ProjectStatus.ACTIVE,
      progress: 28,
    },
  });

  const presence = await prisma.project.upsert({
    where: { workspaceId_slug: { workspaceId: workspace.id, slug: "presenca" } },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: "Presença",
      slug: "presenca",
      description: "Páginas públicas de links, campanhas e métricas de audiência.",
      icon: "link-2",
      status: ProjectStatus.PLANNING,
      progress: 0,
    },
  });

  const moduleDefinitions = [
    ["projects", "Projetos", "Planejamento e visão de cada iniciativa."],
    ["notes", "Notas", "Conhecimento conectado em páginas Markdown."],
    ["tasks", "Tarefas", "Backlog, lista e fluxo Kanban."],
    ["ai-hub", "Central de IA", "Configuração central de provedores e modelos."],
    ["lead-capture", "Captação de Leads", "Formulários personalizados e entrada de novos contatos."],
    ["data-inbox", "Data Inbox", "Entrada e normalização de dados desestruturados."],
    ["presence", "Presença", "Páginas públicas de links, campanhas e métricas de acesso."],
    ["qr-code-generator", "Gerador de QR Code", "Criação de QR Codes para links, formulários, contatos e campanhas."],
  ] as const;

  for (const [key, name, description] of moduleDefinitions) {
    const definition = await prisma.moduleDefinition.upsert({
      where: { key },
      update: { name, description },
      create: { key, name, description },
    });
    await prisma.workspaceModule.upsert({
      where: { workspaceId_moduleId: { workspaceId: workspace.id, moduleId: definition.id } },
      update: {},
      create: {
        workspaceId: workspace.id,
        moduleId: definition.id,
        projectId:
          key === "data-inbox"
            ? dataInbox.id
            : key === "presence"
              ? presence.id
            : key === "lead-capture"
              ? leadCapture.id
              : key === "projects"
                ? labCore.id
                : null,
        status:
          key === "data-inbox" || key === "presence" || key === "qr-code-generator"
            ? ModuleStatus.PLANNED
            : ModuleStatus.ACTIVE,
      },
    });
  }

  const presencePage = await prisma.publicPage.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.id,
        name: "Maria Victoria | Apple",
      },
    },
    update: {
      projectId: presence.id,
      slug: "mavi",
      status: PublicPageStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    create: {
      workspaceId: workspace.id,
      projectId: presence.id,
      createdById: user.id,
      name: "Maria Victoria | Apple",
      slug: "mavi",
      bio: "Importamos o seu sonho Apple com atendimento próximo, validação jurídica e nota fiscal.",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=85",
      status: PublicPageStatus.PUBLISHED,
      themeJson: {
        backgroundColor: "#71384f",
        surfaceColor: "#a34f76",
        textColor: "#ffffff",
        accentColor: "#b83872",
        fontFamily: "Geist Mono",
        fontSize: 14,
        iconSize: 24,
        borderRadius: 14,
      },
      publishedAt: new Date(),
    },
  });

  const presenceBlocks = [
    {
      key: "como-funciona",
      type: PageBlockType.LINK,
      title: "Como funciona sua encomenda aqui na Mavi",
      description: "Entenda o processo antes de escolher seu produto.",
      url: "https://www.instagram.com/",
      mediaUrl: null,
      position: 0,
      settingsJson: { icon: "instagram" },
    },
    {
      key: "tabela-valores",
      type: PageBlockType.LINK,
      title: "Tabela de valores lacrados Mavi",
      description: "Valores atualizados dos produtos disponíveis.",
      url: "https://www.instagram.com/",
      mediaUrl: null,
      position: 1,
      settingsJson: { icon: "badge-percent" },
    },
    {
      key: "ofertas-whatsapp",
      type: PageBlockType.LINK,
      title: "Ofertas da Mavi | Comunidade do WhatsApp",
      description: "Entre para receber oportunidades e novidades.",
      url: "https://wa.me/5521999999999",
      mediaUrl: null,
      position: 2,
      settingsJson: { icon: "message-circle" },
    },
    {
      key: "atendimento-direto",
      type: PageBlockType.FEATURE,
      title: "Quer entender como fazer sua encomenda comigo?",
      description: "Se sim, pode me chamar direto aqui no WhatsApp! 💗",
      url: "https://wa.me/5521999999999",
      mediaUrl: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=900&q=85",
      position: 3,
      settingsJson: { layout: "media" },
    },
    {
      key: "apple-empresas",
      type: PageBlockType.LINK,
      title: "Apple para empresas com condições exclusivas!",
      description: "Atendimento personalizado para compras corporativas.",
      url: "https://wa.me/5521999999999",
      mediaUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=180&q=80",
      position: 4,
      settingsJson: { compact: true },
    },
    {
      key: "produto-apple",
      type: PageBlockType.TEXT,
      title: "Qual produto Apple está procurando?",
      description: "Escolha o caminho mais rápido para encontrar seu próximo produto.",
      url: null,
      mediaUrl: null,
      position: 5,
      settingsJson: { align: "center" },
    },
    {
      key: "galeria-produtos",
      type: PageBlockType.GALLERY,
      title: "Produtos em destaque",
      description: "Uma seleção de produtos e cores disponíveis para encomenda.",
      url: null,
      mediaUrl: "https://images.unsplash.com/photo-1592286927505-1def25115558?auto=format&fit=crop&w=900&q=85",
      position: 6,
      settingsJson: {
        images: [
          "https://images.unsplash.com/photo-1592286927505-1def25115558?auto=format&fit=crop&w=700&q=85",
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=85",
          "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=700&q=85"
        ]
      },
    },
    {
      key: "captar-encomenda",
      type: PageBlockType.FORM,
      title: "Quer adiantar sua encomenda?",
      description: "Se você já sabe o produto que quer, preencha seus dados para continuarmos.",
      url: "http://localhost:3000/f/encomenda-mavi",
      mediaUrl: null,
      position: 7,
      settingsJson: { formSlug: "encomenda-mavi" },
    },
  ];

  await prisma.pageBlock.updateMany({
    where: { publicPageId: presencePage.id, archivedAt: null },
    data: { position: { increment: 10000 } },
  });

  for (const block of presenceBlocks) {
    await prisma.pageBlock.upsert({
      where: { publicPageId_key: { publicPageId: presencePage.id, key: block.key } },
      update: { ...block, archivedAt: null },
      create: { ...block, publicPageId: presencePage.id },
    });
  }

  const leadForm = await prisma.form.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.id,
        name: "Formulário de encomenda da Mavi",
      },
    },
    update: {
      status: FormStatus.PUBLISHED,
      projectId: leadCapture.id,
      buttonLabel: "Continuar",
    },
    create: {
      workspaceId: workspace.id,
      projectId: leadCapture.id,
      createdById: user.id,
      name: "Formulário de encomenda da Mavi",
      slug: "encomenda-mavi",
      description: "Captação de clientes interessados em encomendar produtos Apple.",
      status: FormStatus.PUBLISHED,
      welcomeTitle: "Oiiie, aqui é a Mavi",
      welcomeDescription: "Precisamos somente de alguns dados para preparar sua encomenda. Vamos seguir?",
      thankYouTitle: "Recebemos seus dados!",
      thankYouDescription: "Nossa equipe entrará em contato pelo WhatsApp.",
      buttonLabel: "Continuar",
      primaryColor: "#a63a6d",
      backgroundColor: "#fffafb",
      borderRadius: 14,
      collectPartial: true,
      notifyEmail: true,
      publishedAt: new Date("2026-07-01T12:00:00.000Z"),
    },
  });

  const formFields = [
    {
      key: "welcome",
      type: FormFieldType.WELCOME,
      title: "Oiiie, aqui é a Mavi",
      description: "Precisamos somente de alguns dados para preparar sua encomenda. Vamos seguir?",
      position: 0,
      isRequired: false,
      optionsJson: null,
    },
    {
      key: "name",
      type: FormFieldType.NAME,
      title: "Qual é o seu nome completo?",
      description: "Como você gostaria de ser chamado?",
      position: 1,
      isRequired: true,
      optionsJson: null,
    },
    {
      key: "email",
      type: FormFieldType.EMAIL,
      title: "Agora vamos escolher seu melhor e-mail",
      description: "Usaremos apenas para falar sobre sua encomenda.",
      position: 2,
      isRequired: true,
      optionsJson: null,
    },
    {
      key: "phone",
      type: FormFieldType.PHONE,
      title: "Seu telefone para contato via WhatsApp",
      description: "Inclua o DDD.",
      position: 3,
      isRequired: true,
      optionsJson: null,
    },
    {
      key: "address",
      type: FormFieldType.ADDRESS,
      title: "Qual é o endereço para entrega?",
      description: "Digite o CEP e confira o endereço preenchido automaticamente.",
      position: 4,
      isRequired: true,
      optionsJson: null,
    },
    {
      key: "product",
      type: FormFieldType.SINGLE_CHOICE,
      title: "Qual produto você gostaria de encomendar comigo?",
      description: "Escolha a opção mais próxima do que procura.",
      position: 5,
      isRequired: true,
      optionsJson: ["iPhone 17", "iPhone 17 Pro", "iPhone 17 Pro Max", "MacBook", "Outro"],
    },
    {
      key: "source",
      type: FormFieldType.SINGLE_CHOICE,
      title: "Como você conheceu a Mavi?",
      description: null,
      position: 6,
      isRequired: false,
      optionsJson: ["Indicação", "Instagram", "Google", "Cliente antigo", "Outro"],
    },
    {
      key: "terms",
      type: FormFieldType.TERMS,
      title: "Autorizo o contato da equipe Mavi",
      description: "Seus dados serão usados somente para atender esta solicitação.",
      position: 7,
      isRequired: true,
      optionsJson: null,
    },
    {
      key: "thanks",
      type: FormFieldType.THANK_YOU,
      title: "Recebemos seus dados!",
      description: "Nossa equipe entrará em contato pelo WhatsApp.",
      position: 8,
      isRequired: false,
      optionsJson: null,
    },
  ] as const;

  const fieldByKey = new Map<string, { id: string }>();
  await prisma.formField.updateMany({
    where: { formId: leadForm.id, archivedAt: null },
    data: { position: { increment: 10000 } },
  });
  for (const field of formFields) {
    const savedField = await prisma.formField.upsert({
      where: { formId_key: { formId: leadForm.id, key: field.key } },
      update: {
        type: field.type,
        title: field.title,
        description: field.description,
        position: field.position,
        isRequired: field.isRequired,
        optionsJson: field.optionsJson,
      },
      create: {
        formId: leadForm.id,
        ...field,
      },
    });
    fieldByKey.set(field.key, savedField);
  }

  const sampleResponses = [
    {
      externalKey: "seed-lead-dayanne",
      name: "Dayanne Ferreira Bezerra",
      email: "ferredaybezerra@gmail.com",
      phone: "+55 21 97747-1874",
      product: "iPhone 17 256GB",
      source: "Indicação",
      completedAt: new Date("2026-07-02T22:01:00.000Z"),
    },
    {
      externalKey: "seed-lead-rafael",
      name: "Rafael Castanon de Assis",
      email: "rafael.assis@example.com",
      phone: "+55 21 98821-4012",
      product: "iPhone 17 Pro Max",
      source: "Instagram",
      completedAt: new Date("2026-07-18T13:24:00.000Z"),
    },
    {
      externalKey: "seed-lead-leticia",
      name: "Letícia Louzada",
      email: "leticia.louzada@example.com",
      phone: "+55 21 99211-0834",
      product: "MacBook",
      source: "Cliente antigo",
      completedAt: new Date("2026-07-27T16:42:00.000Z"),
    },
  ] as const;

  for (const response of sampleResponses) {
    const emailNormalized = response.email.toLowerCase();
    const phoneNormalized = response.phone.replace(/\D/g, "");
    const lead = await prisma.lead.upsert({
      where: {
        workspaceId_emailNormalized: {
          workspaceId: workspace.id,
          emailNormalized,
        },
      },
      update: {
        name: response.name,
        phone: response.phone,
        phoneNormalized,
        lastSeenAt: response.completedAt,
      },
      create: {
        workspaceId: workspace.id,
        name: response.name,
        email: response.email,
        emailNormalized,
        phone: response.phone,
        phoneNormalized,
        status: LeadStatus.NEW,
        source: response.source,
        firstSeenAt: response.completedAt,
        lastSeenAt: response.completedAt,
      },
    });

    const submission = await prisma.formSubmission.upsert({
      where: { externalKey: response.externalKey },
      update: {
        leadId: lead.id,
        respondentName: response.name,
        respondentEmail: response.email,
        respondentPhone: response.phone,
      },
      create: {
        externalKey: response.externalKey,
        workspaceId: workspace.id,
        formId: leadForm.id,
        leadId: lead.id,
        status: SubmissionStatus.COMPLETED,
        respondentName: response.name,
        respondentEmail: response.email,
        respondentPhone: response.phone,
        utmJson: { utm_source: response.source.toLowerCase().replace(" ", "_") },
        startedAt: new Date(response.completedAt.getTime() - 4 * 60 * 1000),
        lastSeenAt: response.completedAt,
        completedAt: response.completedAt,
      },
    });

    const answerValues = {
      name: response.name,
      email: response.email,
      phone: response.phone,
      product: response.product,
      source: response.source,
      terms: "Sim",
    };

    for (const [fieldKey, value] of Object.entries(answerValues)) {
      const field = fieldByKey.get(fieldKey);
      if (!field) continue;
      await prisma.formAnswer.upsert({
        where: {
          submissionId_fieldId: {
            submissionId: submission.id,
            fieldId: field.id,
          },
        },
        update: { valueJson: value, textValue: value },
        create: {
          submissionId: submission.id,
          fieldId: field.id,
          valueJson: value,
          textValue: value,
        },
      });
    }
  }

  const notes = [
    ["visao-do-lab", "Visão do Lab", "# Visão do Lab\n\nUma casa única para projetos, conhecimento, tarefas e automações."],
    ["decisoes-da-fundacao", "Decisões da fundação", "# Decisões\n\n- Monorepo simples\n- Next.js App Router\n- PostgreSQL e Prisma\n- Módulos internos por registro"],
    ["data-inbox-brief", "Data Inbox — Brief", "# Data Inbox\n\nPrimeiro módulo de produto registrado no Lab."],
  ] as const;

  for (const [slug, title, content] of notes) {
    await prisma.note.upsert({
      where: { workspaceId_slug: { workspaceId: workspace.id, slug } },
      update: {},
      create: {
        workspaceId: workspace.id,
        projectId: slug === "data-inbox-brief" ? dataInbox.id : labCore.id,
        authorId: user.id,
        title,
        slug,
        content,
        isFavorite: slug === "visao-do-lab",
      },
    });
  }

  const tasks = [
    [1, "Definir navegação principal", TaskStatus.DONE, TaskPriority.HIGH, 0],
    [2, "Modelar permissões por workspace", TaskStatus.IN_PROGRESS, TaskPriority.HIGH, 0],
    [3, "Criar editor de notas", TaskStatus.TODO, TaskPriority.MEDIUM, 0],
    [4, "Preparar adapters de IA", TaskStatus.IN_REVIEW, TaskPriority.MEDIUM, 0],
    [5, "Especificar o MVP do Data Inbox", TaskStatus.BACKLOG, TaskPriority.LOW, 0],
  ] as const;

  for (const [code, title, status, priority, position] of tasks) {
    await prisma.task.upsert({
      where: { workspaceId_code: { workspaceId: workspace.id, code } },
      update: {},
      create: {
        workspaceId: workspace.id,
        projectId: code === 5 ? dataInbox.id : labCore.id,
        creatorId: user.id,
        assigneeId: user.id,
        code,
        title,
        status,
        priority,
        position,
        completedAt: status === TaskStatus.DONE ? new Date() : null,
      },
    });
  }

  for (const provider of [AiProvider.OPENAI, AiProvider.ANTHROPIC]) {
    await prisma.aiProviderConfig.upsert({
      where: { workspaceId_provider: { workspaceId: workspace.id, provider } },
      update: {},
      create: {
        workspaceId: workspace.id,
        provider,
        label: provider === AiProvider.OPENAI ? "OpenAI" : "Claude",
        defaultModel: null,
        isEnabled: false,
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

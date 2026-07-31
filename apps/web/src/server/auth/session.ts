import "server-only";

export type LabSession = {
  userId: string;
  workspaceId: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  user: {
    name: string;
    email: string;
    image?: string;
  };
};

/**
 * Adapter provisório. Substituir por Auth.js sem alterar os serviços de domínio.
 * O workspace vem da sessão validada, nunca de um campo livre enviado pelo cliente.
 */
export async function getSession(): Promise<LabSession> {
  return {
    userId: "dev-user",
    workspaceId: "mavi-lab",
    role: "OWNER",
    user: {
      name: "Junior",
      email: process.env.DEV_USER_EMAIL ?? "junior@lab.local",
    },
  };
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}

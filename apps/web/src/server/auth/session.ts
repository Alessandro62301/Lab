import "server-only";

import { getServerSession } from "next-auth";
import { db } from "@lab/database";
import { authOptions } from "./options";

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
export async function getSession(): Promise<LabSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.userId || !session.workspaceId || !session.user?.email) return null;

  const membership = await db.membership.findFirst({
    where: {
      userId: session.userId,
      workspace: { slug: session.workspaceId, archivedAt: null },
    },
    include: { workspace: true, user: true },
  });
  if (!membership) return null;

  return {
    userId: membership.userId,
    workspaceId: membership.workspace.slug,
    role: membership.role,
    user: {
      name: membership.user.name ?? membership.user.email,
      email: membership.user.email,
      image: membership.user.image ?? undefined,
    },
  };
}

export async function requireSession(
  allowedRoles?: Array<LabSession["role"]>,
): Promise<LabSession> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

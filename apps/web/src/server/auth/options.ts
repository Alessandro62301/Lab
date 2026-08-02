import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@lab/database";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
  workspace: z.string().trim().toLowerCase().optional(),
});

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "E-mail e senha",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
        workspace: { label: "Workspace", type: "text" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
          include: {
            memberships: {
              where: {
                workspace: {
                  archivedAt: null,
                  ...(parsed.data.workspace ? { slug: parsed.data.workspace } : {}),
                },
              },
              include: { workspace: true },
              orderBy: { createdAt: "asc" },
              take: 1,
            },
          },
        });
        const membership = user?.memberships[0];
        if (!user?.passwordHash || !membership) return null;
        if (!await compare(parsed.data.password, user.passwordHash)) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          workspaceId: membership.workspace.slug,
          role: membership.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.workspaceId = user.workspaceId;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId ?? token.sub ?? "");
      }
      session.userId = String(token.userId ?? token.sub ?? "");
      session.workspaceId = String(token.workspaceId ?? "");
      session.role = token.role ?? "VIEWER";
      return session;
    },
  },
};

import type { DefaultSession } from "next-auth";
import type { WorkspaceRole } from "@lab/database";

declare module "next-auth" {
  interface Session {
    userId: string;
    workspaceId: string;
    role: WorkspaceRole;
    user: DefaultSession["user"] & { id: string };
  }

  interface User {
    workspaceId: string;
    role: WorkspaceRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    workspaceId?: string;
    role?: WorkspaceRole;
  }
}

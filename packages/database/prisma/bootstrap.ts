import { hash } from "bcryptjs";
import { PrismaClient, WorkspaceRole } from "../generated/client";

const prisma = new PrismaClient();

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function main() {
  const email = required("INITIAL_ADMIN_EMAIL").toLowerCase();
  const password = required("INITIAL_ADMIN_PASSWORD");
  const workspaceSlug = required("INITIAL_WORKSPACE_SLUG").toLowerCase();
  const name = process.env.INITIAL_ADMIN_NAME?.trim() || "Administrador";
  const workspaceName = process.env.INITIAL_WORKSPACE_NAME?.trim() || "Lab";

  if (password.length < 12) {
    throw new Error("INITIAL_ADMIN_PASSWORD must have at least 12 characters");
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(workspaceSlug)) {
    throw new Error("INITIAL_WORKSPACE_SLUG must contain lowercase letters, numbers and hyphens only");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  const passwordHash = existingUser?.passwordHash ?? await hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: existingUser?.passwordHash ? { name } : { name, passwordHash },
    create: { email, name, passwordHash },
  });
  const workspace = await prisma.workspace.upsert({
    where: { slug: workspaceSlug },
    update: { name: workspaceName, archivedAt: null },
    create: { name: workspaceName, slug: workspaceSlug },
  });
  await prisma.membership.upsert({
    where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } },
    update: { role: WorkspaceRole.OWNER },
    create: { userId: user.id, workspaceId: workspace.id, role: WorkspaceRole.OWNER },
  });

  console.log(`Bootstrap complete for ${email} in ${workspaceSlug}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

import { AppShell } from "@/components/layout/app-shell";
import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/session";

export default async function LabLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  return <AppShell session={session}>{children}</AppShell>;
}

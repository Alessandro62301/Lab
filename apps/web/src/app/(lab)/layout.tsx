import { AppShell } from "@/components/layout/app-shell";

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

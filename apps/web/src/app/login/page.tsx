import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/server/auth/session";
import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  if (await getSession()) redirect("/");
  const params = await searchParams;
  const callbackUrl = params.callbackUrl?.startsWith("/") ? params.callbackUrl : "/";

  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand text-lg font-semibold text-brand-foreground shadow-sm">L</span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Acessar o Lab</h1>
          <p className="mt-1 text-sm text-muted-foreground">Entre com sua conta para acessar o workspace.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo de volta</CardTitle>
            <CardDescription>Sua sessão é protegida e expira após oito horas.</CardDescription>
          </CardHeader>
          <CardContent><LoginForm callbackUrl={callbackUrl} /></CardContent>
        </Card>
      </div>
    </main>
  );
}

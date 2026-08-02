"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { LoaderCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      workspace: data.get("workspace"),
      callbackUrl,
      redirect: false,
    });

    if (!result?.ok) {
      setError("E-mail, senha ou workspace inválido.");
      setPending(false);
      return;
    }
    window.location.assign(result.url ?? callbackUrl);
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="workspace">Workspace</Label>
        <Input id="workspace" name="workspace" placeholder="mavi-lab" autoComplete="organization" />
        <p className="text-xs text-muted-foreground">Opcional quando você participa de apenas um workspace.</p>
      </div>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <LogIn />}
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
